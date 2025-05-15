import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Variáveis fornecidas pelo Railway
USER     = os.environ['MYSQLUSER']
PASS     = os.environ['MYSQLPASSWORD']
HOST     = os.environ['MYSQLHOST']
PORT     = os.environ['MYSQLPORT']
DATABASE = os.environ.get('MYSQLDATABASE') or os.environ.get('MYSQL_DATABASE')

# DATABASE_URL: se o Railway fornecer, use; senão monte a partir das variáveis
DATABASE_URL = os.environ.get(
    'DATABASE_URL',
    f"mysql+pymysql://{USER}:{PASS}@{HOST}:{PORT}/{DATABASE}"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# importa models para o metadata “enxergar” todas as tabelas
import models  # noqa
