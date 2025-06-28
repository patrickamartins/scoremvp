# backend/app/app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

from app.routes.auth import router as auth_router
from app.routes.players import router as players_router
from app.routes.games import router as games_router
from app.routes.estatisticas import router as estatisticas_router, stats_router
from app.core.config import settings
from app.api.v1 import auth

app = FastAPI(
    title=settings.project_name,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui as rotas
app.include_router(auth_router, prefix="/api")
app.include_router(players_router, prefix="/api")
app.include_router(games_router, prefix="/api")
app.include_router(estatisticas_router, prefix="/api")
app.include_router(stats_router, prefix="/api")
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])

# Tratamento de erros de validação
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

# Rota de health check
@app.get("/health")
async def health_check():
    return {"status": "ok"}
