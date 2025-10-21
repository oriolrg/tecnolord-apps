import os
import psycopg2
from psycopg2 import pool

DB_URL = os.getenv("DATABASE_URL")
SEARCH_PATH = os.getenv("DB_SEARCH_PATH", "meteo,auth,public")

_pool = None

def init_pool():
    global _pool
    if _pool is None:
        _pool = psycopg2.pool.SimpleConnectionPool(
            minconn=1, maxconn=5, dsn=DB_URL
        )

def get_conn():
    if _pool is None:
        init_pool()
    conn = _pool.getconn()
    # assegura search_path a cada connexió
    with conn.cursor() as cur:
        cur.execute("SET search_path TO " + SEARCH_PATH)
    return conn

def put_conn(conn):
    if _pool:
        _pool.putconn(conn)
