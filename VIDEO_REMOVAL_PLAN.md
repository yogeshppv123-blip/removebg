# Video Background Removal Implementation Plan

## Overview
Video background removal is significantly more complex than static image removal due to the volume of data and the need for temporal consistency.

## Technical Architecture

### 1. Processing Pipeline
- **Frame Extraction**: Use `ffmpeg` to extract frames from the uploaded video.
- **Batch Processing**: Use `rembg` session to process frames in batches (improves performance).
- **Alpha Masking**: Each frame results in a mask.
- **Video Reconstruction**: Use `ffmpeg` to combine masks/processed frames back into a video stream.

### 2. Infrastructure (Queue System)
- **Message Broker**: Redis
- **Task Runner**: Celery (Python) or BullMQ (Node.js)
- **Status Tracking**: Track progress (e.g., "Processing Frame 45/300") in MongoDB.

### 3. Proposed Schema Updates
- `ImageSchema` -> `MediaSchema`
- New Fields: `type` (image/video), `status` (pending, processing, completed, failed), `videoUrl`.

## Implementation Steps

### Phase 1: Worker Setup (Python)
1. Install `ffmpeg` on the server.
2. Implement a script that:
   - Takes a `video_path`.
   - Extracts frames to a temporary directory.
   - Iterates through frames and applies `rembg.remove()`.
   - Re-assembles frames using `ffmpeg`.

### Phase 2: Bridge API Integration
1. Add `/upload-video` endpoint.
2. Add a background job runner.
3. Add a polling endpoint `/status/:id` to track progress.

### Phase 3: Optimization
- **GPU Acceleration**: Ensure `onnxruntime-gpu` is used.
- **Parallelism**: Process multiple frames in parallel if CPU/GPU memory allows.

## Example Python Worker Logic (Concept)
```python
import subprocess
from rembg import remove, new_session

def process_video(input_path, output_path):
    # 1. Extract frames
    subprocess.run(["ffmpeg", "-i", input_path, "temp/frame_%04d.png"])
    
    # 2. Process frames
    session = new_session()
    for frame_name in os.listdir("temp"):
        with open(f"temp/{frame_name}", "rb") as i:
            input_data = i.read()
            output_data = remove(input_data, session=session)
            with open(f"temp_out/{frame_name}", "wb") as o:
                o.write(output_data)
                
    # 3. Reassemble
    subprocess.run(["ffmpeg", "-i", "temp_out/frame_%04d.png", "-pix_fmt", "yuva420p", output_path])
```
