from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class FeedbackCreate(BaseModel):
    content: str = Field(..., example="Nội dung phản hồi")
    rating: int = Field(..., ge=1, le=5)

class FeedbackOut(BaseModel):
    feedback_id: UUID
    created_at: datetime
    content: str
    rating: int

    model_config = {
        "from_attributes": True 
    }


