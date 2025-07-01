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
    logger.info(f"Recebido lead: {lead}")
    logger.info(f"Tipo do lead: {type(lead)}")
    logger.info(f"Lead nome: {lead.nome}, email: {lead.email}, whatsapp: {lead.whatsapp}")
    
    try:
        logger.info("Criando objeto Lead...")
        db_lead = Lead(
            nome=lead.nome,
            email=lead.email,
            telefone=lead.whatsapp  # Mapear whatsapp para telefone
        )
        logger.info(f"Lead criado: {db_lead}")
        logger.info("Adicionando ao banco...")
        db.add(db_lead)
        logger.info("Fazendo commit...")
        db.commit()
        logger.info("Fazendo refresh...")
        db.refresh(db_lead)
        logger.info(f"Lead salvo com sucesso: {db_lead}")
        return db_lead
    except Exception as e:
        logger.error(f"Erro ao salvar lead: {e}")
        logger.error(f"Tipo do erro: {type(e)}")
        logger.error(f"Traceback completo: ", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

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