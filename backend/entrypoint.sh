#!/bin/bash
# Entrypoint script to run both FastAPI and Telegram bot polling

echo "🚀 Starting Drug Toxicity Detector with Telegram Bot..."
echo ""

# Start FastAPI server in background
echo "📡 Starting FastAPI server on port 8000..."
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
FASTAPI_PID=$!

# Give FastAPI time to start
sleep 3

# Start Telegram bot polling
echo "🤖 Starting Telegram bot polling..."
python bot_polling.py &
BOT_PID=$!

echo "✅ Both services started!"
echo "   - FastAPI: http://0.0.0.0:8000"
echo "   - Bot: @drug_toxicity_detector_bot"
echo ""

# Keep the container running and handle signals
trap "kill $FASTAPI_PID $BOT_PID; exit" SIGTERM SIGINT

# Wait for both processes
wait
