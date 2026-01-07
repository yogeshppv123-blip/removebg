# Background Removal SaaS (Full Stack)

This project contains a multi-layered architecture for background removal using AI.

## Architecture
- **backend/ai-api**: Python FastAPI server running `rembg`.
- **backend/bridge-api**: Node.js Express server handling business logic, MongoDB storage, and file routing.
- **mobile-app**: React Native (Expo compatible) frontend example.

## Getting Started

### 1. Start Python AI API
```bash
cd backend/ai-api
pip install -r requirements.txt
python main.py
```
API will run on `http://localhost:8000`.

### 2. Start Node.js Bridge API
```bash
cd backend/bridge-api
npm install
npm start
```
API will run on `http://localhost:5000`. Ensure MongoDB is running locally or update the connection string in `server.js`.

### 3. Run Mobile App
Copy the logic from `mobile-app/UploadExample.js` into your React Native project.

## Video Background Removal
See `VIDEO_REMOVAL_PLAN.md` for the deep analysis and implementation roadmap for video processing.
