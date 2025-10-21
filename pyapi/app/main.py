from fastapi import FastAPI, HTTPException
from .db import get_conn, put_conn
import os

app = FastAPI()

@app.get("/health")
def health():
    # comprova DB
    conn = None
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
            cur.fetchone()
        return {"ok": True, "env": "pyapi", "tz": os.getenv("APP_TZ", "UTC")}
    except Exception as e:
        return {"ok": True, "db": "down", "error": str(e)}
    finally:
        if conn:
            put_conn(conn)

@app.get("/api/v1/py/mesures/darreres")
def darreres_mesures(limit: int = 50, estacio: str | None = None):
    limit = max(1, min(limit, 500))
    sql = """
      SELECT m.id, m.instant, m.temp_c, m.humitat_pct, m.pluja_diaria_mm,
             m.uvi, m.solar_wm2, m.vent_ms, m.vent_rafega_ms, m.vent_direccio_graus,
             e.codi AS estacio
      FROM meteo.mesures m
      JOIN meteo.estacions e ON e.id = m.estacio_id
      {where}
      ORDER BY m.instant DESC
      LIMIT %s
    """
    params = []
    where = ""
    if estacio:
        where = "WHERE e.codi = %s"
        params.append(estacio)
    params.append(limit)

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql.format(where=where), params)
            rows = cur.fetchall()
        cols = ["id","instant","temp_c","humitat_pct","pluja_diaria_mm",
                "uvi","solar_wm2","vent_ms","vent_rafega_ms","vent_direccio_graus","estacio"]
        return {"ok": True, "items": [dict(zip(cols, r)) for r in rows]}
    finally:
        put_conn(conn)

@app.get("/api/v1/py/hidro/darreres")
def darreres_hidro(limit: int = 50, codi: str | None = None):
    limit = max(1, min(limit, 500))
    sql = """
      SELECT h.id, h.instant, h.cabal_m3s, h.capacitat_pct, h.nivell_m,
             e.codi, e.nom, e.tipus
      FROM meteo.lectures_hidro h
      JOIN meteo.estacions_hidro e ON e.id = h.estacio_id
      {where}
      ORDER BY h.instant DESC
      LIMIT %s
    """
    params = []
    where = ""
    if codi:
        where = "WHERE e.codi = %s"
        params.append(codi)
    params.append(limit)

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql.format(where=where), params)
            rows = cur.fetchall()
        cols = ["id","instant","cabal_m3s","capacitat_pct","nivell_m","codi","nom","tipus"]
        return {"ok": True, "items": [dict(zip(cols, r)) for r in rows]}
    finally:
        put_conn(conn)
