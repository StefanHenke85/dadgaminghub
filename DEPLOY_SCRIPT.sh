#!/bin/bash

# Dad Gaming Hub - Deployment Script
# Server: 81.7.11.191 (dad-games.henke-net.com)

echo "🚀 Dad Gaming Hub - Deployment gestartet..."

SERVER="root@81.7.11.191"
REMOTE_PATH="/var/www/dadgaminghub"

echo "📋 1. SQL Tabellen in Supabase erstellen..."
echo "   Bitte führe CREATE_FRIENDS_TABLES.sql in Supabase SQL Editor aus!"
read -p "   Drücke ENTER wenn fertig..."

echo "📦 2. Backend Controller hochladen..."
scp backend/src/controllers/userController.js $SERVER:$REMOTE_PATH/backend/src/controllers/
scp backend/src/routes/users.js $SERVER:$REMOTE_PATH/backend/src/routes/

echo "🔄 3. Backend neu starten..."
ssh $SERVER "cd $REMOTE_PATH/backend && pm2 restart all"

echo "🎨 4. Frontend Build erstellen..."
cd dad-gaming-hub
npm run build

echo "📤 5. Frontend hochladen..."
scp -r dist/* $SERVER:$REMOTE_PATH/frontend/

echo "✅ Deployment abgeschlossen!"
echo "🌐 Teste jetzt: https://dad-games.henke-net.com"
