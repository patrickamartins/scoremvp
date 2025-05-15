import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Railway provê DATABASE_URL; se não existir, monta a partir das variáveis:
DATABASE_URL = os.environ.get(
    'DATABASE_URL',
    f"mysql+pymysql://{os.environ['MYSQLUSER']}:{os.environ['MYSQLPASSWORD']}@"
    f"{os.environ['MYSQLHOST']}:{os.environ['MYSQLPORT']}/{os.environ['MYSQLDATABASE']}"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# importa models para o metadata “enxergar” todas as tabelas
import models  # noqa
