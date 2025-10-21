# pyapi/app/db.py
import os
import sqlalchemy as sa

url = os.environ["DATABASE_URL"]
if url.startswith("postgresql://"):
    # Força driver modern psycopg v3 si t'arriba sense sufix
    url = url.replace("postgresql://", "postgresql+psycopg://", 1)

engine = sa.create_engine(url, pool_pre_ping=True)

def session():
    return engine.connect()
