from fastapi import APIRouter, UploadFile, File
from app.utils.gemini_helper import generate_caption, information_destination


import requests
import asyncio
import io
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor()

router = APIRouter()

@router.post("/image")
async def image_caption(file: UploadFile = File(...)):
    image_bytes = await file.read()
    caption = await generate_caption(image_bytes)

    return {"caption": caption}

@router.post("/image/destination")
async def image_destination_info(file: UploadFile = File(...)):
    image_bytes = await file.read()
    info = await information_destination(image_bytes)
    return {"destination_info": info}




async def generate_caption(image_bytes: bytes) -> str:
    def sync_request():
        files = {"image": ("image.jpg", io.BytesIO(image_bytes), "image/jpeg")}
        response = requests.post(
            "https://kRnos22-image-caption-vi.hf.space/predict",
            files=files,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        caption = data.get("data", [""])[0]
        return caption

    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, sync_request)
