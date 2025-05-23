from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, players, games, estatisticas
from app.routes.dashboard import router as dashboard_router
from sqlalchemy.exc import IntegrityError
import os
import uvicorn
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Score MVP API")

# Configuração do CORS
origins = [
    "http://localhost:5173",
    "https://scoremvp-frontend.onrender.com",
    "https://scoremvp.com.br",
    "https://www.scoremvp.com.br",
    "https://score-mvp.vercel.app",
    "https://scoremvp.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth, prefix="/api")
app.include_router(players, prefix="/api")
app.include_router(games, prefix="/api")
app.include_router(estatisticas, prefix="/api")
app.include_router(dashboard_router, prefix="/api")

@app.get("/")
def read_root():
    logger.info("Root endpoint accessed")
    return {"message": "Bem-vindo à API do Score MVP"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port) 