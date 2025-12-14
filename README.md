
# 📸 VisualCaption
**VisualCaption** là một ứng dụng web cho phép người dùng tải lên hình ảnh các địa điểm du lịch, danh lam thắng cảnh tại Việt Nam và tự động tạo mô tả (caption) phù hợp bằng trí tuệ nhân tạo. Ngoài việc sinh mô tả dựa trên nội dung ảnh, ứng dụng còn cung cấp thông tin cơ bản về địa điểm du lịch đó như vị trí, đặc điểm nổi bật và gợi ý tham quan. Dự án gồm hai phần chính: Backend (FastAPI) xử lý ảnh và sinh mô tả, Frontend (React) cung cấp giao diện thân thiện, dễ sử dụng cho người dùng.

---
bạn có thể thử tại: https://visualcaption2.onrender.com/
---
## 🗂 Cấu trúc dự án

```
visualcaption/
│
├── backend/          # FastAPI backend (API và AI xử lý ảnh)
│   ├── app/
│   ├── utils/
│   ├── services/
│   ├── main.py
│   ├── .env 
│   └── requirements.txt
│
├── frontend/         # React frontend (giao diện người dùng)
│   ├── public/
│   ├── src/
│   ├── vite.config.js
│   └── package.json
│
└── README.md         # Tài liệu mô tả dự án
```

---

## 🚀 Tính năng chính

- 🖼️ Tải ảnh lên từ thiết bị người dùng
- 🤖 Tự động sinh caption bằng mô hình AI
- 💬 Hiển thị caption dưới ảnh
- 🎨 Giao diện đơn giản, dễ sử dụng

---

## 🧠 Công nghệ sử dụng

### Backend

- Python 3.10+
- [FastAPI](https://fastapi.tiangolo.com/)
- [Uvicorn](https://www.uvicorn.org/)
- Pillow / OpenCV
- Pre-trained AI model (VD: BLIP, CLIP, ViT, v.v.)

### Frontend

- [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- Axios
- React Dropzone

---

## ⚙️ Hướng dẫn cài đặt

### 1. Cài đặt Backend

```bash
python -m venv venv
venv\Scripts\activate 
cd backend
pip install -r requirements.txt
```
#### ⚙️ Cấu hình `.env` cho Backend

Tạo file `.env` trong thư mục `backend` (nếu chưa có) và thêm các biến cấu hình cần thiết. Ví dụ:

```env
POSTGRES_URL=
CLOUDINARY_URL=
```

Bạn có thể đọc các biến môi trường này trong code FastAPI bằng cách dùng `os.getenv()` hoặc thư viện `python-dotenv`.

#### Khởi chạy server FastAPI

```bash
uvicorn app.main:app --reload
```

- Truy cập API docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Các endpoint chính:
  - `POST /upload` – Tải ảnh lên
  - `POST /caption` – Nhận caption cho ảnh
---

### 2. Cài đặt Frontend

```bash
cd frontend
npm install
```

#### Chạy frontend

```bash
npm run dev
```

- Giao diện chạy tại: [http://localhost:5173](http://localhost:5173)

#### ⚠️ Đảm bảo cấu hình đúng API URL

Trong file `src/api.js` hoặc tương đương:

```js
const BASE_URL = "http://localhost:8000";
```

Bạn có thể dùng file `.env` để cấu hình biến môi trường.

---

## 🧪 Kiểm thử nhanh

1. Chạy `uvicorn` ở thư mục `backend`
2. Chạy `npm run dev` ở thư mục `frontend`
3. Truy cập [http://localhost:5173](http://localhost:5173)
4. Tải một ảnh bất kỳ
5. Xem caption được tạo tự động

---

## 📌 Gợi ý mở rộng

- [ ] Hỗ trợ đa ngôn ngữ (dịch caption)
- [ ] Tạo tài khoản và lưu lịch sử người dùng
- [ ] Caption bằng giọng nói (Text-to-Speech)
- [ ] Chia sẻ caption lên mạng xã hội

---

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Bạn có thể:

- Tạo issue mới nếu có lỗi
- Gửi Pull Request với tính năng mới
- Chia sẻ để dự án được biết đến rộng rãi hơn

---

## 📬 Liên hệ
Email: [visualcaption@gmail.com]  
GitHub: [https://github.com/Truongjava/visual_caption_2.git](https://github.com/Truongjava/visual_caption_2.git)
