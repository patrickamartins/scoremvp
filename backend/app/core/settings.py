from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os

class Settings(BaseSettings):
    database_url: str = Field(
        default=os.getenv("DATABASE_URL"),
        description="URL do banco de dados"
    )
    # JWT
    SECRET_KEY: str = Field(
        default="09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7",
        description="Chave secreta para assinatura do JWT"
    )
    ALGORITHM: str = Field(
        default="HS256",
        description="Algoritmo de assinatura do JWT"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30,
        description="Tempo de expiração do token em minutos"
    )
    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=[
            # Desenvolvimento
            "http://localhost:5173",
            "http://localhost:3000",
            # Produção
            "https://scoremvp.com.br",
            "https://score-mvp.vercel.app"
        ],
        description="Origins permitidas no CORS (desenvolvimento e produção)"
    )
    # Environment
    ENVIRONMENT: str = Field(
        default="development",
        description="Ambiente de execução (development/production)"
    )

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()