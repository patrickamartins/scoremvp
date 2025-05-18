# backend/app/app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

from app.routes.auth import router as auth_router
from app.routes.players import router as players_router
from app.routes.games import router as games_router
from app.routes.estatisticas import router as estatisticas_router
from app.core.settings import settings

app = FastAPI(
    title="Score MVP API",
    description="API para gerenciamento de estatísticas de jogos de basquete",
    version="1.0.0",
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui as rotas
app.include_router(auth_router, prefix="/api")
app.include_router(players_router, prefix="/api")
app.include_router(games_router, prefix="/api")
app.include_router(estatisticas_router, prefix="/api")

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
