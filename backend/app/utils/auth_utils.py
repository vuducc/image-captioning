import bcrypt, jwt
from datetime import datetime, timedelta

SECRET_KEY = "supersecret"

def generate_jwt_token(user_id):
    payload = {
        "sub": str(user_id),  # Convert UUID to string here!
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

