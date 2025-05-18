"""fix_gamestatus_enum

Revision ID: ed2c65fa9cad
Revises: initial
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'ed2c65fa9cad'
down_revision = 'initial'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Não é necessário alterar a coluna status, pois a tabela será dropada e recriada
    # op.alter_column('jogos', 'status', ...)
    
    op.execute('DROP TABLE IF EXISTS estatisticas')
    op.execute('DROP TABLE IF EXISTS jogos')
    
    # Recriar a tabela jogos com o novo enum
    op.create_table(
        'jogos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('opponent', sa.String(length=100), nullable=False),
        sa.Column('date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('location', sa.String(length=100), nullable=True),
        sa.Column('status', sa.Enum('PENDENTE', 'EM_ANDAMENTO', 'FINALIZADO', name='gamestatus'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_jogos_id'), 'jogos', ['id'], unique=False)
    
    # Recriar a tabela estatisticas
    op.create_table(
        'estatisticas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('jogadora_id', sa.Integer(), nullable=False),
        sa.Column('jogo_id', sa.Integer(), nullable=False),
        sa.Column('pontos', sa.Integer(), nullable=True),
        sa.Column('assistencias', sa.Integer(), nullable=True),
        sa.Column('rebotes', sa.Integer(), nullable=True),
        sa.Column('roubos', sa.Integer(), nullable=True),
        sa.Column('faltas', sa.Integer(), nullable=True),
        sa.Column('quarto', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['jogadora_id'], ['jogadoras.id'], ),
        sa.ForeignKeyConstraint(['jogo_id'], ['jogos.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_estatisticas_id'), 'estatisticas', ['id'], unique=False)

def downgrade() -> None:
    # Não é necessário alterar a coluna status, pois a tabela será dropada e recriada
    # op.alter_column('jogos', 'status', ...)
    
    op.execute('DROP TABLE IF EXISTS estatisticas')
    op.execute('DROP TABLE IF EXISTS jogos')
    
    # Recriar as tabelas com o enum antigo
    op.create_table(
        'jogos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('opponent', sa.String(length=100), nullable=False),
        sa.Column('date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('location', sa.String(length=100), nullable=True),
        sa.Column('status', sa.Enum('pendente', 'em_andamento', 'finalizado', name='gamestatus'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_jogos_id'), 'jogos', ['id'], unique=False)
    
    op.create_table(
        'estatisticas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('jogadora_id', sa.Integer(), nullable=False),
        sa.Column('jogo_id', sa.Integer(), nullable=False),
        sa.Column('pontos', sa.Integer(), nullable=True),
        sa.Column('assistencias', sa.Integer(), nullable=True),
        sa.Column('rebotes', sa.Integer(), nullable=True),
        sa.Column('roubos', sa.Integer(), nullable=True),
        sa.Column('faltas', sa.Integer(), nullable=True),
        sa.Column('quarto', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['jogadora_id'], ['jogadoras.id'], ),
        sa.ForeignKeyConstraint(['jogo_id'], ['jogos.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_estatisticas_id'), 'estatisticas', ['id'], unique=False)
