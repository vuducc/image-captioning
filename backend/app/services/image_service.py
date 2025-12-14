
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader

load_dotenv()

cloudinary.config(
    cloudinary_url=os.getenv("CLOUDINARY_URL")
)

router = APIRouter()

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Đọc nội dung tệp
        contents = await file.read()
        # Tải ảnh lên Cloudinary
        result = cloudinary.uploader.upload(contents)
        # Trả về URL của ảnh đã tải lên
        return JSONResponse(content={"url": result.get("secure_url")})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))