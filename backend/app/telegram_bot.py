import logging
import os
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from app.predictor import predict
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
if not TELEGRAM_TOKEN:
    raise ValueError("TELEGRAM_TOKEN environment variable is not set. Please set it in your .env file.")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    welcome_message = """🧪 Welcome to Drug Toxicity Detector Bot! 🧪

This bot analyzes chemical compounds using SMILES notation to predict potential toxicity.

📝 **How to use:**
Simply send me a SMILES string of any chemical compound and I'll analyze it for toxicity across 12 biological targets.

📊 **Example SMILES:**
- CC(=O)Oc1ccccc1C(=O)O (Aspirin)
- CN1C=NC2=C1C(=O)N(C(=O)N2C)C (Caffeine)

❓ **Commands:**
/start - Show this welcome message
/help - Get help about the bot

🔬 **What I analyze:**
I check toxicity against 12 Tox21 targets:
• Nuclear Receptors (AR, AhR, Aromatase, ER, PPAR-gamma)
• Stress Response (ARE, HSE, MMP, p53, ATAD5)
• Additional biomarkers

Just send a valid SMILES string and I'll provide a detailed toxicity report! 📈
"""
    await update.message.reply_text(welcome_message)


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /help is issued."""
    help_message = """📚 **Help & Information**

🎯 **What is SMILES?**
SMILES (Simplified Molecular Input Line Entry System) is a notation for describing structural formulas of chemical species using short ASCII strings.

🔍 **How to get SMILES:**
1. Visit: https://www.ncbi.nlm.nih.gov/structure/
2. Search for your compound name
3. Copy the SMILES string

💡 **Example Usage:**
```
Send: CC(=O)Oc1ccccc1C(=O)O
Get: Toxicity predictions for Aspirin
```

⚠️ **Supported Formats:**
- Valid SMILES strings only
- Aromatic and aliphatic molecules
- Inorganic and organic compounds

❓ **Toxicity Scores:**
- Each prediction gives a probability (0-100%)
- Higher scores = Greater toxicity risk
- Multiple targets analyzed simultaneously

🚨 **Note:** This is for research and educational purposes. Always consult domain experts for critical decisions!
"""
    await update.message.reply_text(help_message)


async def handle_smiles(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle SMILES input and return prediction."""
    user_input = update.message.text.strip()
    
    # Check if it looks like a SMILES string
    if not any(c in user_input for c in ['C', 'N', 'O', 'S', 'P', '(', ')', '[', ']', '=', '#', '@']):
        await update.message.reply_text(
            "❌ Invalid input format. Please send a valid SMILES string.\n\n"
            "Example: CC(=O)Oc1ccccc1C(=O)O\n\n"
            "Type /help for more information."
        )
        return
    
    # Show loading message
    loading_msg = await update.message.reply_text("🔬 Analyzing compound... Please wait ⏳")
    
    try:
        # Get prediction
        result = predict(user_input)
        
        if result is None:
            await loading_msg.edit_text(
                "❌ **Invalid SMILES String**\n\n"
                "The provided SMILES string could not be parsed. Please check:\n"
                "• No typos in the string\n"
                "• Valid chemical notation\n"
                "• Proper bracket matching\n\n"
                "Type /help for examples or visit: https://www.ncbi.nlm.nih.gov/structure/"
            )
            return
        
        # Format prediction results
        # Extract toxicity probabilities from targets
        predictions_dict = {}
        max_prob = 0.0
        for target, data in result['targets'].items():
            prob = float(data['predict_prob']) * 100  # Convert from decimal (0.15) to percentage (15)
            predictions_dict[target] = prob
            max_prob = max(max_prob, prob)
        
        # Calculate average toxicity
        avg_toxicity = sum(predictions_dict.values()) / len(predictions_dict) if predictions_dict else 0
        
        # Determine risk level
        if avg_toxicity >= 70:
            risk_level = "🔴 CRITICAL"
        elif avg_toxicity >= 50:
            risk_level = "🟠 HIGH"
        elif avg_toxicity >= 30:
            risk_level = "🟡 MEDIUM"
        else:
            risk_level = "🟢 LOW"
        
        # Extract molecular features
        mol_features = {
            "MolWt": result['info'][0],
            "MolLogP": result['info'][1],
            "TPSA": result['info'][2],
            "NumHAcceptors": result['info'][3],
            "NumHDonors": result['info'][4],
            "NumRotatableBonds": result['info'][5],
            "RingCount": result['info'][6],
            "NumAromaticRings": result['info'][7],
            "HeavyAtomCount": result['info'][8],
        }
        
        response_message = f"""✅ **Toxicity Analysis Results**

🧬 **SMILES:** `{user_input}`

📊 **Predictions (Probability %):**

**🔴 Nuclear Receptors:**
• AR: {predictions_dict.get('NR-AR', 0):.1f}%
• AR-LBD: {predictions_dict.get('NR-AR-LBD', 0):.1f}%
• AhR: {predictions_dict.get('NR-AhR', 0):.1f}%
• Aromatase: {predictions_dict.get('NR-Aromatase', 0):.1f}%
• ER: {predictions_dict.get('NR-ER', 0):.1f}%
• ER-LBD: {predictions_dict.get('NR-ER-LBD', 0):.1f}%
• PPAR-gamma: {predictions_dict.get('NR-PPAR-gamma', 0):.1f}%

**🟡 Stress Response Elements:**
• ARE: {predictions_dict.get('SR-ARE', 0):.1f}%
• ATAD5: {predictions_dict.get('SR-ATAD5', 0):.1f}%
• HSE: {predictions_dict.get('SR-HSE', 0):.1f}%
• MMP: {predictions_dict.get('SR-MMP', 0):.1f}%
• p53: {predictions_dict.get('SR-p53', 0):.1f}%

📈 **Overall Risk:** {risk_level}
⚖️ **Average Toxicity:** {avg_toxicity:.1f}%
🎯 **Max Probability:** {max_prob:.1f}%

💾 **Molecular Features:**
• Molecular Weight: {mol_features['MolWt']:.2f}
• LogP (lipophilicity): {mol_features['MolLogP']:.2f}
• TPSA: {mol_features['TPSA']:.2f}
• H-Bond Donors: {mol_features['NumHDonors']:.0f}
• H-Bond Acceptors: {mol_features['NumHAcceptors']:.0f}
• Rotatable Bonds: {mol_features['NumRotatableBonds']:.0f}
• Ring Count: {mol_features['RingCount']:.0f}
• Aromatic Rings: {mol_features['NumAromaticRings']:.0f}
• Heavy Atom Count: {mol_features['HeavyAtomCount']:.0f}


⚠️ **Disclaimer:** This is for research purposes. Not for clinical decision-making.
📱 **Use Web App for More Details:** https://drug-toxicity-prediction.onrender.com
"""
        await loading_msg.edit_text(response_message)
        
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        await loading_msg.edit_text(
            f"⚠️ **Error Processing Request**\n\n"
            f"Error: {str(e)}\n\n"
            f"Please try with a different SMILES string or type /help"
        )


def build_telegram_app():
    """Build and return the Telegram bot application."""
    application = Application.builder().token(TELEGRAM_TOKEN).build()
    
    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_smiles))
    
    return application
