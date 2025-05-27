from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.players import router as players_router
from app.routes.games import router as games_router
from app.routes.estatisticas import router as estatisticas_router
from app.database import init_db
from app.core.settings import settings
from app.routes.dashboard import router as dashboard_router
from app.routes.leads import router as leads_router
from sqlalchemy.exc import IntegrityError
import os
import uvicorn
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializar o banco de dados
init_db()

app = FastAPI(
    title="ScoreMVP API",
    version="1.0.0",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Incluir routers
app.include_router(auth_router, prefix="/api")
app.include_router(players_router, prefix="/api")
app.include_router(games_router, prefix="/api")
app.include_router(estatisticas_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(leads_router, prefix="/api")

@app.get("/")
def read_root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to ScoreMVP API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/debug-db-url")
def debug_db_url():
    return {"database_url": settings.database_url}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port) 