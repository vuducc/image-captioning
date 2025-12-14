import google.generativeai as genai
import os
import re
import ast
import PIL.Image
import time
from collections import defaultdict

# Cấu hình API
genai.configure(api_key="Key")  #  Thay bằng API key thật
model = genai.GenerativeModel(model_name="gemini-2.0-flash")

IMAGE_FOLDER = ""  #  Thay bằng đường dẫn đến thư mục ảnh
OUTPUT_FILE = "captions_image_output.txt"

# Đọc caption đã tồn tại
existing_captions = defaultdict(list)
if os.path.exists(OUTPUT_FILE):
    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if ',' in line:
                filename, caption = line.strip().split(",", 1)
                existing_captions[filename].append(caption)

# Danh sách ảnh
image_files = [f for f in os.listdir(IMAGE_FOLDER) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
image_files.sort()

# Bộ nhớ đệm để ghi ra file sau mỗi 10 ảnh
buffer = []
processed = 0

for image_file in image_files:
    if len(existing_captions[image_file]) >= 5:
        print(f"Đã có đủ caption cho {image_file}, bỏ qua.")
        continue

    image_path = os.path.join(IMAGE_FOLDER, image_file)
    try:
        image = PIL.Image.open(image_path)

        response = model.generate_content([
            """
            Viết 5 mô tả bằng tiếng Việt cho bức ảnh bên dưới.
            - Mỗi mô tả từ 10 đến 50 từ.
            - Không chứa cảm xúc, không suy đoán.
            - Mô tả khách quan những gì thấy trong ảnh.
            - Chỉ trả về danh sách Python như sau:
            ["caption 1", "caption 2", ..., "caption 5"]
            """,
            image
        ])
        time.sleep(1)

        if response and response.text:
            match = re.search(r'\[(.*?)\]', response.text, re.DOTALL)
            if match:
                array_text = "[" + match.group(1) + "]"
                captions = ast.literal_eval(array_text)

                for caption in captions:
                    caption = caption.strip()
                    if caption and caption not in existing_captions[image_file]:
                        buffer.append(f"{image_file},{caption}")
                        existing_captions[image_file].append(caption)

                print(f"Đã tạo caption cho {image_file}")
                processed += 1

                # Nếu đã xử lý 10 ảnh, ghi vào file
                if processed % 10 == 0:
                    with open(OUTPUT_FILE, "a", encoding="utf-8") as out_f:
                        out_f.write('\n'.join(buffer) + '\n')
                    print(f"Đã lưu captions của 10 ảnh.")
                    buffer.clear()
            else:
                print(f"Không tìm thấy danh sách hợp lệ trong phản hồi của {image_file}")
        else:
            print(f"Phản hồi trống cho {image_file}")
    except Exception as e:
        print(f"Lỗi khi xử lý {image_file}: {str(e)}")

# Ghi phần còn lại (nếu có)
if buffer:
    with open(OUTPUT_FILE, "a", encoding="utf-8") as out_f:
        out_f.write('\n'.join(buffer) + '\n')
    print(f"Đã lưu captions còn lại ({len(buffer)} dòng).")
