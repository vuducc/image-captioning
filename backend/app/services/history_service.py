from fastapi import APIRouter
from app.database import mongo_db

router = APIRouter()

@router.get("/history")
async def get_history():
    cursor = mongo_db["history"].find()
    history = await cursor.to_list(length=100)
    return history

@router.get("/history/{id}")
async def get_history_detail(id: str):
    history = await mongo_db["history"].find_one({"_id": id})
    return history
