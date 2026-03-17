import joblib
from app.config import MODEL_PATHS
import os
models = {}

def load_models():
    for name, paths in MODEL_PATHS.items():
        models[name] = [joblib.load(p) for p in paths]

load_models()

scaler = joblib.load(os.path.join("saved_models", "scaler.pkl"))