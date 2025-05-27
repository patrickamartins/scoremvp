import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Jogadora, Jogo, Estatistica
from app.database import Base
from datetime import datetime
import os

# Configuração do banco (ajuste conforme necessário)
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/scoremvp?client_encoding=utf8')
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Lê o CSV
csv_path = os.path.join(os.path.dirname(__file__), 'estatisticas.csv')
df = pd.read_csv(csv_path, sep=';', encoding='utf-8')

def get_or_create_jogadora(nome):
    jogadora = session.query(Jogadora).filter_by(nome=nome).first()
    if not jogadora:
        jogadora = Jogadora(nome=nome, numero=0, posicao=None)
        session.add(jogadora)
        session.commit()
    return jogadora

def get_or_create_jogo(row):
    jogo = session.query(Jogo).filter_by(
        opponent=row['Adversário'],
        date=datetime.strptime(row['Data'] + ' ' + row['Horário'], '%d/%m/%Y %H:%M'),
        location=row['Local'],
        categoria=row['Categoria'],
        time=row['Time']
    ).first()
    if not jogo:
        # Ajuste o owner_id conforme necessário (ex: 1 para admin)
        jogo = Jogo(
            opponent=row['Adversário'],
            date=datetime.strptime(row['Data'] + ' ' + row['Horário'], '%d/%m/%Y %H:%M'),
            location=row['Local'],
            categoria=row['Categoria'],
            time=row['Time'],
            status='FINALIZADO',
            owner_id=1
        )
        session.add(jogo)
        session.commit()
    return jogo

def importar_estatisticas():
    for _, row in df.iterrows():
        jogadora = get_or_create_jogadora(row['Nome Jogador'])
        jogo = get_or_create_jogo(row)
        # Verifica se já existe estatística para essa jogadora e jogo
        estat = session.query(Estatistica).filter_by(jogadora_id=jogadora.id, jogo_id=jogo.id).first()
        if estat:
            continue
        estat = Estatistica(
            jogadora_id=jogadora.id,
            jogo_id=jogo.id,
            pontos=int(row['Pontos Totais']),
            assistencias=int(row['Assistências']),
            rebotes=int(row['Rebotes']),
            roubos=int(row['Roubadas']),
            faltas=int(row['Faltas']),
            interferencia=0,  # Não há coluna correspondente
            quarto=1  # Não há coluna correspondente, default 1
        )
        session.add(estat)
        session.commit()
    print('Importação concluída!')

if __name__ == '__main__':
    importar_estatisticas() 