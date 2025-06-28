from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, validator
from pydantic_settings import BaseSettings
import secrets
import os
from pathlib import Path

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # BACKEND_CORS_ORIGINS is a JSON-formatted list of origins
    # e.g: '["http://localhost", "http://localhost:4200", "http://localhost:3000"]'
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    project_name: str = "Score MVP"
    
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "scoremvp"
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return (
            f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}"
            f"@{values.get('POSTGRES_SERVER')}:5432/{values.get('POSTGRES_DB')}"
        )

    # Stripe settings
    STRIPE_API_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_ID: str = ""

    # Upload settings
    UPLOAD_DIR: Path = Path("uploads")
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "gif"]

    # Email settings
    MAILERSEND_API_KEY: Optional[str] = None
    MAILERSEND_SMTP_HOST: str = "smtp.mailersend.net"
    MAILERSEND_SMTP_PORT: int = 587
    MAILERSEND_SMTP_USERNAME: str = os.getenv("MAILERSEND_SMTP_USERNAME", "MS_2OIjID@test-r83ql3pewnpgzw1j.mlsender.net")
    MAILERSEND_SMTP_PASSWORD: str = os.getenv("MAILERSEND_SMTP_PASSWORD", "your-smtp-password")
    MAILERSEND_SENDER_EMAIL: str = os.getenv("MAILERSEND_SENDER_EMAIL", "no-reply@scoremvp.com.br")
    MAILERSEND_SENDER_NAME: str = "ScoreMVP"
    
    FRONTEND_URL: str = "http://localhost:3000"
    
    DATABASE_URL: Optional[str] = None
    ALGORITHM: str = "HS256"
    ENVIRONMENT: str = "development"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
