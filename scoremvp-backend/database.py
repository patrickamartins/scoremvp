import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1) exponha o Base para os seus models
Base = declarative_base()

# lê direto as vars do Railway
host     = os.getenv("MYSQLHOST")
port     = int(os.getenv("MYSQLPORT", 3306))
user     = os.getenv("MYSQLUSER")
password = os.getenv("MYSQLPASSWORD")
# tenta as duas chaves, evita o None
name     = os.getenv("MYSQLDATABASE") or os.getenv("MYSQL_DATABASE")

# Debug: veja nos logs se o nome do banco parou de ser None
print("CONNECTING TO:", f"{user}@{host}:{port}/{name}")

# monta a URL para o PyMySQL
DATABASE_URL = f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
