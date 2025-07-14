from typing import Optional
from pydantic import BaseModel
from app.schemas.user import UserResponse

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[int] = None
    
    @classmethod
    def from_payload(cls, payload: dict):
        # Garantir que sub seja convertido para int
        if 'sub' in payload and payload['sub'] is not None:
            try:
                payload['sub'] = int(payload['sub'])
            except (ValueError, TypeError):
                payload['sub'] = None
        return cls(**payload)

class TokenData(BaseModel):
    email: str | None = None 