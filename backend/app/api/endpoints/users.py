from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from typing import List
from app.models.user import User
from app.models.player import Player
from app.schemas.user import UserOut, UserCreate, UserUpdate
from app.core.deps import get_db, get_current_active_superadmin
from sqlalchemy.orm import Session
import os
from app.schemas.player import PlayerOut
import logging
import re

logger = logging.getLogger(__name__)

router = APIRouter()

MEDIA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../media')
os.makedirs(MEDIA_DIR, exist_ok=True)

# Verificar se a pasta media existe e tem permissões
logger.info(f"Pasta media: {MEDIA_DIR}")
logger.info(f"Pasta existe: {os.path.exists(MEDIA_DIR)}")
logger.info(f"Permissão de escrita: {os.access(MEDIA_DIR, os.W_OK)}")

def user_to_out(user: User) -> dict:
    try:
        # Buscar player vinculado
        player = getattr(user, 'player_profile', None)
        
        # Garantir que todos os campos sejam retornados
        result = {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "is_active": user.is_active,
            "profile_image": user.profile_image,
            "phone": user.phone,
            "cpf": user.cpf,
            "favorite_team": user.favorite_team,
            "playing_team": user.playing_team,
            "plan": user.plan,
            "status": "active" if user.is_active else "inactive",
            "type": user.role.value,
            "photoUrl": user.profile_image,  # Para compatibilidade com frontend
        }
        
        # Adicionar campos do Player se existir
        if player:
            result["number"] = player.number
            result["position"] = player.position
        else:
            # Se não há Player, usar campos do User (se existirem)
            result["number"] = getattr(user, 'number', None)
            result["position"] = getattr(user, 'position', None)
        
        return result
    except Exception as e:
        logger.error(f"Erro ao converter usuário {user.id}: {e}")
        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "is_active": user.is_active,
            "number": getattr(user, 'number', None),
            "position": getattr(user, 'position', None),
            "profile_image": user.profile_image,
            "phone": user.phone,
            "cpf": user.cpf,
            "favorite_team": user.favorite_team,
            "playing_team": user.playing_team,
            "plan": user.plan,
            "status": "active" if user.is_active else "inactive",
            "type": user.role.value,
            "photoUrl": user.profile_image,
        }

@router.get("/", response_model=List[UserOut])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_superadmin)):
    try:
        users = db.query(User).offset(skip).limit(limit).all()
        logger.info(f"Buscando {len(users)} usuários")
        # Garantir que player_profile está carregado
        for user in users:
            _ = getattr(user, 'player_profile', None)
        return [user_to_out(user) for user in users]
    except Exception as e:
        logger.error(f"Erro ao buscar usuários: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

# Endpoint para listar jogadores com usuário vinculado
@router.get("/players-with-user", response_model=List[PlayerOut])
def get_players_with_user(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_superadmin)):
    try:
        players = db.query(Player).filter(Player.user_id.isnot(None)).all()
        return players
    except Exception as e:
        logger.error(f"Erro ao buscar jogadores com usuário: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_superadmin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_to_out(user)

@router.post("/", response_model=UserOut)
def create_user(user_in: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_superadmin)):
    try:
        from app.core.security import get_password_hash
        
        # Verificar se o email já existe
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        
        user = User(
            email=user_in.email,
            name=user_in.name,
            hashed_password=get_password_hash(user_in.password),
            role=user_in.role,
            plan=user_in.plan,
            is_active=user_in.is_active,
            profile_image=user_in.profile_image,
            phone=getattr(user_in, 'phone', None),
            cpf=getattr(user_in, 'cpf', None),
            favorite_team=getattr(user_in, 'favorite_team', None),
            playing_team=getattr(user_in, 'playing_team', None),
            number=getattr(user_in, 'number', None),
            position=getattr(user_in, 'position', None),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Criar player vinculado
        player = Player(
            name=user.name,
            number=getattr(user_in, 'number', None),
            position=getattr(user_in, 'position', None),
            user_id=user.id
        )
        db.add(player)
        db.commit()
        db.refresh(user)
        
        logger.info(f"Usuário criado com sucesso: {user.email}")
        return user_to_out(user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar usuário: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_superadmin)):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        update_data = user_in.dict(exclude_unset=True)
        if "password" in update_data:
            from app.core.security import get_password_hash
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        # Atualizar campos do usuário
        for field, value in update_data.items():
            if hasattr(user, field):
                # Tratar campo number especificamente
                if field == "number" and value is not None:
                    try:
                        setattr(user, field, int(value))
                    except (ValueError, TypeError):
                        setattr(user, field, None)
                else:
                    setattr(user, field, value)
        
        # Garantir que o Player vinculado existe e está atualizado
        player = getattr(user, 'player_profile', None)
        if not player:
            # Criar Player se não existir
            player = Player(
                name=user.name,
                number=update_data.get("number"),
                position=update_data.get("position"),
                user_id=user.id
            )
            db.add(player)
        else:
            # Atualizar Player existente
            if "number" in update_data:
                try:
                    player.number = int(update_data["number"]) if update_data["number"] is not None else None
                except (ValueError, TypeError):
                    player.number = None
            if "position" in update_data:
                player.position = update_data["position"]
            db.add(player)
        
        db.commit()
        db.refresh(user)
        db.refresh(player)
        
        logger.info(f"Usuário {user_id} atualizado com sucesso")
        logger.info(f"Campos salvos - profile_image: {user.profile_image}, number: {user.number}, position: {user.position}")
        if player:
            logger.info(f"Player vinculado - number: {player.number}, position: {player.position}")
        
        return user_to_out(user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar usuário {user_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@router.post("/{user_id}/photo")
async def upload_user_photo(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superadmin)
):
    try:
        contents = await file.read()
        
        # Sanitizar o nome do arquivo (remover espaços e caracteres especiais)
        original_filename = file.filename
        safe_filename = re.sub(r'[^a-zA-Z0-9._-]', '_', file.filename)
        safe_filename = safe_filename.replace(' ', '_')
        safe_filename = safe_filename.replace('%20', '_')
        # Garantir que não há espaços ou caracteres problemáticos
        safe_filename = re.sub(r'_+', '_', safe_filename)  # Múltiplos underscores viram um só
        safe_filename = safe_filename.strip('_')  # Remove underscores no início e fim
        
        logger.info(f"Upload de foto - Nome original: {original_filename}")
        logger.info(f"Upload de foto - Nome sanitizado: {safe_filename}")
        
        file_path = os.path.join(MEDIA_DIR, f"user_{user_id}_{safe_filename}")
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Verificar se o arquivo foi salvo corretamente
        if os.path.exists(file_path):
            logger.info(f"Arquivo salvo com sucesso: {file_path}")
            logger.info(f"Tamanho do arquivo: {os.path.getsize(file_path)} bytes")
        else:
            logger.error(f"ERRO: Arquivo não foi salvo: {file_path}")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Usar URL completa para a imagem
        base_url = "https://scoremvpback-production.up.railway.app"
        image_url = f"{base_url}/media/user_{user_id}_{safe_filename}"
        user.profile_image = image_url
        db.commit()
        db.refresh(user)
        
        logger.info(f"Foto salva para usuário {user_id}: {image_url}")
        logger.info(f"Arquivo salvo em: {file_path}")
        
        # O player vinculado acessa a foto via user.profile_image
        return {"filename": safe_filename, "url": user.profile_image}
    except Exception as e:
        logger.error(f"Erro ao fazer upload da foto do usuário {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@router.patch("/{user_id}/link-player/{player_id}")
def link_player_to_user(user_id: int, player_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_superadmin)):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        player = db.query(Player).filter(Player.id == player_id).first()
        if not user or not player:
            raise HTTPException(status_code=404, detail="User or Player not found")
        player.user_id = user.id
        db.add(player)
        db.commit()
        return {"message": f"Player {player.name} vinculado ao usuário {user.name}"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao vincular player {player_id} ao usuário {user_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}") 