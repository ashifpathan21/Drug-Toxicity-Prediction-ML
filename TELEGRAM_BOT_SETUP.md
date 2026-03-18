# 🤖 Telegram Bot Setup Guide

## Overview
This Telegram bot integrates with the Drug Toxicity Detector to allow users to analyze chemical compounds via Telegram.

**Bot Username:** `@drug_toxicity_detector_bot`

## Features
✅ Accept SMILES strings via Telegram  
✅ Return detailed toxicity predictions  
✅ Display 12 Tox21 target predictions  
✅ Show molecular features  
✅ Handle invalid SMILES with helpful error messages  
✅ Welcome and help commands

---

## Prerequisites
- Backend running (FastAPI server)
- Valid Telegram Bot Token
- Public HTTPS domain (for webhook)
- Python packages: `python-telegram-bot`, `fastapi`, `httpx`

---

## Installation & Setup

### 1. Install Required Packages
```bash
pip install -r requirements.txt
```

This includes:
- `python-telegram-bot==21.9`
- `httpx==0.27.0`

### 2. Set Up Environment Variables
Create or update `.env` file in the backend directory:

```env
TELEGRAM_TOKEN=8694938089:AAGS60w2c6JexRYuvAij4N4Kb3M5zS9ZY8A
TELEGRAM_WEBHOOK_URL=https://your-domain.com/telegram/webhook
```

### 3. Configure Webhook (Production)

#### Option A: Using Telegram Bot API (Recommended)
```bash
curl -X POST \
  https://api.telegram.org/bot8694938089:AAGS60w2c6JexRYuvAij4N4Kb3M5zS9ZY8A/setWebhook \
  -d url=https://your-domain.com/telegram/webhook \
  -d allowed_updates=message,callback_query
```

#### Option B: Remove Webhook (Local Development)
```bash
curl -X POST \
  https://api.telegram.org/bot8694938089:AAGS60w2c6JexRYuvAij4N4Kb3M5zS9ZY8A/deleteWebhook
```

### 4. Start the Backend Server
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## API Endpoints

### POST `/telegram/webhook`
Receives Telegram updates (messages, commands)

**Webhook Setup:**
```
URL: https://your-domain.com/telegram/webhook
Method: POST
Content-Type: application/json
```

### GET `/predict`
Get predictions from the REST API

**Query Parameters:**
- `smiles` (string): SMILES notation of the chemical compound

**Example:**
```
GET /predict?smiles=CC(=O)Oc1ccccc1C(=O)O
```

**Response:**
```json
{
  "data": {
    "smiles": "CC(=O)Oc1ccccc1C(=O)O",
    "predictions": {
      "NR-AR": 15.2,
      "NR-ER": 22.5,
      ...
    },
    "molecular_features": {
      "MolWt": 180.16,
      "MolLogP": 1.19,
      ...
    },
    "average_toxicity": 28.3,
    "risk_level": "🟡 MEDIUM",
    "final_toxic_verdict": false
  }
}
```

---

## Bot Commands

### `/start`
Displays welcome message with instructions on how to use the bot

**Example Response:**
```
🧪 Welcome to Drug Toxicity Detector Bot! 🧪

This bot analyzes chemical compounds using SMILES notation to predict potential toxicity.

📝 **How to use:**
Simply send me a SMILES string of any chemical compound and I'll analyze it for toxicity across 12 biological targets.

📊 **Example SMILES:**
- CC(=O)Oc1ccccc1C(=O)O (Aspirin)
- CN1C=NC2=C1C(=O)N(C(=O)N2C)C (Caffeine)
```

### `/help`
Shows detailed help information, SMILES format guide, and examples

---

## User Interaction Flow

1. **User Type:** Send a SMILES string (e.g., `CC(=O)Oc1ccccc1C(=O)O`)
2. **Bot Response:** 
   - Shows loading indicator
   - Analyzes the compound
   - Returns detailed toxicity predictions for 12 targets
   - Includes molecular features and risk assessment
3. **Error Handling:**
   - Invalid SMILES: Provides helpful error message
   - Empty input: Prompts for valid SMILES
   - Server error: Catches and reports appropriately

---

## Toxicity Predictions

The bot returns predictions for 12 Tox21 targets categorized as:

### Nuclear Receptors (NR)
- **NR-AR:** Androgen Receptor
- **NR-AR-LBD:** AR Ligand-Binding Domain
- **NR-AhR:** Aryl Hydrocarbon Receptor
- **NR-Aromatase:** Aromatase
- **NR-ER:** Estrogen Receptor
- **NR-ER-LBD:** ER Ligand-Binding Domain
- **NR-PPAR-gamma:** PPAR Gamma

### Stress Response Elements (SR)
- **SR-ARE:** Antioxidant Response Element
- **SR-ATAD5:** ATAD5
- **SR-HSE:** Heat Shock Factor Response Element
- **SR-MMP:** Mitochondrial Membrane Potential
- **SR-p53:** p53 Pathway

---

## Error Handling

### Invalid SMILES String
```
❌ **Invalid SMILES String**

The provided SMILES string could not be parsed. Please check:
• No typos in the string
• Valid chemical notation
• Proper bracket matching
```

### No SMILES Found
```
❌ **Invalid input format. Please send a valid SMILES string.**

Example: CC(=O)Oc1ccccc1C(=O)O
Type /help for more information.
```

### Server Error
```
⚠️ **Error Processing Request**
Error: [error details]
Please try with a different SMILES string or type /help
```

---

## Testing the Bot

### Local Testing (Polling Mode)
If you're not using polling and want to test locally, you can use:

```python
from app.telegram_bot import build_telegram_app
import asyncio

async def test_bot():
    app = build_telegram_app()
    await app.initialize()
    # Messages are handled via polling in development
    await app.start_polling()

asyncio.run(test_bot())
```

### Production Testing (Webhook Mode)
1. Send a message to the bot: `@drug_toxicity_detector_bot`
2. Verify the webhook receives the update
3. Check backend logs for processing status

---

## Deployment Checklist

- [ ] Install all required packages
- [ ] Set up environment variables (.env file)
- [ ] Configure HTTPS domain
- [ ] Set webhook URL with Telegram Bot API
- [ ] Test webhook connectivity
- [ ] Start backend server
- [ ] Send test SMILES to bot
- [ ] Verify predictions are returned correctly
- [ ] Test error handling with invalid SMILES
- [ ] Monitor logs for any issues

---

## Troubleshooting

### Webhook Not Receiving Messages
**Solution:** 
1. Verify HTTPS is properly configured
2. Check firewall/security group settings
3. Ensure backend server is running
4. Verify webhook URL in Telegram Bot API

```bash
curl https://api.telegram.org/bot{TOKEN}/getWebhookInfo
```

### "Invalid SMILES" Error
**Solution:**
1. Ensure SMILES string has no spaces at start/end
2. Verify bracket matching
3. Check for valid chemical notation
4. Use example SMILES from `/help` command

### Backend Not Starting
**Solution:**
1. Check Python version (3.8+)
2. Verify all packages are installed: `pip install -r requirements.txt`
3. Ensure port 8000 is not in use
4. Check error logs for missing dependencies

### High Latency Responses
**Solution:**
1. Verify model files are loaded
2. Check backend server resources
3. Monitor network latency
4. Consider response caching for popular compounds

---

## Performance Tips

1. **Cache Predictions:** Store predictions for frequently analyzed compounds
2. **Optimize Models:** Use quantized or pruned models for faster inference
3. **Load Balancing:** Use multiple backend instances with load balancing
4. **Async Processing:** Use message queues for batch processing

---

## Security Notes

⚠️ **Important:**
- Keep bot token secure (.env file, not in git)
- Validate all SMILES input before processing
- Implement rate limiting to prevent abuse
- Use HTTPS for webhook communication
- Monitor logs for suspicious activity

---

## References

- [Telegram Bot API Docs](https://core.telegram.org/bots/api)
- [python-telegram-bot Library](https://python-telegram-bot.readthedocs.io/)
- [SMILES Notation Guide](https://www.ncbi.nlm.nih.gov/structure/)
- [Tox21 Challenge](https://tox21.epa.gov/)

---

## Support

For issues or questions:
1. Check the error logs: `bash logs/app.log`
2. Review Telegram Bot API documentation
3. Test with example SMILES strings
4. Verify backend endpoints manually with curl

---

**Bot Status:** ✅ Active  
**Last Updated:** 2026-03-18  
**Version:** 1.0.5
