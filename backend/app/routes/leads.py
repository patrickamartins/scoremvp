from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Lead
from app.schemas import LeadCreate, LeadOut
from typing import List
import logging

router = APIRouter(prefix="/leads", tags=["leads"])
logger = logging.getLogger("uvicorn")

@router.post("/", response_model=LeadOut)
def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    logger.info(f"Recebido: {lead}")
    db_lead = Lead(**lead.dict())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    logger.info(f"Salvo: {db_lead}")
    return db_lead

# Endpoint futuro para listar leads (admin)
@router.get("/", response_model=List[LeadOut])
def list_leads(db: Session = Depends(get_db)):
    return db.query(Lead).order_by(Lead.created_at.desc()).all() 