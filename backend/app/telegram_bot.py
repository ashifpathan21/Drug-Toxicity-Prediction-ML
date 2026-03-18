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
        # Extract toxicity data from targets
        predictions_dict = {}
        max_prob = float(result['max_prob'])
        final_verdict = result['final_toxic_verdict']
        
        # Map targets with their data
        for target, data in result['targets'].items():
            if target == 'toxic':  # Skip the generic toxic target
                continue
            prob = float(data['predict_prob'])  # Keep as decimal (0-1 range)
            threshold = float(data['threshold'])
            is_toxic = data['toxic']
            predictions_dict[target] = {
                'prob': prob,
                'threshold': threshold,
                'toxic': is_toxic
            }
        
        # Determine hazard level based on max_prob (matching frontend logic)
        max_prob_percent = max_prob * 100
        if max_prob_percent < 33:
            hazard_level = "🟢 LOW"
        elif max_prob_percent < 66:
            hazard_level = "🟡 MEDIUM"
        else:
            hazard_level = "🔴 HIGH"
        
        # Overall verdict
        verdict_text = "🔴 TOXICITY DETECTED" if final_verdict else "🟢 SAFE / NO TOXICITY"
        
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
        
        # Build response message matching frontend structure
        response_message = f"""✅ **TOXICITY ANALYSIS RESULTS**

🧬 **SMILES:** `{user_input}`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**OVERALL VERDICT**
{verdict_text}
Hazard Level: {hazard_level}
Max Probability: {(max_prob_percent):.1f}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📊 TARGET ENDPOINT BINDING (Tox21 ASSAYS)**

🔴 **NUCLEAR RECEPTORS:**
• NR-AR: {(predictions_dict.get('NR-AR', {}).get('prob', 0) * 100):.1f}% - {'🔴 TOXIC' if predictions_dict.get('NR-AR', {}).get('toxic', False) else '🟢 SAFE'}
• NR-AR-LBD: {(predictions_dict.get('NR-AR-LBD', {}).get('prob', 0) * 100):.1f}% - {'🔴 TOXIC' if predictions_dict.get('NR-AR-LBD', {}).get('toxic', False) else '🟢 SAFE'}
• NR-AhR: {(predictions_dict.get('NR-AhR', {}).get('prob', 0) * 100):.1f}% - {'🔴 TOXIC' if predictions_dict.get('NR-AhR', {}).get('toxic', False) else '🟢 SAFE'}
• NR-Aromatase: {(predictions_dict.get('NR-Aromatase', {}).get('prob', 0) * 100):.1f}% - {'🔴 TOXIC' if predictions_dict.get('NR-Aromatase', {}).get('toxic', False) else '🟢 SAFE'}
• NR-ER: {(predictions_dict.get('NR-ER', {}).get('prob', 0) * 100):.1f}% - {'🔴 TOXIC' if predictions_dict.get('NR-ER', {}).get('toxic', False) else '🟢 SAFE'}
• NR-ER-LBD: {(predictions_dict.get('NR-ER-LBD', {}).get('prob', 0) * 100):.1f}% - {'🔴 TOXIC' if predictions_dict.get('NR-ER-LBD', {}).get('toxic', False) else '🟢 SAFE'}
• NR-PPAR-gamma: {(predictions_dict.get('NR-PPAR-gamma', {}).get('prob', 0) * 100):.1f}% - {'🔴 TOXIC' if predictions_dict.get('NR-PPAR-gamma', {}).get('toxic', False) else '🟢 SAFE'}

🟡 **STRESS RESPONSE ELEMENTS:**
• SR-ARE: {(predictions_dict.get('SR-ARE', {}).get('prob', 0) * 100):.1f}% - {'🔴 TOXIC' if predictions_dict.get('SR-ARE', {}).get('toxic', False) else '🟢 SAFE'}
• SR-ATAD5: {(predictions_dict.get('SR-ATAD5', {}).get('prob', 0) * 100):.1f}% - {'🔴 TOXIC' if predictions_dict.get('SR-ATAD5', {}).get('toxic', False) else '🟢 SAFE'}
• SR-HSE: {(predictions_dict.get('SR-HSE', {}).get('prob', 0) * 100):.1f}% - {'🔴 TOXIC' if predictions_dict.get('SR-HSE', {}).get('toxic', False) else '🟢 SAFE'}
• SR-MMP: {(predictions_dict.get('SR-MMP', {}).get('prob', 0) * 100):.1f}% - {'🔴 TOXIC' if predictions_dict.get('SR-MMP', {}).get('toxic', False) else '🟢 SAFE'}
• SR-p53: {(predictions_dict.get('SR-p53', {}).get('prob', 0) * 100):.1f}% - {'🔴 TOXIC' if predictions_dict.get('SR-p53', {}).get('toxic', False) else '🟢 SAFE'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**💾 PHYSICOCHEMICAL PROPERTIES**
• Molecular Weight: {mol_features['MolWt']:.2f}
• LogP (Lipophilicity): {mol_features['MolLogP']:.2f}
• TPSA: {mol_features['TPSA']:.2f}
• H-Bond Donors: {mol_features['NumHDonors']:.0f}
• H-Bond Acceptors: {mol_features['NumHAcceptors']:.0f}
• Rotatable Bonds: {mol_features['NumRotatableBonds']:.0f}
• Ring Count: {mol_features['RingCount']:.0f}
• Aromatic Rings: {mol_features['NumAromaticRings']:.0f}
• Heavy Atom Count: {mol_features['HeavyAtomCount']:.0f}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ **DISCLAIMER:** For research & educational purposes only.
For clinical decisions, consult domain experts.
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
