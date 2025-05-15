from fastapi import APIRouter, Depends, HTTPException
from typing import List

import models
import database
import schemas

router = APIRouter(tags=["players"])

@router.post("/players", response_model=schemas.Player)
def create_player(player: schemas.PlayerCreate, db=Depends(database.get_db)):
    db_player = models.Player(**player.dict())
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

@router.get("/players", response_model=List[schemas.Player])
def list_players(db=Depends(database.get_db)):
    return db.query(models.Player).all()
