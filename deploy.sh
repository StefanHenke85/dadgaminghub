#!/bin/bash

# Dad Gaming Hub - Deployment Script
# Server: dad-games.henke-net.com (81.7.11.191)

SERVER_IP="81.7.11.191"
SERVER_USER="root"
SERVER_PATH="/var/www/dad-gaming-hub"

echo "🚀 Starting deployment to dad-games.henke-net.com..."

# Build frontend
echo "📦 Building frontend..."
cd dad-gaming-hub
npm install
npm run build
cd ..

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf deploy.tar.gz \
    backend/ \
    dad-gaming-hub/dist/ \
    DEPLOYMENT.md \
    --exclude node_modules \
    --exclude .env

# Upload to server
echo "⬆️  Uploading to server..."
scp deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

# Deploy on server
echo "🔧 Deploying on server..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    cd /var/www/dad-gaming-hub

    # Backup current version
    if [ -d "backend" ]; then
        tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz backend/ dad-gaming-hub/
    fi

    # Extract new version
    tar -xzf /tmp/deploy.tar.gz

    # Update backend
    cd backend
    npm install --production
    pm2 restart dad-gaming-api || pm2 start src/server.js --name dad-gaming-api

    # Cleanup
    rm /tmp/deploy.tar.gz

    echo "✅ Deployment complete!"
ENDSSH

# Cleanup local files
rm deploy.tar.gz

echo "✅ Deployment successful!"
echo "🌐 Visit: https://dad-games.henke-net.com"
