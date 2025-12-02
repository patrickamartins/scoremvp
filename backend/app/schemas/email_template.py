from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.email_template import EmailTemplateType

class EmailTemplateBase(BaseModel):
    template_type: EmailTemplateType
    subject: str
    html_body: str
    enabled: bool = True
    send_to_roles: Optional[List[str]] = None

class EmailTemplateCreate(EmailTemplateBase):
    pass

class EmailTemplateUpdate(BaseModel):
    subject: Optional[str] = None
    html_body: Optional[str] = None
    enabled: Optional[bool] = None
    send_to_roles: Optional[List[str]] = None

class EmailTemplateOut(EmailTemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

