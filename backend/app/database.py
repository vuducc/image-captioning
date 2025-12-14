from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

POSTGRES_URL = os.getenv("POSTGRES_URL")
MONGO_URI = os.getenv("MONGO_URI")

engine = create_async_engine(POSTGRES_URL)
SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
mongo_db = mongo_client["visualCaption"]

async def get_db():
    async with SessionLocal() as session:
        yield session