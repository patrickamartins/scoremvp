from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, players, games, estatisticas
from app.routes.dashboard import router as dashboard_router
from sqlalchemy.exc import IntegrityError

app = FastAPI(title="Score MVP API")

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique as origens permitidas
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
    return {"message": "Bem-vindo à API do Score MVP"} 