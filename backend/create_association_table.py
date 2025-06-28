from sqlalchemy import create_engine, Table, Column, Integer, ForeignKey, MetaData
from app.core.config import settings

# Criar engine
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)

# Criar metadata
metadata = MetaData()

# Definir tabela de associação
jogo_jogadora = Table(
    'jogo_jogadora',
    metadata,
    Column('jogo_id', Integer, ForeignKey('jogos.id'), primary_key=True),
    Column('jogadora_id', Integer, ForeignKey('jogadoras.id'), primary_key=True)
)

# Criar tabela
metadata.create_all(engine) 