import google.generativeai as genai

# async def generate_caption(image_bytes: bytes) -> str:
#     model = genai.GenerativeModel("gemini-1.5-flash-001")

#     # Prompt yêu cầu sinh caption bằng tiếng Việt
#     # prompt = "Hãy mô tả bức ảnh này bằng tiếng Việt một cách chi tiết."
#     # prompt = "Đây là địa điểm nào ở Việt Nam, hãy cho tôi thông tin du lịch về địa điểm này bằng tiếng việt."
    
#     prompt = "Hãy mô tả bức ảnh này bằng tiếng Việt chỉ bằng 1 câu, hãy miêu tả sai 1 vài đặc điểm."

#     response = model.generate_content([
#         prompt,
#         {"mime_type": "image/jpeg", "data": image_bytes}
#     ])

#     return response.text.strip()


import requests
import io
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor()

async def generate_caption(image_bytes: bytes) -> str:
    def sync_request():
        files = {"image": ("image.jpg", io.BytesIO(image_bytes), "image/jpeg")}
        response = requests.post(
            "https://kRnos22-image-caption-vi.hf.space/predict",  # chữ R hoa
            files=files,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        caption = data.get("data", [""])[0]
        return caption

    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, sync_request)



async def information_destination(image_bytes: bytes) -> str:
    model = genai.GenerativeModel("gemini-1.5-flash-001")

    prompt = "Đây là địa điểm nào ở Việt Nam, hãy cho tôi thông tin du lịch về địa điểm này bằng tiếng Việt."

    response = model.generate_content([
        prompt,
        {"mime_type": "image/jpeg", "data": image_bytes}
    ])

    return response.text.strip()