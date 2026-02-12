#!/usr/bin/env python3
import json
import pandas as pd
import joblib
from pathlib import Path

MODEL = Path("ml_models/rain_day_station_logreg.joblib")
META  = Path("ml_models/rain_day_station_logreg.joblib.meta.json")

pipe = joblib.load(MODEL)
meta = json.loads(META.read_text(encoding="utf-8"))
thr = float(meta.get("threshold", 0.5))

df = pd.read_csv("ml_station_daily_shifted_home.csv")
df = df.dropna(subset=["rain_day_next"])  # o no, si vols predir avui sense label
feature_cols = meta["feature_cols"]

X = df[feature_cols].apply(pd.to_numeric, errors="coerce")
last = X.tail(1)
p = float(pipe.predict_proba(last)[:,1][0])

print(json.dumps({"prob": p, "threshold": thr, "will_rain": int(p>=thr)}, indent=2))
