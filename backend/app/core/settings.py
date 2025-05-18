from pydantic import BaseSettings, Field
from typing import List

class Settings(BaseSettings):
    database_url: str = Field(
        default="postgresql+psycopg2://scoremvp_user:tEISM0baf5PNnxiL26y1OqvsiE1fXgXo@dpg-d0l17856ubrc73bmt21g-a.oregon-postgres.render.com:5432/scoremvp",
        description="dpg-d0l17856ubrc73bmt21g-a.oregon-postgres.render.com"
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
        default=["http://localhost:5173", "https://score-mvp.vercel.app"],
        description="Origins permitidas no CORS"
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