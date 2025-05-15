from fastapi import APIRouter, Depends, HTTPException
from typing import List

import models
import database
import schemas

router = APIRouter(tags=["games"])

@router.post("/games", response_model=schemas.Game)
def create_game(game: schemas.GameCreate, db=Depends(database.get_db)):
    db_game = models.Game(**game.dict())
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game

@router.get("/games", response_model=List[schemas.Game])
def list_games(db=Depends(database.get_db)):
    return db.query(models.Game).all()
