import os, sqlalchemy as sa
engine = sa.create_engine(os.environ["DATABASE_URL"], pool_pre_ping=True)
def session(): return engine.connect()
