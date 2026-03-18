# 🚀 Local Development Setup - Telegram Bot

This guide explains how to set up and run the Telegram bot locally for development and testing.

## Prerequisites
- Python 3.8+
- Backend dependencies installed: `pip install -r requirements.txt`
- Telegram bot token in `.env` file

## Quick Start (2 Steps)

### Step 1: Start the Backend Server
Open **Terminal 1** and run:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
2026-03-18 20:10:06 - app.main - INFO - Telegram bot initialized (Webhook mode)
```

### Step 2: Start the Bot Polling (IMPORTANT: Use a NEW Terminal Window!)
Open **a completely NEW PowerShell/Terminal window** (not a new tab in the same window) and run:
```bash
cd backend
python bot_polling.py
```

**Expected Output:**
```
🤖 Starting Telegram Bot in Polling Mode...
📱 Bot Username: @drug_toxicity_detector_bot
⌨️  Press Ctrl+C to stop

✅ Bot initialized and listening for messages...
```

---

## ⚠️ Important: Why a NEW Terminal Window?

The issue is **event loop conflicts** when running multiple asyncio applications in the same Python session:
- ❌ **DON'T:** Open polling in the same terminal/tab as the backend
- ✅ **DO:** Open polling in a **completely separate terminal window**

### How to Open a New Terminal Window

**Windows PowerShell:**
- Right-click desktop → New Terminal
- Or: `Win+Shift+N` (if using Windows Terminal)
- Or: Open Start Menu → Search "PowerShell" → Open new window

**Important:** It must be a **new window**, not a new tab!

---

## Testing the Bot

Once both are running:

1. Open Telegram
2. Search for: `@drug_toxicity_detector_bot`
3. Click "Start" or send `/start`
4. You should see the welcome message
5. Send a SMILES string: `CC(=O)Oc1ccccc1C(=O)O`
6. Wait 2-3 seconds for analysis
7. You should get toxicity predictions!

---

## Troubleshooting

### Bot not responding?

**Issue:** Bot says "This event loop is already running"
- ✅ **Solution:** Make sure polling is in a **completely new terminal window**, not a tab

**Issue:** "TELEGRAM_TOKEN not set"
- ✅ **Solution:** Check `.env` file has `TELEGRAM_TOKEN=8694938089:...`
- ✅ **Solution:** Make sure you're in `backend/` directory when running

**Issue:** "Connection refused" on port 8000
- ✅ **Solution:** Make sure backend is running in Terminal 1
- ✅ **Solution:** Check no other app is using port 8000

**Issue:** Bot responds to commands but says "Error processing request"
- ✅ **Solution:** Check backend logs in Terminal 1
- ✅ **Solution:** Verify SMILES format is valid

### Checking if Things are Running

**Check Backend (should show "Application startup complete"):**
```bash
# Look for this in Terminal 1:
INFO:     Application startup complete
```

**Check Bot Polling (should show "listening for messages"):**
```bash
# Look for this in Terminal 2:
✅ Bot initialized and listening for messages...
```

---

## Development Tips

### Hot Reload
The backend uses `--reload` flag, so changes to Python files automatically restart the server. No need to restart!

### Check Bot Token
Verify your token is valid:
```bash
curl https://api.telegram.org/bot{TOKEN}/getMe
```

Replace `{TOKEN}` with your actual token.

### Monitor Logs
Both terminals show detailed logs. Check them for errors:
- `Terminal 1 (Backend)`: Shows API requests and initialization logs
- `Terminal 2 (Bot)`: Shows commands received and predictions made

### Test Without Telegram
To test the bot handlers without running polling:
```bash
python test_bot.py
```

---

## Switching to Production (Webhook Mode)

When deploying to production:

1. Remove the polling script
2. Set up an HTTPS domain (required by Telegram)
3. Configure webhook:
```bash
curl -X POST \
  https://api.telegram.org/bot{TOKEN}/setWebhook \
  -d url=https://your-domain.com/telegram/webhook
```

4. The `/telegram/webhook` endpoint in `main.py` will handle incoming messages

---

## File Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app + webhook endpoint
│   ├── telegram_bot.py      # Bot handlers and logic
│   ├── predictor.py         # SMILES prediction logic
│   └── model_loader.py      # ML models loading
├── bot_polling.py           # Run this for local polling
├── test_bot.py              # Test bot handlers
├── .env                      # Your token (git ignored)
└── requirements.txt          # Python dependencies
```

---

## Common Commands

```bash
# Terminal 1: Start Backend
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 (NEW WINDOW): Start Bot Polling  
cd backend
python bot_polling.py

# Terminal 3: Test Backend API
curl "http://localhost:8000/predict?smiles=CCO"

# Terminal 3: Test Bot Handlers
python test_bot.py
```

---

## Error Quick Reference

| Error | Cause | Fix |
|-------|-------|-----|
| "event loop is already running" | Polling in same terminal | Open NEW terminal window |
| "TELEGRAM_TOKEN not set" | No .env file | Create `.env` with token |
| "Connection refused" | Backend not running | Start backend in Terminal 1 |
| "RuntimeError: This Application is not running" | Shutdown error | Restart both terminals |

---

## Next Steps

1. ✅ Run backend and polling (2 terminals)
2. ✅ Test bot with `/start` command
3. ✅ Send a SMILES string to test
4. ✅ Check logs for any issues
5. ✅ Read [TELEGRAM_BOT_SETUP.md](./TELEGRAM_BOT_SETUP.md) for production deployment

---

**Happy debugging! 🐛✨**
