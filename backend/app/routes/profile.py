from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.core.security import get_current_user, verify_password, get_password_hash
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.profile import UserStatsResponse, UserEventResponse
from app.models.user import User, UserRole
from app.crud import user as crud
from app.models.player import Player
from datetime import datetime
import os
import re
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profile", tags=["profile"])

# Diretório para upload de imagens
MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "media")
os.makedirs(MEDIA_DIR, exist_ok=True)

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class TeamLinkRequest(BaseModel):
    team_id: int

@router.get("/me", response_model=UserResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_my_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Não permitir alteração de CPF
    if hasattr(user_update, 'cpf') and user_update.cpf is not None:
        raise HTTPException(status_code=400, detail="Não é permitido alterar o CPF")
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Se houver password, hash ele
    if 'password' in update_data:
        update_data['hashed_password'] = get_password_hash(update_data.pop('password'))
    
    db_user = crud.update_user(db, user_id=current_user.id, user_update=UserUpdate(**update_data))
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return db_user

@router.post("/me/change-password", response_model=dict)
def change_password(
    password_data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Altera a senha do usuário"""
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta"
        )
    
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Senha alterada com sucesso"}

@router.post("/me/upload-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload de foto de perfil"""
    try:
        # Validar tipo de arquivo
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Arquivo deve ser uma imagem")
        
        contents = await file.read()
        
        # Validar tamanho (5MB)
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Arquivo muito grande (máximo 5MB)")
        
        # Sanitizar nome do arquivo
        name, ext = os.path.splitext(file.filename or 'image')
        safe_name = re.sub(r'[^a-zA-Z0-9]', '_', name)
        safe_name = re.sub(r'_+', '_', safe_name).strip('_')
        if not safe_name:
            safe_name = 'image'
        safe_filename = f"{safe_name}{ext}"
        
        # Salvar arquivo
        file_path = os.path.join(MEDIA_DIR, f"user_{current_user.id}_{safe_filename}")
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Atualizar URL no banco
        # Para desenvolvimento local, usar localhost
        base_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        image_url = f"{base_url}/media/user_{current_user.id}_{safe_filename}"
        
        current_user.profile_image = image_url
        db.commit()
        db.refresh(current_user)
        
        return {"url": image_url, "message": "Foto atualizada com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao fazer upload da foto: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload: {str(e)}")

@router.get("/teams", response_model=List[dict])
def list_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista todos os times (users com role team_admin)"""
    teams = db.query(User).filter(User.role == UserRole.TEAM_ADMIN).all()
    return [
        {
            "id": team.id,
            "name": team.name,
            "email": team.email,
        }
        for team in teams
    ]

@router.post("/me/request-team-link", response_model=dict)
def request_team_link(
    request: TeamLinkRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Solicita vinculação a um time (jogador solicita ao time)"""
    # Verificar se o time existe
    team = db.query(User).filter(
        User.id == request.team_id,
        User.role == UserRole.TEAM_ADMIN
    ).first()
    
    if not team:
        raise HTTPException(status_code=404, detail="Time não encontrado")
    
    # Verificar se o usuário já tem um player vinculado
    player = db.query(Player).filter(Player.user_id == current_user.id).first()
    if not player:
        raise HTTPException(status_code=400, detail="Usuário não possui perfil de jogador")
    
    # Verificar se já está vinculado a este time
    if player.team_id == request.team_id:
        raise HTTPException(status_code=400, detail="Você já está vinculado a este time")
    
    # Criar notificação para o time_admin
    from app.crud import notification as notification_crud
    from app.schemas.notification import NotificationCreate
    from app.models.notification import NotificationTarget, UserNotification
    
    notification_content = f"{current_user.name} solicitou ser vinculado ao seu time. Deseja aceitar?"
    notification = notification_crud.create_notification(
        db=db,
        notification=NotificationCreate(
            content=notification_content,
            url=f"/notificacoes",
            target=NotificationTarget.TEAM_ADMINS
        ),
        creator_id=current_user.id
    )
    
    # Criar UserNotification específica para o team_admin
    user_notification = UserNotification(
        user_id=team.id,
        notification_id=notification.id,
        is_read=False
    )
    db.add(user_notification)
    
    # Salvar metadata na notificação
    import json
    metadata = {
        "type": "player_team_link_request",
        "team_id": request.team_id,
        "player_id": player.id,
        "player_name": current_user.name
    }
    notification.url = json.dumps(metadata)
    db.commit()
    
    return {"message": "Solicitação de vinculação enviada com sucesso"}

@router.get("/me/stats", response_model=UserStatsResponse)
def get_my_stats(
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Buscar estatísticas individuais do usuário por ano
    # (Implementação mock, ajustar para buscar dados reais)
    if not year:
        year = datetime.now().year
    # Exemplo de retorno
    return UserStatsResponse(
        evolution=[{"month": m, "points": 100 + m*10} for m in range(1, 13)],
        assists=[{"month": m, "total": 5 + m} for m in range(1, 13)],
        free_throws=[{"month": m, "total": 3 + m} for m in range(1, 13)],
        rebounds=[{"month": m, "total": 7 + m} for m in range(1, 13)],
    )

@router.get("/me/events", response_model=List[UserEventResponse])
def get_my_events(
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Buscar eventos/convocações do usuário por ano
    # (Implementação mock, ajustar para buscar dados reais)
    if not year:
        year = datetime.now().year
    return [
        UserEventResponse(date=f"2024-06-01", status="accepted", title="Convocação 1"),
        UserEventResponse(date=f"2024-06-10", status="pending", title="Evento 2"),
        UserEventResponse(date=f"2024-06-15", status="rejected", title="Convocação 3"),
    ]
