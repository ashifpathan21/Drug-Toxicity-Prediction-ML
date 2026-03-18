"""
Telegram Bot Polling Runner - For Local Development

Run this script in a separate terminal while the FastAPI app is running.

Usage:
    python bot_polling.py

This script runs the Telegram bot in polling mode, which is ideal for
local development without needing a public HTTPS URL.

For production, use webhook mode instead (see main.py).
"""

import logging
import os
from dotenv import load_dotenv
from app.telegram_bot import build_telegram_app

# Setup logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")


def main():
    """Run the bot in polling mode."""
    if not TELEGRAM_TOKEN:
        logger.error("❌ TELEGRAM_TOKEN not set in .env file!")
        logger.error("Please add TELEGRAM_TOKEN=your_token_here to .env")
        return
    
    logger.info("🤖 Starting Telegram Bot in Polling Mode...")
    logger.info("📱 Bot Username: @drug_toxicity_detector_bot")
    logger.info("⌨️  Press Ctrl+C to stop\n")
    
    try:
        # Build and run the application
        app = build_telegram_app()
        
        # Use the application's built-in run_polling method
        logger.info("✅ Bot initialized and listening for messages...\n")
        app.run_polling()
        
    except KeyboardInterrupt:
        logger.info("\n⏹️  Bot stopped by user")
    except Exception as e:
        logger.error(f"❌ Error: {e}", exc_info=True)


if __name__ == "__main__":
    main()
