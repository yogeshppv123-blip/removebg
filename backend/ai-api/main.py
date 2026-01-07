from fastapi import FastAPI, File, UploadFile
from rembg import remove
from PIL import Image
import io
import base64

app = FastAPI()

@app.post("/remove-bg")
async def remove_bg(file: UploadFile = File(...)):
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Remove background
        output_bytes = remove(image_bytes)
        
        # Return as hex
        return {
            "image": output_bytes.hex()
        }
    except Exception as e:
        print(f"AI Engine Error: {str(e)}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
