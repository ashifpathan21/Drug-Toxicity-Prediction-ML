from fastapi import FastAPI, Request, HTTPException
from app.predictor import predict
from fastapi.middleware.cors import CORSMiddleware
from telegram import Update
from telegram.ext import Application
import json
import logging
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Tox21 Toxicity Predictor")
origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://drug-toxicity-prediction.onrender.com" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Telegram configuration
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
if not TELEGRAM_TOKEN:
    logger.warning("TELEGRAM_TOKEN not set. Telegram bot will not be available.")

telegram_app = None


@app.on_event("startup")
async def startup():
    """Initialize Telegram bot on startup."""
    global telegram_app
    if not TELEGRAM_TOKEN:
        return
    
    from app.telegram_bot import build_telegram_app
    telegram_app = build_telegram_app()
    await telegram_app.initialize()
    logger.info("Telegram bot initialized (Webhook mode)")


@app.on_event("shutdown")
async def shutdown():
    """Shutdown Telegram bot."""
    if telegram_app:
        try:
            await telegram_app.shutdown()
            logger.info("Telegram bot shutdown")
        except Exception as e:
            logger.warning(f"Bot shutdown warning: {e}")


@app.get("/predict")
def predict_molecule(smiles: str):
    """
    Predict toxicity for a given SMILES string.
    
    Args:
        smiles: SMILES notation of the chemical compound
        
    Returns:
        Dictionary with prediction results or error message
    """
    # Validate SMILES input
    if not smiles or not smiles.strip():
        return {
            "error": "Invalid SMILES",
            "message": "SMILES string cannot be empty. Please provide a valid SMILES notation."
        }
    
    smiles = smiles.strip()
    
    result = predict(smiles)

    if result is None:
        return {
            "error": "Invalid SMILES",
            "message": f"The provided SMILES string '{smiles}' could not be parsed. Please verify: 1) No typos, 2) Valid chemical notation, 3) Proper bracket matching"
        }

    # Format prediction results in the format the frontend expects
    # Transform targets format
    targets_for_frontend = {}
    for target, data in result['targets'].items():
        targets_for_frontend[target] = {
            "predict_prob": data['predict_prob'],  # Keep as string format
            "threshold": data['threshold'],
            "toxic": data['toxic']
        }
    
    # Also include the 'toxic' target if it exists
    if 'toxic' in result['targets']:
        targets_for_frontend['toxic'] = {
            "predict_prob": result['targets']['toxic']['predict_prob'],
            "threshold": result['targets']['toxic']['threshold'],
            "toxic": result['targets']['toxic']['toxic']
        }

    return {
        "data": {
            "names": result['names'],
            "info": result['info'],
            "targets": targets_for_frontend,
            "max_prob": result['max_prob'],
            "final_toxic_verdict": result['final_toxic_verdict']
        }
    }


@app.post("/telegram/webhook")
async def telegram_webhook(request: Request):
    """
    Webhook endpoint for Telegram bot updates.
    Configure this with Telegram Bot API.
    """
    if not telegram_app:
        raise HTTPException(status_code=400, detail="Telegram bot not initialized")
    
    try:
        data = await request.json()
        update = Update.de_json(data, telegram_app.bot)
        await telegram_app.process_update(update)
        return {"ok": True}
    except Exception as e:
        logger.error(f"Error processing Telegram update: {str(e)}")
        return {"ok": False, "error": str(e)}


