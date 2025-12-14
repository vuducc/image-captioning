from fastapi import APIRouter, Depends, HTTPException, Query 
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import SessionLocal
from app.utils.email_helper import send_otp_email, OTP_STORE
from app.utils.auth_utils import hash_password, verify_password, generate_jwt_token
import uuid
from uuid import UUID
from datetime import datetime
from app.utils.feedback import FeedbackCreate, FeedbackOut
from ..database import get_db
from typing import Optional
from fastapi import Path, Query


router = APIRouter()

OTP_STORE = {}

async def get_db():
    async with SessionLocal() as session:
        yield session
@router.post("/register")
async def register(email: str, password: str, db: AsyncSession = Depends(get_db)):
    check_query = text("SELECT 1 FROM users WHERE email = :email")
    result = await db.execute(check_query, {"email": email})
    existing_user = result.fetchone()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email đã được đăng ký.")

    hashed = hash_password(password)

    insert_query = text("""
        INSERT INTO users (user_id, email, username, password)
        VALUES (:id, :email, :email, :password)
    """)
    await db.execute(insert_query, {
        "id": str(uuid.uuid4()),
        "email": email,
        "password": hashed
    })
    await db.commit()

    await send_otp_email(email, OTP_STORE)
    return {"message": "Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP."}



@router.post("/send-otp")
async def send_otp(email: str):
    await send_otp_email(email, OTP_STORE)
    return {"message": "OTP sent to email."}

@router.post("/verify-otp")
async def verify_otp(email: str, otp: str):
    if OTP_STORE.get(email) == otp:
        del OTP_STORE[email]
        return {"message": "OTP verification successful."}
    return {"message": "Invalid OTP."}

@router.post("/login")
async def login(email: str, password: str, db: AsyncSession = Depends(get_db)):
    # Truy vấn người dùng từ cơ sở dữ liệu PostgreSQL
    query = text("SELECT * FROM users WHERE email = :email")
    result = await db.execute(query, {"email": email})
    user = result.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    stored_password = user.password if hasattr(user, 'password') else user['password']

    # Kiểm tra mật khẩu
    if not verify_password(password, stored_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Lấy thông tin người dùng và tạo token JWT
    user_info = {
        "user_id": user.user_id,
        "email": user.email,
        "user_name": user.username
    }
    
    # Sinh JWT token với thông tin người dùng
    token = generate_jwt_token(user_info)
    return {"token": token}



@router.post("/logout")
async def logout():
    return {"message": "Logout successful."}



@router.post("/users/{user_id}/feedback", response_model=FeedbackOut, status_code=201)
async def create_feedback_for_user(
    user_id: UUID,
    fb_in: FeedbackCreate,
    db: AsyncSession = Depends(get_db)
):
    # 1. Kiểm tra user tồn tại
    res = await db.execute(
        text("SELECT 1 FROM users WHERE user_id = :uid"),
        {"uid": str(user_id)}
    )
    if not res.scalar():
        raise HTTPException(404, detail="User không tồn tại")

    # 2. Insert và trả về feedback mới
    try:
        result = await db.execute(text("""
            INSERT INTO feedback (user_id, content, rating)
            VALUES (:uid, :cont, :rat)
            RETURNING feedback_id, created_at, content, rating
        """), {
            "uid":   str(user_id),
            "cont":  fb_in.content,
            "rat":   fb_in.rating
        })
        row = result.first()
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(400, detail="Tạo feedback thất bại")

    return FeedbackOut(
        feedback_id=row.feedback_id,
        created_at=row.created_at,
        content=row.content,
        rating=row.rating
    )


@router.get("/users/{user_id}/feedback", response_model=list[FeedbackOut])
async def get_feedbacks_for_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    # 1. Kiểm tra user tồn tại
    res = await db.execute(
        text("SELECT 1 FROM users WHERE user_id = :uid"),
        {"uid": str(user_id)}
    )
    if not res.scalar():
        raise HTTPException(404, detail="User không tồn tại")

    # 2. Truy vấn tất cả feedback của user, sắp xếp mới nhất trước
    result = await db.execute(text("""
        SELECT feedback_id, created_at, content, rating
        FROM feedback
        WHERE user_id = :uid
        ORDER BY created_at DESC
    """), {"uid": str(user_id)})
    rows = result.fetchall()
    return [
        FeedbackOut(
            feedback_id=r.feedback_id,
            created_at=r.created_at,
            content=r.content,
            rating=r.rating
        )
        for r in rows
    ]


@router.get("/admin/users")
async def get_users(
    search: Optional[str] = Query(None),
    status: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query_str = "SELECT user_id, email, username, is_active FROM users WHERE TRUE"
    params = {}

    if search:
        query_str += " AND (email ILIKE :search OR username ILIKE :search)"
        params["search"] = f"%{search}%"

    if status is not None:
        query_str += " AND is_active = :status"
        params["status"] = status

    result = await db.execute(text(query_str), params)
    rows = result.fetchall()

    return [
        {
            "user_id": str(row.user_id),
            "email": row.email,
            "username": row.username,
            "is_active": row.is_active
        }
        for row in rows
    ]

# PATCH: Đổi trạng thái hoạt động của người dùng (active/inactive)
@router.patch("/admin/users/{user_id}/status")
async def toggle_user_status(
    user_id: UUID = Path(...),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        text("SELECT is_active FROM users WHERE user_id = :uid"),
        {"uid": str(user_id)}
    )
    row = result.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    new_status = not row.is_active
    await db.execute(
        text("UPDATE users SET is_active = :status WHERE user_id = :uid"),
        {"status": new_status, "uid": str(user_id)}
    )
    await db.commit()

    return {
        "message": "Trạng thái người dùng đã được cập nhật.",
        "user_id": str(user_id),
        "new_status": new_status
    }

# DELETE: Xóa người dùng
@router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: UUID = Path(...),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        text("SELECT 1 FROM users WHERE user_id = :uid"),
        {"uid": str(user_id)}
    )
    if not result.scalar():
        raise HTTPException(status_code=404, detail="User không tồn tại")

    await db.execute(
        text("DELETE FROM users WHERE user_id = :uid"),
        {"uid": str(user_id)}
    )
    await db.commit()

    return {
        "message": "Người dùng đã được xóa.",
        "user_id": str(user_id)
    }



@router.get("/admin/feedback")
async def get_all_feedback(
    search: Optional[str] = Query(None),
    rating: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query_str = "SELECT feedback_id, user_id, content, rating, created_at, response, resolved FROM feedback WHERE TRUE"
    params = {}

    if search:
        query_str += " AND content ILIKE :search"
        params["search"] = f"%{search}%"

    if rating is not None:
        query_str += " AND rating = :rating"
        params["rating"] = rating

    result = await db.execute(text(query_str), params)
    rows = result.fetchall()

    return [
        {
            "feedback_id": str(r.feedback_id),
            "user_id": str(r.user_id),
            "content": r.content,
            "rating": r.rating,
            "created_at": r.created_at,
            "response": r.response,
            "resolved": r.resolved
        }
        for r in rows
    ]

# POST: Phản hồi feedback
@router.post("/admin/feedback/{feedback_id}/response")
async def respond_to_feedback(
    feedback_id: UUID,
    response: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    # Kiểm tra tồn tại
    res = await db.execute(
        text("SELECT 1 FROM feedback WHERE feedback_id = :fid"),
        {"fid": str(feedback_id)}
    )
    if not res.scalar():
        raise HTTPException(404, detail="Feedback không tồn tại")

    # Cập nhật phản hồi
    await db.execute(
        text("UPDATE feedback SET response = :response WHERE feedback_id = :fid"),
        {"response": response, "fid": str(feedback_id)}
    )
    await db.commit()

    return {"message": "Đã phản hồi feedback."}

# PATCH: Đánh dấu feedback là đã xử lý
@router.patch("/admin/feedback/{feedback_id}/status")
async def mark_feedback_resolved(
    feedback_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    # Kiểm tra tồn tại
    res = await db.execute(
        text("SELECT resolved FROM feedback WHERE feedback_id = :fid"),
        {"fid": str(feedback_id)}
    )
    row = res.fetchone()

    if not row:
        raise HTTPException(404, detail="Feedback không tồn tại")

    if row.resolved:
        return {"message": "Feedback đã được đánh dấu là đã xử lý trước đó."}

    await db.execute(
        text("UPDATE feedback SET resolved = TRUE WHERE feedback_id = :fid"),
        {"fid": str(feedback_id)}
    )
    await db.commit()

    return {"message": "Feedback đã được đánh dấu là đã xử lý."}



@router.get("/admin/stats")
async def get_admin_stats(db: AsyncSession = Depends(get_db)):
    stats = {}

    # Tổng số người dùng
    res = await db.execute(text("SELECT COUNT(*) FROM users"))
    stats["total_users"] = res.scalar()

    # Tổng số feedback
    res = await db.execute(text("SELECT COUNT(*) FROM feedback"))
    stats["total_feedback"] = res.scalar()

    # Tổng số caption (uploads)
    res = await db.execute(text("SELECT COUNT(*) FROM uploads"))
    stats["total_captions"] = res.scalar()

    return stats


@router.get("/admin/captions")
async def get_admin_captions(
    search: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query_str = "SELECT upload_id, user_id, file_url, file_type, caption, uploaded_at FROM uploads WHERE TRUE"
    params = {}

    if search:
        query_str += " AND caption ILIKE :search"
        params["search"] = f"%{search}%"

    if type:
        query_str += " AND file_type = :type"
        params["type"] = type

    if sort == "created_at":
        query_str += " ORDER BY uploaded_at DESC"

    if limit:
        query_str += " LIMIT :limit"
        params["limit"] = limit

    result = await db.execute(text(query_str), params)
    rows = result.fetchall()

    return [
        {
            "upload_id": str(r.upload_id),
            "user_id": str(r.user_id),
            "file_url": r.file_url,
            "file_type": r.file_type,
            "caption": r.caption,
            "uploaded_at": r.uploaded_at
        }
        for r in rows
    ]




@router.get("/admin/feedback")
async def get_all_feedback(
    search: Optional[str] = Query(None),
    rating: Optional[int] = Query(None),
    sort: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query_str = """
        SELECT feedback_id, user_id, content, rating, created_at, response, resolved
        FROM feedback
        WHERE TRUE
    """
    params = {}

    if search:
        query_str += " AND content ILIKE :search"
        params["search"] = f"%{search}%"

    if rating is not None:
        query_str += " AND rating = :rating"
        params["rating"] = rating

    if sort == "created_at":
        query_str += " ORDER BY created_at DESC"

    if limit:
        query_str += " LIMIT :limit"
        params["limit"] = limit

    result = await db.execute(text(query_str), params)
    rows = result.fetchall()

    return [
        {
            "feedback_id": str(r.feedback_id),
            "user_id": str(r.user_id),
            "content": r.content,
            "rating": r.rating,
            "created_at": r.created_at,
            "response": r.response,
            "resolved": r.resolved
        }
        for r in rows
    ]
