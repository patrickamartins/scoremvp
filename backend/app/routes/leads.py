from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, Lead as LeadSchema
from typing import List
import logging

logger = logging.getLogger("uvicorn")

router = APIRouter()

@router.post("/leads", response_model=LeadSchema)
def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    """
    Cria um novo lead a partir dos dados do formulário da página inicial.
    """
    logger.info(f"Recebido: {lead}")
    db_lead = Lead(
        nome=lead.nome,
        email=lead.email,
        whatsapp=lead.whatsapp
    )
    db.add(db_lead)
    try:
        db.commit()
        db.refresh(db_lead)
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao salvar lead: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    logger.info(f"Salvo: {db_lead}")
    return db_lead

@router.get("/leads", response_model=List[LeadSchema])
def list_leads(db: Session = Depends(get_db)):
    """
    Lista todos os leads cadastrados.
    """
    return db.query(Lead).order_by(Lead.created_at.desc()).all()

# Endpoint futuro para listar leads (admin)
@router.get("/", response_model=List[LeadSchema])
def list_leads_admin(db: Session = Depends(get_db)):
    return db.query(Lead).order_by(Lead.created_at.desc()).all() 