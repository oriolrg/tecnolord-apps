from fastapi import FastAPI
from .db import session

app = FastAPI(title="Tecnolord PyAPI")

@app.get("/health")
def health(): return {"ok": True}

@app.get("/api/v1/kpis")
def kpis():
    # TODO: llegir KPIs de vistes/materialitzacions a Postgres (schema ml/meteo)
    return {"rain_ytd": 0}

@app.get("/api/v1/forecast")
def forecast(lat: float, lon: float):
    # TODO: llegir ml.predictions o cridar model
    return {"lat": lat, "lon": lon, "horizon": [1,3,6], "y_hat": [0.1, 0.0, 0.2]}
