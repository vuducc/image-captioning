from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
from uuid import uuid4
from datetime import datetime
from typing import Optional
from uuid import UUID

router = APIRouter()

# API để thêm bản ghi vào bảng uploads
@router.post("/upload")
async def upload_image(user_id: str, file_url: str, file_type: str, caption: str, db: AsyncSession = Depends(get_db)):
    try:
        # Tạo upload_id ngẫu nhiên
        upload_id = str(uuid4())
        uploaded_at = datetime.now()  # Lấy thời gian hiện tại

        # Thêm bản ghi vào bảng uploads
        insert_query = text("""
            INSERT INTO uploads (upload_id, user_id, uploaded_at, file_url, file_type, caption)
            VALUES (:upload_id, :user_id, :uploaded_at, :file_url, :file_type, :caption)
        """)
        await db.execute(insert_query, {
            "upload_id": upload_id,
            "user_id": user_id,
            "uploaded_at": uploaded_at,
            "file_url": file_url,
            "file_type": file_type,
            "caption": caption
        })
        await db.commit()

        return {"message": "File uploaded successfully", "upload_id": upload_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API để lấy các bản ghi của user từ bảng uploads
@router.get("/uploads/{user_id}")
async def get_user_uploads(user_id: str, db: AsyncSession = Depends(get_db)):
    try:
        # Truy vấn các bản ghi của user_id từ bảng uploads
        select_query = text("SELECT * FROM uploads WHERE user_id = :user_id")
        result = await db.execute(select_query, {"user_id": user_id})
        uploads = result.fetchall()

        # Nếu không có bản ghi nào, trả về lỗi
        if not uploads:
            raise HTTPException(status_code=404, detail="No uploads found for this user")

        # Trả về các bản ghi của user
        uploads_data = [{"upload_id": upload.upload_id, "file_url": upload.file_url, "file_type": upload.file_type, "caption": upload.caption, "uploaded_at": upload.uploaded_at} for upload in uploads]
        return {"uploads": uploads_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/captions")
async def get_captions(
    search: Optional[str] = None,
    type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    try:
        query = "SELECT upload_id, user_id, file_url, file_type, caption, uploaded_at FROM uploads WHERE TRUE"
        params = {}

        if search:
            query += " AND caption ILIKE :search"
            params["search"] = f"%{search}%"

        if type:
            query += " AND file_type = :type"
            params["type"] = type

        result = await db.execute(text(query), params)
        rows = result.fetchall()

        return [
            {
                "upload_id": str(row.upload_id),
                "user_id": str(row.user_id),
                "file_url": row.file_url,
                "file_type": row.file_type,
                "caption": row.caption,
                "uploaded_at": row.uploaded_at
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# GET: Chi tiết một caption
@router.get("/admin/captions/{caption_id}")
async def get_caption_detail(
    caption_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    try:
        query = text("""
            SELECT upload_id, user_id, file_url, file_type, caption, uploaded_at
            FROM uploads
            WHERE upload_id = :cid
        """)
        result = await db.execute(query, {"cid": str(caption_id)})
        row = result.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Caption không tồn tại")

        return {
            "upload_id": str(row.upload_id),
            "user_id": str(row.user_id),
            "file_url": row.file_url,
            "file_type": row.file_type,
            "caption": row.caption,
            "uploaded_at": row.uploaded_at
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# DELETE: Xóa một caption
@router.delete("/admin/captions/{caption_id}")
async def delete_caption(
    caption_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Kiểm tra caption có tồn tại không
        check_query = text("SELECT 1 FROM uploads WHERE upload_id = :cid")
        check_result = await db.execute(check_query, {"cid": str(caption_id)})

        if not check_result.scalar():
            raise HTTPException(status_code=404, detail="Caption không tồn tại")

        # Xóa caption
        delete_query = text("DELETE FROM uploads WHERE upload_id = :cid")
        await db.execute(delete_query, {"cid": str(caption_id)})
        await db.commit()

        return {"message": "Caption đã được xóa", "caption_id": str(caption_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))