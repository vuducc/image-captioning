import smtplib
import ssl
import random
from email.message import EmailMessage


OTP_STORE = {}

EMAIL_SENDER = "visualcaption@gmail.com"
EMAIL_APP_PASSWORD = "mycjyoffhilzzfkt" 
EMAIL_SUBJECT = "Your OTP Code"

def generate_otp():
    return str(random.randint(100000, 999999))

async def send_otp_email(email: str, otp_store: dict):
    otp = generate_otp()
    otp_store[email] = otp

    body = f"Your OTP code is: {otp}"

    msg = EmailMessage()
    msg["Subject"] = EMAIL_SUBJECT
    msg["From"] = EMAIL_SENDER
    msg["To"] = email
    msg.set_content(body)

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(EMAIL_SENDER, EMAIL_APP_PASSWORD)
        server.send_message(msg)
