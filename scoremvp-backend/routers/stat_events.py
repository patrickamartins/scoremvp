from fastapi import APIRouter, Depends, HTTPException
from typing import List

import models
import database
import schemas

router = APIRouter(tags=["stat_events"])

@router.post("/stats", response_model=List[schemas.StatEvent])
def create_stat_events(events: List[schemas.StatEventCreate], db=Depends(database.get_db)):
    db_events = [models.StatEvent(**e.dict()) for e in events]
    db.add_all(db_events)
    db.commit()
    return db_events

@router.get("/stats/{game_id}", response_model=List[schemas.StatEvent])
def list_stats_for_game(game_id: int, db=Depends(database.get_db)):
    return db.query(models.StatEvent).filter(models.StatEvent.game_id == game_id).all()
