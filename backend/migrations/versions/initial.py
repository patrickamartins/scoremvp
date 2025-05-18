"""initial

Revision ID: initial
Revises: 
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Criar tabela users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=32), nullable=False),
        sa.Column('email', sa.String(length=128), nullable=False),
        sa.Column('hashed_password', sa.String(length=128), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Criar tabela jogadoras
    op.create_table(
        'jogadoras',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nome', sa.String(length=100), nullable=False),
        sa.Column('numero', sa.Integer(), nullable=False),
        sa.Column('posicao', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_jogadoras_id'), 'jogadoras', ['id'], unique=False)
    op.create_index(op.f('ix_jogadoras_nome'), 'jogadoras', ['nome'], unique=True)

    # Criar tabela jogos
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

    # Criar tabela estatisticas
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
    op.drop_index(op.f('ix_estatisticas_id'), table_name='estatisticas')
    op.drop_table('estatisticas')
    op.drop_index(op.f('ix_jogos_id'), table_name='jogos')
    op.drop_table('jogos')
    op.drop_index(op.f('ix_jogadoras_nome'), table_name='jogadoras')
    op.drop_index(op.f('ix_jogadoras_id'), table_name='jogadoras')
    op.drop_table('jogadoras')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users') 