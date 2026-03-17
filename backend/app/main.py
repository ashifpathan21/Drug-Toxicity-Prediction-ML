from fastapi import FastAPI
from app.predictor import predict


app = FastAPI(title="Tox21 Toxicity Predictor")

@app.get("/predict")

def predict_molecule(smiles:str):

    result = predict(smiles)

    if result is None:
        return {"error":"Invalid SMILES"}

    return {"data":result}


