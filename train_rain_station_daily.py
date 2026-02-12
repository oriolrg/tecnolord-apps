#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
train_rain_station_daily.py
---------------------------------
Entrena un model "plourà demà (>=1mm) sí/no" només amb features d'estació (diàries),
a partir d'un CSV exportat de la vista ml_station_daily_shifted.

- Input esperat (CSV): columnes com:
  station_code, feature_day, ...features..., rain_day_next
- Gestiona NaN amb imputació (median)
- Fa validació creuada temporal (TimeSeriesSplit)
- Reporta: acc, prec, rec, f1, auc + matriu confusió per fold
- Guarda el model final entrenat amb totes les dades a:
  ml_models/rain_day_station_logreg.joblib
- També guarda metadata a:
  ml_models/rain_day_station_logreg.meta.json

Exemple:
  python train_rain_station_daily.py --csv ml_station_daily_shifted_home.csv
  python train_rain_station_daily.py --csv /path/file.csv --model-out /tmp/model.joblib
"""

from __future__ import annotations

import argparse
import json
import os
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from joblib import dump
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import TimeSeriesSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


@dataclass
class FoldMetrics:
    fold: int
    n_test: int
    acc: float
    prec: float
    rec: float
    f1: float
    auc: Optional[float]
    tn: int
    fp: int
    fn: int
    tp: int


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Train rain/no-rain (>=1mm tomorrow) from station-only daily features.")
    p.add_argument("--csv", required=True, help="Path al CSV (ml_station_daily_shifted_*.csv)")
    p.add_argument("--station", default=None, help="Filtra station_code (opcional). Si no, usa tot el CSV.")
    p.add_argument("--target", default="rain_day_next", help="Nom de la columna target (default: rain_day_next)")
    p.add_argument("--date-col", default="feature_day", help="Nom de la columna de data (default: feature_day)")
    p.add_argument("--n-splits", type=int, default=3, help="Nombre de folds temporal CV (default: 3)")
    p.add_argument("--model-out", default="ml_models/rain_day_station_logreg.joblib", help="On guardar el model final")
    p.add_argument("--balanced", action="store_true", help="Usa class_weight='balanced' per desbalanceig")
    p.add_argument("--seed", type=int, default=42, help="Seed (per reproducibilitat)")
    return p.parse_args()


def safe_auc(y_true: np.ndarray, y_prob: np.ndarray) -> Optional[float]:
    """AUC només si hi ha ambdues classes al y_true."""
    uniq = np.unique(y_true)
    if len(uniq) < 2:
        return None
    return float(roc_auc_score(y_true, y_prob))


def build_pipeline(balanced: bool) -> Pipeline:
    lr_kwargs = dict(max_iter=2000, solver="lbfgs")
    if balanced:
        lr_kwargs["class_weight"] = "balanced"

    pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("model", LogisticRegression(**lr_kwargs)),
        ]
    )
    return pipe


def load_and_prepare(
    csv_path: str,
    station_filter: Optional[str],
    date_col: str,
    target_col: str,
) -> Tuple[pd.DataFrame, pd.Series, List[str], pd.DataFrame]:
    df = pd.read_csv(csv_path)

    # Filtra estació si cal
    if station_filter is not None and "station_code" in df.columns:
        df = df[df["station_code"] == station_filter].copy()

    # Parse data
    if date_col in df.columns:
        df[date_col] = pd.to_datetime(df[date_col], utc=True, errors="coerce")

    # Elimina files sense target
    if target_col not in df.columns:
        raise ValueError(f"No existeix la columna target '{target_col}' al CSV.")
    df = df[df[target_col].notna()].copy()

    # Ordena temporalment
    if date_col in df.columns:
        df = df.sort_values(date_col).reset_index(drop=True)

    # Selecció features numèriques (excloem id/text/data/target)
    drop_cols = {target_col}
    if "station_code" in df.columns:
        drop_cols.add("station_code")
    if date_col in df.columns:
        drop_cols.add(date_col)

    feature_cols = [c for c in df.columns if c not in drop_cols]

    # Mantén només numèriques (per seguretat)
    X = df[feature_cols].copy()
    for c in X.columns:
        # força a numeric quan es pugui
        X[c] = pd.to_numeric(X[c], errors="coerce")

    y = df[target_col].astype(int)

    return X, y, feature_cols, df


def evaluate_cv(
    X: pd.DataFrame,
    y: pd.Series,
    pipe: Pipeline,
    n_splits: int,
) -> pd.DataFrame:
    tscv = TimeSeriesSplit(n_splits=n_splits)

    rows: List[FoldMetrics] = []
    for fold_idx, (tr_idx, te_idx) in enumerate(tscv.split(X), start=1):
        X_tr, X_te = X.iloc[tr_idx], X.iloc[te_idx]
        y_tr, y_te = y.iloc[tr_idx].to_numpy(), y.iloc[te_idx].to_numpy()

        pipe.fit(X_tr, y_tr)

        y_hat = pipe.predict(X_te)
        # Probabilitat positiva (classe 1)
        y_prob = pipe.predict_proba(X_te)[:, 1]

        acc = float(accuracy_score(y_te, y_hat))
        prec = float(precision_score(y_te, y_hat, zero_division=0))
        rec = float(recall_score(y_te, y_hat, zero_division=0))
        f1 = float(f1_score(y_te, y_hat, zero_division=0))
        auc = safe_auc(y_te, y_prob)

        tn, fp, fn, tp = confusion_matrix(y_te, y_hat, labels=[0, 1]).ravel()

        rows.append(
            FoldMetrics(
                fold=fold_idx,
                n_test=int(len(te_idx)),
                acc=acc,
                prec=prec,
                rec=rec,
                f1=f1,
                auc=auc,
                tn=int(tn),
                fp=int(fp),
                fn=int(fn),
                tp=int(tp),
            )
        )

    dfm = pd.DataFrame([asdict(r) for r in rows])
    return dfm


def main() -> None:
    args = parse_args()
    np.random.seed(args.seed)

    X, y, feature_cols, df_raw = load_and_prepare(
        csv_path=args.csv,
        station_filter=args.station,
        date_col=args.date_col,
        target_col=args.target,
    )

    if len(X) < 50:
        raise SystemExit(f"Massa poques files per entrenar (n={len(X)}). Necessites més dies.")

    rain_ratio = float(y.mean())
    print(f"Files: {len(X)} | Features: {len(feature_cols)} | Rain ratio (y=1): {rain_ratio:.3f}")

    pipe = build_pipeline(balanced=args.balanced)

    # CV temporal
    metrics_df = evaluate_cv(X, y, pipe, n_splits=args.n_splits)
    print("\nPer-fold:")
    print(metrics_df)

    # Mitjanes (AUC ignorant NaN)
    means = metrics_df[["acc", "prec", "rec", "f1", "auc"]].mean(numeric_only=True)
    print("\nMitjana (ignorant NaN d'AUC):")
    print(means)

    # Entrena model final amb tot el dataset
    pipe_final = build_pipeline(balanced=args.balanced)
    pipe_final.fit(X, y)

    model_out = Path(args.model_out)
    model_out.parent.mkdir(parents=True, exist_ok=True)
    dump(pipe_final, model_out)

    # Exemple de probabilitat sobre l'últim dia disponible (si hi ha files)
    last_row = X.iloc[[-1]]
    p_last = float(pipe_final.predict_proba(last_row)[:, 1][0])
    print(f"\nModel guardat a: {model_out}")
    print(f"Exemple: P(pluja>=1mm demà) per l'últim dia del CSV = {p_last:.3f}")

    # Guarda meta
    meta = {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "csv": str(Path(args.csv).resolve()),
        "station_filter": args.station,
        "target": args.target,
        "date_col": args.date_col,
        "n_rows": int(len(X)),
        "n_features": int(len(feature_cols)),
        "feature_cols": feature_cols,
        "rain_ratio": rain_ratio,
        "balanced": bool(args.balanced),
        "cv_n_splits": int(args.n_splits),
        "cv_metrics": metrics_df.to_dict(orient="records"),
        "cv_means": {k: (None if pd.isna(v) else float(v)) for k, v in means.items()},
        "example_last_prob": p_last,
    }
    meta_out = model_out.with_suffix(model_out.suffix + ".meta.json")
    meta_out.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Metadata guardada a: {meta_out}")


if __name__ == "__main__":
    main()
