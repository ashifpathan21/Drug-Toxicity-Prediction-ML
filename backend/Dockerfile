# Use stable Python version compatible with RDKit
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for RDKit
RUN apt-get update && apt-get install -y \
    build-essential \
    libglib2.0-0 \
    libxrender1 \
    libsm6 \
    libxext6 \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for Docker caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy and make entrypoint script executable
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose FastAPI port
EXPOSE 8000

# Run both FastAPI and Telegram bot
ENTRYPOINT ["/app/entrypoint.sh"]