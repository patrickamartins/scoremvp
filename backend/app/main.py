import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes.auth import router as auth_router
from app.routes.players import router as players_router
from app.routes.games import router as games_router
from app.routes.estatisticas import router as estatisticas_router, stats_router
from app.routes.leads import router as leads_router
from app.core.config import settings
from app.routes.dashboard import router as dashboard_router
from app.routes.profile import router as profile_router
from app.routes.email_templates import router as email_templates_router
from app.routes.stripe import router as stripe_router
from app.routes.team_players import router as team_players_router
import logging
from app.database import engine, Base

# Importar todos os modelos para garantir que sejam carregados
from app.models import (
    User, UserRole, UserPlan,
    Game, Player, Statistic, Lead,
    Notification, UserNotification, NotificationTarget
)

# Configurar logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Caminho absoluto baseado no local do main.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_DIR = os.path.join(BASE_DIR, "media")

# Cria a pasta se não existir
os.makedirs(MEDIA_DIR, exist_ok=True)

# Create database tables
# Base.metadata.create_all(bind=engine)  # Comentado temporariamente

app = FastAPI(
    title=settings.project_name,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Incluir routers
app.include_router(auth_router, prefix="/api")
app.include_router(players_router, prefix="/api")
app.include_router(games_router, prefix="/api")
app.include_router(estatisticas_router, prefix="/api")
app.include_router(stats_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(leads_router, prefix="/api")  # Adicionar prefix /api
app.include_router(email_templates_router, prefix="/api")
app.include_router(stripe_router, prefix="/api")
app.include_router(team_players_router, prefix="/api")
from app.api.endpoints.users import router as users_router
app.include_router(users_router, prefix="/api/users", tags=["users"])

# Montar arquivos estáticos
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

@app.get("/")
def root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to Score MVP API"}

@app.get("/health")
def health_check():
    logger.info("Health check endpoint accessed")
    return {"status": "ok"}

@app.get("/api/debug-db-url")
def debug_db_url():
    logger.info(f"Database URL: {settings.SQLALCHEMY_DATABASE_URI}")
    return {"database_url": settings.SQLALCHEMY_DATABASE_URI}

@app.get("/api/debug-cors")
def debug_cors():
    logger.info(f"CORS Origins: {settings.BACKEND_CORS_ORIGINS}")
    return {
        "cors_origins": settings.BACKEND_CORS_ORIGINS,
        "cors_type": str(type(settings.BACKEND_CORS_ORIGINS))
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting server on port {port}")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="debug",
        forwarded_allow_ips="*"
    )