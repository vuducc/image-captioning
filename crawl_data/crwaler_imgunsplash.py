import requests
import os
import time

# === Cấu hình ===
ACCESS_KEY = "Key"  # hay bằng Access Key thật
SEARCH_TERMS = ["Vietnam Nature", "Vietnam Landscape", "Vietnam Scenery"]
TOTAL_IMAGES = 1500
PER_PAGE = 30  # Unsplash API cho phép tối đa 30 ảnh mỗi trang
SAVE_DIR = "Vietnam_nature"
os.makedirs(SAVE_DIR, exist_ok=True)

#Hàm tải ảnh
def download_image(url, save_path):
    try:
        img_data = requests.get(url, timeout=10).content
        with open(save_path, 'wb') as f:
            f.write(img_data)
    except Exception as e:
        print(f"Lỗi khi tải {url}: {e}")

#Hàm gọi API và lưu ảnh
def fetch_images():
    count = 0
    page = 1
    while count < TOTAL_IMAGES:
        for term in SEARCH_TERMS:
            url = f"https://api.unsplash.com/search/photos?query={term}&page={page}&per_page={PER_PAGE}&client_id={ACCESS_KEY}"
            response = requests.get(url)
            if response.status_code != 200:
                print(f"Lỗi API: {response.status_code}")
                return

            data = response.json()
            results = data.get("results", [])
            if not results:
                print(f"Không còn ảnh cho từ khóa: {term}")
                continue

            for img in results:
                img_url = img["urls"]["regular"]
                img_id = img["id"]
                save_path = os.path.join(SAVE_DIR, f"{term.replace(' ', '_')}_{img_id}.jpg")
                if not os.path.exists(save_path):
                    download_image(img_url, save_path)
                    count += 1
                    print(f" Đã tải ({count}/{TOTAL_IMAGES}): {img_url}")
                    if count >= TOTAL_IMAGES:
                        break

            if count >= TOTAL_IMAGES:
                break

            time.sleep(1)  # Tránh bị giới hạn API

        page += 1


if __name__ == "__main__":
    fetch_images()
