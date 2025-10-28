# Deployment Guide for x402 Python

This guide covers deploying x402-powered applications to production.

## Pre-Deployment Checklist

### Security

- [ ] Private keys stored securely (environment variables or key management service)
- [ ] HTTPS enabled for all endpoints
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] Error messages don't leak sensitive information
- [ ] Logging configured (but not logging private keys!)

### Configuration

- [ ] Using mainnet-beta RPC URL
- [ ] Appropriate nonce expiry time set
- [ ] Transaction confirmation level configured
- [ ] Timeout values tuned for production
- [ ] Retry logic implemented

### Monitoring

- [ ] Transaction logging enabled
- [ ] Error tracking configured
- [ ] Performance monitoring in place
- [ ] Alerts set up for failures
- [ ] Balance monitoring for server wallet

### Testing

- [ ] All tests passing
- [ ] Load testing completed
- [ ] Payment flows tested on mainnet
- [ ] Error handling verified
- [ ] Rollback plan in place

## Environment Setup

### 1. Production Environment Variables

Create a `.env` file (never commit this!):

```bash
# Production Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta

# Secure Private Key (use key management service in production)
SOLANA_PRIVATE_KEY=your_production_private_key

# x402 Configuration
X402_DEFAULT_TOKEN=SOL
X402_NONCE_EXPIRY=300
X402_AUTO_VERIFY=true
X402_ENABLE_LOGGING=true

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8000

# Security
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT=100
```

### 2. Key Management

**Option A: Environment Variables**
```python
import os
from solders.keypair import Keypair
import base58

private_key = os.getenv('SOLANA_PRIVATE_KEY')
keypair = Keypair.from_bytes(base58.b58decode(private_key))
```

**Option B: AWS Secrets Manager**
```python
import boto3
import json

def get_keypair_from_aws():
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId='solana-keypair')
    secret = json.loads(response['SecretString'])
    return Keypair.from_bytes(base58.b58decode(secret['private_key']))
```

**Option C: HashiCorp Vault**
```python
import hvac

def get_keypair_from_vault():
    client = hvac.Client(url='https://vault.example.com')
    client.token = os.getenv('VAULT_TOKEN')
    secret = client.secrets.kv.v2.read_secret_version(path='solana-keypair')
    return Keypair.from_bytes(base58.b58decode(secret['data']['data']['private_key']))
```

## Deployment Options

### Option 1: Docker Deployment

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Install x402
RUN pip install -e .

# Expose port
EXPOSE 8000

# Run application
CMD ["python", "examples/fastapi_server.py"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  x402-server:
    build: .
    ports:
      - "8000:8000"
    environment:
      - SOLANA_RPC_URL=${SOLANA_RPC_URL}
      - SOLANA_NETWORK=${SOLANA_NETWORK}
      - SOLANA_PRIVATE_KEY=${SOLANA_PRIVATE_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Deploy:**
```bash
docker-compose up -d
```

### Option 2: AWS Elastic Beanstalk

**requirements.txt:**
```
x402-solana
gunicorn
```

**application.py:**
```python
from examples.fastapi_server import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Deploy:**
```bash
eb init -p python-3.11 x402-app
eb create x402-production
eb deploy
```

### Option 3: Google Cloud Run

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
RUN pip install -e .

CMD exec gunicorn --bind :$PORT --workers 1 --worker-class uvicorn.workers.UvicornWorker examples.fastapi_server:app
```

**Deploy:**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/x402-server
gcloud run deploy x402-server \
  --image gcr.io/PROJECT_ID/x402-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Option 4: Heroku

**Procfile:**
```
web: uvicorn examples.fastapi_server:app --host 0.0.0.0 --port $PORT
```

**Deploy:**
```bash
heroku create x402-app
heroku config:set SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
heroku config:set SOLANA_PRIVATE_KEY=your_key
git push heroku main
```

### Option 5: Traditional VPS (Ubuntu)

**Setup Script:**
```bash
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3.11 python3-pip -y

# Install nginx
sudo apt install nginx -y

# Clone repository
git clone https://github.com/HaidarIDK/x402.git
cd x402/python

# Install dependencies
pip3 install -r requirements.txt
pip3 install -e .

# Create systemd service
sudo tee /etc/systemd/system/x402.service > /dev/null <<EOF
[Unit]
Description=x402 Payment Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment="SOLANA_RPC_URL=https://api.mainnet-beta.solana.com"
Environment="SOLANA_PRIVATE_KEY=your_key"
ExecStart=/usr/bin/python3 examples/fastapi_server.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl daemon-reload
sudo systemctl enable x402
sudo systemctl start x402

# Configure nginx
sudo tee /etc/nginx/sites-available/x402 > /dev/null <<EOF
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/x402 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

## Production Configuration

### Flask Production Server

Use Gunicorn:

```bash
pip install gunicorn

gunicorn -w 4 -b 0.0.0.0:8000 examples.flask_server:app
```

### FastAPI Production Server

Use Uvicorn with Gunicorn:

```bash
pip install gunicorn uvicorn

gunicorn -w 4 -k uvicorn.workers.UvicornWorker examples.fastapi_server:app
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring & Logging

### Application Logging

```python
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
handler = RotatingFileHandler(
    'x402.log',
    maxBytes=10000000,
    backupCount=5
)
handler.setLevel(logging.INFO)
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
handler.setFormatter(formatter)

logger = logging.getLogger('x402')
logger.addHandler(handler)

# Log payments
logger.info(f"Payment processed: {transaction_signature}")
```

### Transaction Monitoring

```python
def monitor_transactions():
    """Monitor and log all transactions"""
    while True:
        try:
            # Check recent transactions
            signatures = client.client.get_signatures_for_address(
                client.public_key,
                limit=10
            )
            
            for sig in signatures.value:
                logger.info(f"Transaction: {sig.signature}")
                
        except Exception as e:
            logger.error(f"Monitoring error: {e}")
        
        time.sleep(60)  # Check every minute
```

### Balance Alerts

```python
def check_balance_alert():
    """Alert if balance is low"""
    balance = client.get_balance()
    
    if balance < 0.1:  # Less than 0.1 SOL
        send_alert(f"Low balance warning: {balance} SOL")
```

## Performance Optimization

### 1. Connection Pooling

```python
from solana.rpc.api import Client
from functools import lru_cache

@lru_cache(maxsize=1)
def get_client():
    return Client(os.getenv('SOLANA_RPC_URL'))
```

### 2. Payment Caching

```python
from functools import lru_cache
from datetime import datetime, timedelta

@lru_cache(maxsize=1000)
def verify_payment_cached(nonce: str, timestamp: int):
    # Cache payment verifications
    return client.process_payment(payment)
```

### 3. Async Operations

```python
from solana.rpc.async_api import AsyncClient
import asyncio

async def process_payment_async(payment):
    async with AsyncClient(rpc_url) as client:
        return await client.send_transaction(transaction)
```

## Scaling

### Horizontal Scaling

Use a load balancer with multiple instances:

```yaml
# docker-compose.yml
version: '3.8'

services:
  x402-server-1:
    build: .
    environment:
      - INSTANCE_ID=1
  
  x402-server-2:
    build: .
    environment:
      - INSTANCE_ID=2
  
  nginx:
    image: nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### Database for Payment Tracking

```python
from sqlalchemy import create_engine, Column, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Payment(Base):
    __tablename__ = 'payments'
    
    nonce = Column(String, primary_key=True)
    amount = Column(Float)
    recipient = Column(String)
    transaction_signature = Column(String)
    timestamp = Column(DateTime)
    status = Column(String)

# Use for payment tracking and analytics
```

## Troubleshooting

### High RPC Latency

Use a dedicated RPC provider:
- QuickNode
- Alchemy
- Helius
- Triton

### Transaction Failures

Implement retry logic:
```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def send_transaction_with_retry(transaction):
    return client.send_transaction(transaction)
```

### Memory Leaks

Monitor and clear caches:
```python
# Clear old nonces periodically
def cleanup_old_nonces():
    current_time = int(datetime.now().timestamp())
    client._nonce_cache = {
        k: v for k, v in client._nonce_cache.items()
        if current_time - v < 3600
    }
```

## Support

For production support:
- GitHub Issues: https://github.com/HaidarIDK/x402/issues
- Documentation: https://github.com/HaidarIDK/x402/tree/main/python

---

**Good luck with your deployment! 🚀**


