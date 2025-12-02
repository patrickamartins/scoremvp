from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.models.base import Base

class EmailTemplateType(str, enum.Enum):
    ACCOUNT_ACTIVATION = "account_activation"
    WELCOME = "welcome"
    PASSWORD_RESET = "password_reset"
    AGENDA_EVENT = "agenda_event"
    GAME_FINISHED = "game_finished"
    SUBSCRIPTION = "subscription"

class EmailTemplate(Base):
    __tablename__ = "email_templates"

    id = Column(Integer, primary_key=True, index=True)
    template_type = Column(Enum(EmailTemplateType), nullable=False, unique=True)
    subject = Column(String, nullable=False)
    html_body = Column(Text, nullable=False)
    enabled = Column(Boolean, default=True)
    
    # Configuração de destinatários
    send_to_roles = Column(String, nullable=True)  # JSON array de roles: ["superadmin", "team_admin", ...]
    
    # Metadados
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

