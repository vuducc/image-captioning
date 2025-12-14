from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from app.services.auth_service import router as auth_router
from app.services.caption_service import router as caption_router
from app.services.history_service import router as history_router
from app.services.image_service import router as image_router
from app.services.upload_service import router as upload_router 
import google.generativeai as genai

# Cấu hình Google Gemini API
genai.configure(api_key="AIzaSyBWHNuLH-RMoCSxa1TMnZ9pFaVl43z8CCQ")

# Khởi tạo FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://visual-caption-4fpe.onrender.com", "https://visualcaption.onrender.com","http://localhost:5173","https://visualcaption2.onrender.com","https://vs-eakx.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("path/to/favicon.ico")

@app.get("/")
def home():
    return {"message": "Welcome to Image Caption API!"}

# Import các router
app.include_router(caption_router, prefix="/api/caption", tags=["Caption"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(history_router, prefix="/api", tags=["History"])
app.include_router(image_router, prefix="/api/image", tags=["Image"])
app.include_router(upload_router, prefix="/uploads", tags=["Uploads"])
