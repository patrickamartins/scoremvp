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
    BACKEND_CORS_ORIGINS: List[str] = [
        "https://scoremvp-frontend-production.up.railway.app",
        "https://scoremvp.com.br",
        "https://www.scoremvp.com.br",
        "http://localhost:3000",
        "http://localhost:3003",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3003",
        "http://127.0.0.1:5173",
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    project_name: str = "Score MVP"
    
    # Valores padrão que correspondem ao .env local
    # O Pydantic Settings carrega automaticamente do .env se existir
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "admin"  # Padrão local, não "postgres"
    POSTGRES_PASSWORD: str = "admin123"  # Padrão local
    POSTGRES_DB: str = "scoremvp"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        
        # Verificar se há DATABASE_URL no ambiente
        database_url = os.getenv("DATABASE_URL")
        
        # Se houver DATABASE_URL, verificar se usa o usuário correto
        # Se usar "postgres" mas o .env tem outro usuário, ignorar
        if database_url:
            # Extrair usuário da DATABASE_URL
            url_user = ""
            if "@" in database_url:
                user_part = database_url.split("@")[0]
                if "://" in user_part:
                    user_part = user_part.split("://")[1]
                if ":" in user_part:
                    url_user = user_part.split(":")[0]
            
            # Se a URL do ambiente usar "postgres" mas o .env tem outro usuário, ignorar
            env_user = values.get('POSTGRES_USER', 'admin')
            if url_user == "postgres" and env_user != "postgres":
                print(f"AVISO: DATABASE_URL do ambiente usa usuario 'postgres', mas .env tem '{env_user}'")
                print(f"Ignorando DATABASE_URL do ambiente e usando configuracoes do .env")
                database_url = None
        
        # Se não tiver DATABASE_URL válida, construir a partir das variáveis do .env
        if not database_url:
            local_url = (
                f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}"
                f"@{values.get('POSTGRES_SERVER')}:5432/{values.get('POSTGRES_DB')}"
            )
            print(f"Usando configuração local do .env: {local_url.split('@')[0]}@...")
            return local_url
        else:
            print(f"Usando DATABASE_URL do ambiente: {database_url.split('@')[0] if '@' in database_url else database_url[:50]}@...")
            return str(database_url)  # Forçar conversão para string

    # Stripe settings
    STRIPE_API_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    STRIPE_PRICE_ID_PRO: str = os.getenv("STRIPE_PRICE_ID_PRO", "")
    STRIPE_PRICE_ID_TEAM: str = os.getenv("STRIPE_PRICE_ID_TEAM", "")

    # Upload settings
    UPLOAD_DIR: Path = Path("uploads")
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "gif"]

    # Email settings
    MAILERSEND_API_KEY: Optional[str] = os.getenv("MAILERSEND_API_KEY", "mlsn.633a7b62f3a7bbea05355a9fbd6828756c31b6a07effb34d03d3addbd71b4e1b")
    MAILERSEND_SMTP_HOST: str = "smtp.mailersend.net"
    MAILERSEND_SMTP_PORT: int = 587
    MAILERSEND_SMTP_USERNAME: str = os.getenv("MAILERSEND_SMTP_USERNAME", "MS_xqZKL5@scoremvp.com")
    MAILERSEND_SMTP_PASSWORD: str = os.getenv("MAILERSEND_SMTP_PASSWORD", "mssp.yAA7z00.yzkq3403xv04d796.WgibWXG")
    MAILERSEND_SENDER_EMAIL: str = os.getenv("MAILERSEND_SENDER_EMAIL", "no-reply@scoremvp.com")
    MAILERSEND_SENDER_NAME: str = "ScoreMVP"
    
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://scoremvp-frontend-production.up.railway.app")
    
    DATABASE_URL: Optional[str] = None
    ALGORITHM: str = "HS256"
    ENVIRONMENT: str = "development"
    TIMEZONE: str = "America/Sao_Paulo"
    SECURITY_PASSWORD_SALT: str = "scoremvp-salt-2024"
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"  # Ignorar variáveis extras não definidas

settings = Settings()
