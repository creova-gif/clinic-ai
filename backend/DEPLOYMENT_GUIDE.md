# AfyaAI USSD Backend - Deployment Guide

## 📋 Prerequisites

### **1. Africa's Talking Account**
- Sign up: https://africastalking.com
- Verify your account
- Purchase shortcode (*123# or similar) - ~$300-500/year
- Get API credentials (Username + API Key)

### **2. Server Requirements**
- Node.js 18+ or 20+
- 2GB RAM minimum (4GB recommended)
- Ubuntu 20.04 or 22.04 LTS
- SSL certificate (for HTTPS callback)
- Domain name

### **3. Database** (Choose one)
- MongoDB Atlas (recommended for quick start)
- PostgreSQL 14+
- MySQL 8+

---

## 🚀 Quick Start (Local Development)

### **Step 1: Clone and Install**
```bash
# Create backend directory
mkdir afyaai-backend
cd afyaai-backend

# Copy backend files
# - ussd-server.js
# - clinical-decision-tree.json
# - sms-templates.json
# - package.json

# Install dependencies
npm install
```

### **Step 2: Create package.json**
```json
{
  "name": "afyaai-ussd-server",
  "version": "1.0.0",
  "description": "AfyaAI USSD Triage Backend",
  "main": "ussd-server.js",
  "scripts": {
    "start": "node ussd-server.js",
    "dev": "nodemon ussd-server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "body-parser": "^1.20.2",
    "axios": "^1.6.0",
    "dotenv": "^16.3.1",
    "mongodb": "^6.3.0",
    "crypto": "^1.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0"
  }
}
```

### **Step 3: Create .env File**
```bash
# .env
PORT=3000

# Africa's Talking
AT_USERNAME=your_username
AT_API_KEY=your_api_key
AT_SHORTCODE=*123#

# Database (MongoDB example)
MONGODB_URI=mongodb://localhost:27017/afyaai

# OR PostgreSQL
# DATABASE_URL=postgresql://user:pass@localhost:5432/afyaai

# Environment
NODE_ENV=development

# Security
SESSION_SECRET=your_random_secret_here

# Logging
LOG_LEVEL=info
```

### **Step 4: Run Server**
```bash
npm start

# Or with hot reload
npm run dev
```

**Expected output:**
```
[AfyaAI USSD Server] Running on port 3000
[Callback URL] https://yourdomain.com/ussd
```

---

## 🌐 Production Deployment

### **Option 1: AWS EC2**

#### **1. Launch EC2 Instance**
```bash
# Ubuntu Server 22.04 LTS
# Instance type: t3.small (2 vCPU, 2GB RAM)
# Storage: 20GB SSD
# Security Group: Allow 80, 443, 3000
```

#### **2. SSH and Setup**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

#### **3. Deploy Application**
```bash
# Clone repository or upload files
cd /home/ubuntu
mkdir afyaai-backend
cd afyaai-backend

# Upload files (scp, git, etc.)
# Install dependencies
npm install

# Configure environment
nano .env
# Add production values

# Start with PM2
pm2 start ussd-server.js --name afyaai-ussd
pm2 startup
pm2 save
```

#### **4. Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/afyaai

# Add this configuration:
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /ussd {
        proxy_pass http://localhost:3000/ussd;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/afyaai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### **5. Install SSL Certificate**
```bash
# Using Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

### **Option 2: DigitalOcean App Platform**

#### **1. Create Dockerfile**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["node", "ussd-server.js"]
```

#### **2. Deploy**
```bash
# Create app.yaml
```

```yaml
name: afyaai-ussd
services:
  - name: ussd-server
    dockerfile_path: Dockerfile
    source_dir: .
    github:
      repo: your-org/afyaai-backend
      branch: main
    envs:
      - key: AT_USERNAME
        value: ${AT_USERNAME}
      - key: AT_API_KEY
        value: ${AT_API_KEY}
        type: SECRET
    http_port: 3000
    health_check:
      http_path: /health
    routes:
      - path: /
```

```bash
# Deploy via DigitalOcean CLI
doctl apps create --spec app.yaml
```

**Cost:** ~$12/month for 1 vCPU, 1GB RAM

---

### **Option 3: Railway.app (Easiest)**

#### **1. Create railway.json**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node ussd-server.js",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

#### **2. Deploy**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Set environment variables
railway variables set AT_USERNAME=your_username
railway variables set AT_API_KEY=your_api_key

# Deploy
railway up
```

**Cost:** $5-10/month

---

## 🔧 Africa's Talking Configuration

### **1. Login to Dashboard**
https://account.africastalking.com/apps/dashboard

### **2. Create Shortcode**
- Go to: **USSD** → **Create Channel**
- Shortcode: `*123#` (or available alternative)
- Name: `AfyaAI Triage`
- Callback URL: `https://yourdomain.com/ussd`
- HTTP Method: `POST`

### **3. Test Shortcode**
- Use Africa's Talking simulator
- Or dial from a real phone

### **4. Configure SMS**
- Go to: **SMS** → **Settings**
- Sender ID: `AfyaAI`
- Callback URL: `https://yourdomain.com/sms-status` (optional)

---

## 📊 Database Setup

### **MongoDB (Recommended)**

#### **1. MongoDB Atlas (Cloud)**
```bash
# Create a free cluster at https://cloud.mongodb.com
# Placeholder only. Do not commit a username, password, or cluster host.
# MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
```

#### **2. Local MongoDB**
```bash
# Install
sudo apt install -y mongodb

# Start
sudo systemctl start mongodb

# Connection string
MONGODB_URI=mongodb://localhost:27017/afyaai
```

#### **3. Create Collections**
```javascript
// In MongoDB shell or Compass
use afyaai

db.createCollection('ussd_sessions')
db.createCollection('referrals')
db.createCollection('sms_logs')

// Create indexes
db.ussd_sessions.createIndex({ "session_id": 1 })
db.ussd_sessions.createIndex({ "phone_number_hash": 1 })
db.ussd_sessions.createIndex({ "timestamp": 1 })
db.ussd_sessions.createIndex({ "risk_level": 1 })

db.referrals.createIndex({ "referral_code": 1 }, { unique: true })
db.referrals.createIndex({ "facility_hfr_id": 1 })
db.referrals.createIndex({ "timestamp": 1 })
```

---

### **PostgreSQL Alternative**

#### **Schema**
```sql
CREATE TABLE ussd_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    phone_number_hash VARCHAR(64) NOT NULL,
    language VARCHAR(2),
    reason_for_use VARCHAR(50),
    age_group VARCHAR(10),
    pregnancy BOOLEAN,
    symptom VARCHAR(50),
    danger_sign VARCHAR(50),
    consciousness VARCHAR(50),
    risk_level VARCHAR(10),
    recommendation VARCHAR(50),
    referral_code VARCHAR(20),
    facility_hfr_id VARCHAR(20),
    duration_seconds INTEGER,
    status VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_id ON ussd_sessions(session_id);
CREATE INDEX idx_phone_hash ON ussd_sessions(phone_number_hash);
CREATE INDEX idx_timestamp ON ussd_sessions(timestamp);
CREATE INDEX idx_risk_level ON ussd_sessions(risk_level);

CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    session_id VARCHAR(100),
    phone_number_hash VARCHAR(64),
    risk_level VARCHAR(10),
    facility_hfr_id VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sms_logs (
    id SERIAL PRIMARY KEY,
    phone_number_hash VARCHAR(64),
    message TEXT,
    status VARCHAR(20),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP
);
```

---

## 🧪 Testing

### **1. Local Testing with cURL**

#### Test USSD Flow
```bash
# Screen 0: Start session
curl -X POST http://localhost:3000/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+255754123456" \
  -d "text="

# Expected: CON Karibu AfyaAI...

# Screen 1: Select language (Kiswahili)
curl -X POST http://localhost:3000/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+255754123456" \
  -d "text=1"

# Expected: CON Unahitaji msaada...

# Continue through flow
curl -X POST http://localhost:3000/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+255754123456" \
  -d "text=1*1*1*2*1"

# Expected: END with risk assessment
```

### **2. Africa's Talking Simulator**
- Go to: https://simulator.africastalking.com
- Select USSD
- Enter shortcode: `*123#`
- Test full flow

### **3. Real Phone Testing**
- Dial `*123#` from Vodacom/Airtel/Tigo phone
- Must be in Tanzania
- Shortcode must be live

---

## 📈 Monitoring

### **1. Basic Logging**
```javascript
// Add to ussd-server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Use in code
logger.info('[USSD] Session started', { sessionId, phoneNumber });
logger.error('[USSD Error]', { error: error.message, stack: error.stack });
```

### **2. PM2 Monitoring**
```bash
# View logs
pm2 logs afyaai-ussd

# Monitor
pm2 monit

# Status
pm2 status

# Restart
pm2 restart afyaai-ussd
```

### **3. Uptime Monitoring**
- Use UptimeRobot (free): https://uptimerobot.com
- Monitor: `https://yourdomain.com/health`
- Alert on downtime

### **4. Analytics Dashboard**
```bash
# Install and configure Grafana
# Or use built-in /health endpoint
curl https://yourdomain.com/health

# Response:
{
  "status": "healthy",
  "service": "AfyaAI USSD Server",
  "version": "1.0.0",
  "active_sessions": 12
}
```

---

## 💰 Cost Breakdown (Tanzania)

### **Infrastructure:**
| Service | Provider | Cost/Month |
|---------|----------|------------|
| Server (2GB RAM) | DigitalOcean/AWS | $12-20 |
| Domain | Namecheap | $1-2 |
| SSL Certificate | Let's Encrypt | Free |
| Database | MongoDB Atlas | Free (512MB) |
| **Total Infrastructure** | | **$13-22/month** |

### **Africa's Talking:**
| Service | Cost |
|---------|------|
| USSD Shortcode | $300-500/year |
| USSD Session | TZS 10-20 (~$0.004-0.008) |
| SMS (outgoing) | TZS 50-100 (~$0.02-0.04) |

**Example for 10,000 users/month:**
- USSD: 10,000 × $0.006 = $60
- SMS: 10,000 × $0.03 = $300
- **Total operational:** ~$360/month

**Total first-year cost:** ~$5,000-6,000

---

## 🔒 Security Checklist

- ✅ Use HTTPS (SSL certificate)
- ✅ Hash phone numbers (never store plain)
- ✅ Validate all inputs
- ✅ Rate limit API endpoints
- ✅ Use environment variables for secrets
- ✅ Enable CORS only for Africa's Talking IPs
- ✅ Implement session timeouts
- ✅ Log all transactions (GDPR/PDPA compliant)
- ✅ Regular security audits
- ✅ Keep dependencies updated

---

## 🚨 Troubleshooting

### **Issue: USSD not responding**
```bash
# Check server status
pm2 status

# Check logs
pm2 logs afyaai-ussd --lines 100

# Test endpoint
curl https://yourdomain.com/health

# Check Africa's Talking webhook logs
# Dashboard → USSD → Logs
```

### **Issue: SMS not sending**
```bash
# Verify API credentials
echo $AT_API_KEY

# Test SMS API directly
curl -X POST https://api.africastalking.com/version1/messaging \
  -H "apiKey: $AT_API_KEY" \
  -d "username=$AT_USERNAME" \
  -d "to=+255754123456" \
  -d "message=Test from AfyaAI"
```

### **Issue: High latency**
- Check server location (should be in Africa/Europe)
- Optimize database queries
- Enable caching (Redis)
- Use CDN for static assets

---

## 📝 Next Steps

1. ✅ Deploy backend to production
2. ✅ Register shortcode with Africa's Talking
3. ✅ Set up database
4. ✅ Configure monitoring
5. ⚠️ Pilot with 100 users (2-4 weeks)
6. ⚠️ Gather feedback and iterate
7. ⚠️ Scale to 10,000 users
8. ⚠️ MoH partnership and TMDA approval
9. ⚠️ National rollout

---

**Support:** support@afyaai.go.tz  
**Documentation:** https://docs.afyaai.go.tz  
**Status:** https://status.afyaai.go.tz

**Built for Tanzania 🇹🇿 | Production-Ready 🚀 | Lives Saved 💚**
