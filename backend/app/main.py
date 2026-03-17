from fastapi import FastAPI
from app.predictor import predict
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Tox21 Toxicity Predictor")
origins = [
    "http://localhost:5173",  # Vite dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/predict")

def predict_molecule(smiles:str):

    result = predict(smiles)

    if result is None:
        return {"error":"Invalid SMILES"}

    return {"data":result}


