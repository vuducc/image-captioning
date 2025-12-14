import os
from icrawler.builtin import GoogleImageCrawler

# Danh sách các địa danh
landmarks = [
    "hồ Hoàn Kiếm",
    "cầu Long Biên",
]

# Thư mục gốc chứa ảnh
SAVE_FOLDER = "landmarks_images"
os.makedirs(SAVE_FOLDER, exist_ok=True)

for landmark in landmarks:
    print(f"Đang tìm ảnh cho: {landmark}...")

    # Tạo thư mục con theo tên landmark (dấu cách thay bằng "_")
    folder_name = landmark.replace(" ", "_")
    landmark_folder = os.path.join(SAVE_FOLDER, folder_name)
    os.makedirs(landmark_folder, exist_ok=True)

    # Tải ảnh
    google_crawler = GoogleImageCrawler(storage={"root_dir": landmark_folder})
    google_crawler.crawl(keyword=landmark, max_num=20)  
    print(f"Đã tải ảnh cho {landmark} vào {landmark_folder}")

    # Đổi tên ảnh
    files = os.listdir(landmark_folder)
    for idx, filename in enumerate(files, 1):
        ext = os.path.splitext(filename)[-1]  # giữ phần mở rộng (.jpg, .png, ...)
        new_name = f"{folder_name}_{idx}{ext}"

        old_path = os.path.join(landmark_folder, filename)
        new_path = os.path.join(landmark_folder, new_name)

        os.rename(old_path, new_path)

    print(f"Đã đổi tên ảnh thành dạng: {folder_name}_<số>")

print("Hoàn tất tải và đổi tên ảnh!")
