from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from .routers import auth, games, players, profile

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar diretório de uploads se não existir
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Montar diretório de uploads
app.mount("/api/profile/avatar", StaticFiles(directory="uploads/avatars"), name="avatars")

# Incluir routers
app.include_router(auth.router)
app.include_router(games.router)
app.include_router(players.router)
app.include_router(profile.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Score MVP API"} 