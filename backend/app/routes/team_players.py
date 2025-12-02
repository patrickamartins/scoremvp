from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.database import get_db
from app import models
from app.core.security import get_current_user
from app.schemas.team_link import TeamLinkRequest, TeamLinkResponse, AcceptTeamLinkRequest
from app.crud import notification as notification_crud
from app.schemas.notification import NotificationCreate
from app.models.notification import NotificationTarget, UserNotification

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/team-players",
    tags=["team-players"],
)

@router.post("/link", response_model=TeamLinkResponse)
def request_player_link(
    request: TeamLinkRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Solicita vínculo de um jogador ao time (apenas team_admin ou superadmin)"""
    if current_user.role not in ["team_admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores de time podem vincular jogadores"
        )
    
    # Buscar jogador pelo email
    player_user = db.query(models.User).filter(
        models.User.email == request.player_email
    ).first()
    
    if not player_user:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado com este email"
        )
    
    # Verificar se o usuário tem perfil de jogador
    player = db.query(models.Player).filter(
        models.Player.user_id == player_user.id
    ).first()
    
    if not player:
        raise HTTPException(
            status_code=400,
            detail="Este usuário não possui perfil de jogador"
        )
    
    # Verificar se já está vinculado a este time
    if player.team_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Jogador já está vinculado ao seu time"
        )
    
    # Criar notificação para o jogador
    notification_content = f"{current_user.name} solicitou vincular você ao time dele. Deseja aceitar?"
    notification = notification_crud.create_notification(
        db=db,
        notification=NotificationCreate(
            content=notification_content,
            url=f"/notificacoes",
            target=NotificationTarget.PLAYERS
        ),
        creator_id=current_user.id
    )
    
    # Criar UserNotification específica para este jogador
    user_notification = UserNotification(
        user_id=player_user.id,
        notification_id=notification.id,
        is_read=False
    )
    db.add(user_notification)
    
    # Salvar metadata na notificação (team_id e player_id)
    # Usar campo url para armazenar JSON com metadata
    import json
    metadata = {
        "type": "team_link_request",
        "team_id": current_user.id,
        "player_id": player.id,
        "team_name": current_user.name
    }
    notification.url = json.dumps(metadata)
    db.commit()
    
    return TeamLinkResponse(
        message="Solicitação de vínculo enviada ao jogador",
        notification_id=notification.id
    )

@router.post("/accept-link", response_model=dict)
def accept_team_link(
    request: AcceptTeamLinkRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Aceita ou rejeita vínculo ao time"""
    # Buscar notificação
    user_notification = db.query(UserNotification).filter(
        UserNotification.id == request.notification_id,
        UserNotification.user_id == current_user.id
    ).first()
    
    if not user_notification:
        raise HTTPException(
            status_code=404,
            detail="Notificação não encontrada"
        )
    
    from app.models.notification import Notification
    notification = db.query(Notification).filter(
        Notification.id == user_notification.notification_id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notificação não encontrada"
        )
    
    # Parsear metadata
    import json
    try:
        metadata = json.loads(notification.url or "{}")
        if metadata.get("type") != "team_link_request":
            raise HTTPException(status_code=400, detail="Tipo de notificação inválido")
        
        team_id = metadata.get("team_id")
        player_id = metadata.get("player_id")
    except:
        raise HTTPException(status_code=400, detail="Notificação inválida")
    
    # Buscar jogador
    player = db.query(models.Player).filter(
        models.Player.id == player_id,
        models.Player.user_id == current_user.id
    ).first()
    
    if not player:
        raise HTTPException(
            status_code=404,
            detail="Jogador não encontrado"
        )
    
    if request.accept:
        # Desvincular do time atual se existir
        old_team_id = player.team_id
        if old_team_id:
            logger.info(f"Desvinculando jogador {player.id} do time {old_team_id}")
        
        # Vincular ao novo time
        player.team_id = team_id
        db.commit()
        
        # Marcar notificação como lida
        user_notification.is_read = True
        db.commit()
        
        return {
            "message": "Vínculo ao time aceito com sucesso",
            "team_id": team_id
        }
    else:
        # Rejeitar vínculo
        user_notification.is_read = True
        db.commit()
        
        return {
            "message": "Vínculo ao time rejeitado"
        }

@router.get("/my-players", response_model=List[dict])
def get_my_team_players(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Lista jogadores vinculados ao time do usuário (apenas team_admin ou superadmin)"""
    if current_user.role not in ["team_admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores de time podem ver jogadores vinculados"
        )
    
    players = db.query(models.Player).filter(
        models.Player.team_id == current_user.id
    ).all()
    
    result = []
    for player in players:
        player_data = {
            "id": player.id,
            "name": player.name,
            "number": player.number,
            "position": player.position,
            "categoria": player.categoria,
            "active": player.active,
            "user_id": player.user_id,
        }
        if player.user:
            player_data["user_email"] = player.user.email
        result.append(player_data)
    
    return result

@router.delete("/unlink/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
def unlink_player(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Remove vínculo de um jogador do time"""
    if current_user.role not in ["team_admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores de time podem desvincular jogadores"
        )
    
    player = db.query(models.Player).filter(
        models.Player.id == player_id,
        models.Player.team_id == current_user.id
    ).first()
    
    if not player:
        raise HTTPException(
            status_code=404,
            detail="Jogador não encontrado ou não está vinculado ao seu time"
        )
    
    player.team_id = None
    db.commit()
    
    return None

