# 🚀 AIAS Platform - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the AIAS platform to production with enterprise-grade monitoring, security, and performance optimizations.

## Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 8GB, Recommended 16GB+
- **CPU**: Minimum 4 cores, Recommended 8+ cores
- **Storage**: Minimum 100GB SSD, Recommended 500GB+ SSD
- **Network**: Stable internet connection with static IP

### Software Requirements
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 18.17.0+
- **pnpm**: 8.0.0+
- **Git**: 2.30+

## Environment Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js and pnpm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm@8.15.0
```

### 2. Clone Repository

```bash
git clone https://github.com/your-org/aias-platform.git
cd aias-platform
```

### 3. Environment Configuration

Create production environment file:

```bash
cp .env.example .env.production
```

Configure production environment variables:

```env
# Application
NODE_ENV=production
VITE_APP_URL=https://your-domain.com
VITE_APP_VERSION=1.0.0

# Database
POSTGRES_DB=aias_production
POSTGRES_USER=aias_user
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://aias_user:your_secure_password@postgres:5432/aias_production

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Redis
REDIS_PASSWORD=your_redis_password
REDIS_URL=redis://:your_redis_password@redis:6379

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# AI Services
OPENAI_API_KEY=sk-your_openai_key
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key

# Monitoring
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=your_grafana_password

# Security
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key
```

## Build and Deploy

### 1. Build Application

```bash
# Install dependencies
pnpm install

# Build for production
pnpm run build

# Run type checking
pnpm run typecheck

# Run linting
pnpm run lint

# Run tests
pnpm run test
```

### 2. Docker Build

```bash
# Build production image
docker build -t aias-platform:latest .

# Tag for registry
docker tag aias-platform:latest your-registry/aias-platform:latest
```

### 3. Deploy with Docker Compose

```bash
# Deploy production stack
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## SSL Configuration

### 1. Obtain SSL Certificate

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test renewal
sudo certbot renew --dry-run
```

### 2. Configure Nginx

Update nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'self';" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }

    # Monitoring endpoints
    location /metrics {
        proxy_pass http://localhost:9090/metrics;
        allow 127.0.0.1;
        deny all;
    }
}
```

## Monitoring Setup

### 1. Access Monitoring Dashboards

- **Grafana**: https://your-domain.com:3001
  - Username: admin
  - Password: your_grafana_password

- **Prometheus**: https://your-domain.com:9090

- **Health Dashboard**: https://your-domain.com/health

### 2. Configure Alerts

Update alert rules in `monitoring/alert_rules.yml`:

```yaml
groups:
  - name: aias.rules
    rules:
      - alert: ApplicationDown
        expr: up{job="aias-app"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "AIAS application is down"
          description: "The AIAS application has been down for more than 1 minute."
```

## Database Setup

### 1. Run Migrations

```bash
# Connect to database container
docker exec -it aias-postgres psql -U aias_user -d aias_production

# Run migrations
\i /docker-entrypoint-initdb.d/migrations/001_initial_schema.sql
\i /docker-entrypoint-initdb.d/migrations/002_platform_tables.sql
\i /docker-entrypoint-initdb.d/migrations/003_monitoring_tables.sql
```

### 2. Seed Initial Data

```bash
# Run seed script
docker exec -it aias-app pnpm run db:seed
```

## Security Configuration

### 1. Firewall Setup

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Security Headers

Verify security headers are properly configured:

```bash
# Test security headers
curl -I https://your-domain.com
```

### 3. Rate Limiting

Configure rate limiting in nginx:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://localhost:3000;
}

location /auth/ {
    limit_req zone=login burst=5 nodelay;
    proxy_pass http://localhost:3000;
}
```

## Backup Configuration

### 1. Database Backup

```bash
# Create backup script
cat > /opt/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="aias_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

docker exec aias-postgres pg_dump -U aias_user aias_production > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
