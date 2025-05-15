# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registre aqui seu router:
app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.on_event("startup")
def print_routes():
    print("=== ROTAS DISPONÍVEIS ===")
    for route in app.router.routes:
        methods = ",".join(route.methods) if route.methods else ""
        print(f"{methods:10} → {route.path}")

# 2️⃣ Inclua cada router só uma vez, com prefixo
app.include_router(auth.router,    prefix="/auth", tags=["auth"])
app.include_router(players.router, prefix="/players")
app.include_router(games.router,   prefix="/games")
app.include_router(stat_events.router, prefix="/stat_events")

@app.get("/")
def read_root():
    return {"msg": "ScoreMVP backend rodando!"}


