import pandas as pd
import numpy as np
from pathlib import Path

# Models simples i lleugers
from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score
)
from sklearn.linear_model import LogisticRegression

CSV_PATH = Path("ml_daily.csv")
OUT_DIR = Path("ml_models")
OUT_DIR.mkdir(exist_ok=True)

df = pd.read_csv(CSV_PATH)

# Normalitza columnes esperades
# day pot venir com 'day' o similar; si no hi és, ho deixem tal qual.
if "day" in df.columns:
    df["day"] = pd.to_datetime(df["day"], utc=True, errors="coerce")

# Target
if "rain_day" not in df.columns:
    raise SystemExit("ERROR: No trobo la columna 'rain_day' al CSV.")

# Features que solen existir en el teu view
feature_cols = [
    "fcst_rain_day",
    "fcst_humidity_day",
    "mean_delta_pressure_3h",
    "min_delta_pressure_3h",
    "month",
    # (opc) si algun dia afegeixes:
    # "fcst_temp_day",
    # "fcst_wind_day",
]
# Filtra les que realment existeixen
feature_cols = [c for c in feature_cols if c in df.columns]

if not feature_cols:
    raise SystemExit("ERROR: No hi ha cap feature disponible al CSV.")

# Drop files sense target o sense features
use_cols = feature_cols + ["rain_day"]
df = df[use_cols].dropna(subset=["rain_day"])

# Separa X/y
X = df[feature_cols].copy()
y = df["rain_day"].astype(int).values

# Preprocess: numèriques + categòriques (month pot ser numèric igualment)
numeric_cols = [c for c in feature_cols if c != "source" and c != "model"]
categorical_cols = [c for c in feature_cols if c in ("source", "model")]

preprocess = ColumnTransformer(
    transformers=[
        ("num", "passthrough", numeric_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
    ],
    remainder="drop",
)

# Model simple
clf = LogisticRegression(max_iter=2000)

pipe = Pipeline(steps=[("prep", preprocess), ("clf", clf)])

# Validació temporal (molt important per sèries temporals)
n = len(df)
if n < 20:
    print(f"WARNING: Dataset molt petit (n={n}). Mètriques poc estables.")
splits = min(5, max(2, n // 10))
tscv = TimeSeriesSplit(n_splits=splits)

metrics = []
y_all = []
p_all = []

for fold, (train_idx, test_idx) in enumerate(tscv.split(X), start=1):
    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    pipe.fit(X_train, y_train)
    proba = pipe.predict_proba(X_test)[:, 1]
    pred = (proba >= 0.5).astype(int)

    acc = accuracy_score(y_test, pred)
    prec = precision_score(y_test, pred, zero_division=0)
    rec = recall_score(y_test, pred, zero_division=0)
    f1 = f1_score(y_test, pred, zero_division=0)

    # AUC només si hi ha positius i negatius al test
    auc = None
    if len(np.unique(y_test)) == 2:
        auc = roc_auc_score(y_test, proba)

    cm = confusion_matrix(y_test, pred).ravel()
    if len(cm) == 4:
        tn, fp, fn, tp = cm
    else:
        # cas estrany si només una classe
        tn = fp = fn = tp = 0

    metrics.append({
        "fold": fold,
        "n_test": len(test_idx),
        "acc": acc,
        "prec": prec,
        "rec": rec,
        "f1": f1,
        "auc": auc,
        "tn": tn, "fp": fp, "fn": fn, "tp": tp
    })

    y_all.extend(y_test.tolist())
    p_all.extend(proba.tolist())

# Resum
m = pd.DataFrame(metrics)
print("\nPer-fold:")
print(m[["fold","n_test","acc","prec","rec","f1","auc","tn","fp","fn","tp"]])

print("\nMitjana (ignorant NaN d'AUC):")
print(m[["acc","prec","rec","f1","auc"]].mean(numeric_only=True))

# Entrena final amb tot el dataset i desa'l
pipe.fit(X, y)

# Guardar amb joblib
import joblib
model_path = OUT_DIR / "rain_day_logreg.joblib"
joblib.dump(pipe, model_path)

print(f"\nModel guardat a: {model_path.resolve()}")

# Quick inference example (última fila)
last = X.tail(1)
proba_last = pipe.predict_proba(last)[:, 1][0]
print(f"Exemple: P(pluja>=1mm) per l'últim dia del CSV = {proba_last:.3f}")
