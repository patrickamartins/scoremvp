from typing import Any, Dict, Optional
from pydantic_settings import BaseSettings
from pydantic import validator
import secrets
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "ScoreMVP"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = secrets.token_urlsafe(32)
    SECURITY_PASSWORD_SALT: str = secrets.token_urlsafe(32)
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "scoremvp"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    
    # MailerSend
    MAILERSEND_API_KEY: str
    MAILERSEND_SMTP_USERNAME = os.getenv("MAILERSEND_SMTP_USERNAME", "MS_2OIjID@test-r83ql3pewnpgzw1j.mlsender.net")
    MAILERSEND_SMTP_PASSWORD = os.getenv("MAILERSEND_SMTP_PASSWORD", "mssp.Rjuq8ul.v69oxl59vpkg785k.YjyLdof")
    MAILERSEND_SENDER_EMAIL = os.getenv("MAILERSEND_SENDER_EMAIL", "no-reply@scoremvp.com.br")
    MAILERSEND_SENDER_NAME: str = "ScoreMVP"
    
    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"
    
    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}/{values.get('POSTGRES_DB')}"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings() 