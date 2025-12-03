from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json

from app.database import get_db
from app.models import EmailTemplate, EmailTemplateType
from app.schemas.email_template import EmailTemplateOut, EmailTemplateCreate, EmailTemplateUpdate
from app.core.deps import get_current_active_superadmin
from app.models.user import User

router = APIRouter(
    prefix="/email-templates",
    tags=["email-templates"],
)

@router.get(
    "",
    response_model=List[EmailTemplateOut],
    summary="Lista todos os templates de email (apenas admin)",
)
def list_email_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superadmin),
):
    """Lista todos os templates de email - apenas para superadmin"""
    try:
        templates = db.query(EmailTemplate).all()
        result = []
        for template in templates:
            try:
                template_dict = {
                    "id": template.id,
                    "template_type": template.template_type,
                    "subject": template.subject,
                    "html_body": template.html_body,
                    "enabled": template.enabled,
                    "send_to_roles": json.loads(template.send_to_roles) if template.send_to_roles else [],
                    "created_at": template.created_at,
                    "updated_at": template.updated_at,
                }
                result.append(EmailTemplateOut(**template_dict))
            except Exception as e:
                # Se houver erro ao processar um template, pular e continuar
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Erro ao processar template {template.id}: {e}")
                continue
        return result
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Erro ao listar templates: {e}", exc_info=True)
        # Se a tabela não existir, retornar lista vazia
        return []

@router.get(
    "/{template_type}",
    response_model=EmailTemplateOut,
    summary="Busca um template por tipo (apenas admin)",
)
def get_email_template(
    template_type: EmailTemplateType,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superadmin),
):
    """Busca um template de email por tipo - apenas para superadmin"""
    template = db.query(EmailTemplate).filter(EmailTemplate.template_type == template_type).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    return EmailTemplateOut(
        id=template.id,
        template_type=template.template_type,
        subject=template.subject,
        html_body=template.html_body,
        enabled=template.enabled,
        send_to_roles=json.loads(template.send_to_roles) if template.send_to_roles else [],
        created_at=template.created_at,
        updated_at=template.updated_at,
    )

@router.post(
    "",
    response_model=EmailTemplateOut,
    status_code=status.HTTP_201_CREATED,
    summary="Cria um novo template de email (apenas admin)",
)
def create_email_template(
    template_in: EmailTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superadmin),
):
    """Cria um novo template de email - apenas para superadmin"""
    # Verificar se já existe template deste tipo
    existing = db.query(EmailTemplate).filter(
        EmailTemplate.template_type == template_in.template_type
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Já existe um template do tipo {template_in.template_type}"
        )
    
    template = EmailTemplate(
        template_type=template_in.template_type,
        subject=template_in.subject,
        html_body=template_in.html_body,
        enabled=template_in.enabled,
        send_to_roles=json.dumps(template_in.send_to_roles) if template_in.send_to_roles else None,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return EmailTemplateOut(
        id=template.id,
        template_type=template.template_type,
        subject=template.subject,
        html_body=template.html_body,
        enabled=template.enabled,
        send_to_roles=json.loads(template.send_to_roles) if template.send_to_roles else [],
        created_at=template.created_at,
        updated_at=template.updated_at,
    )

@router.put(
    "/{template_id}",
    response_model=EmailTemplateOut,
    summary="Atualiza um template de email (apenas admin)",
)
def update_email_template(
    template_id: int,
    template_in: EmailTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superadmin),
):
    """Atualiza um template de email - apenas para superadmin"""
    template = db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    data = template_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        if field == "send_to_roles":
            setattr(template, field, json.dumps(value) if value else None)
        else:
            setattr(template, field, value)
    
    db.commit()
    db.refresh(template)
    
    return EmailTemplateOut(
        id=template.id,
        template_type=template.template_type,
        subject=template.subject,
        html_body=template.html_body,
        enabled=template.enabled,
        send_to_roles=json.loads(template.send_to_roles) if template.send_to_roles else [],
        created_at=template.created_at,
        updated_at=template.updated_at,
    )

@router.delete(
    "/{template_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove um template de email (apenas admin)",
)
def delete_email_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superadmin),
):
    """Remove um template de email - apenas para superadmin"""
    template = db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    db.delete(template)
    db.commit()
    return None

