import boto3
import uuid
import os
from fastapi import UploadFile
from dotenv import load_dotenv

# Load biến môi trường từ file .env
load_dotenv()

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_REGION = os.getenv("AWS_REGION")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

s3 = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION
)

async def upload_file_to_s3(file: UploadFile) -> str:
    key = f"uploads/{uuid.uuid4()}-{file.filename}"
    s3.upload_fileobj(file.file, AWS_BUCKET_NAME, key)
    return f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{key}"
