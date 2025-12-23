# 🚀 Deployment zum Server - Anleitung

## Server-Informationen
- **IP:** 81.7.11.191
- **User:** root
- **Password:** o6gZZqiM
- **Pfad:** `/var/www/dadgaminghub`
- **Domain:** dad-games.henke-net.com

## Option 1: Via FTP/SFTP (Empfohlen)

### Mit FileZilla oder WinSCP:

1. **Verbindung einrichten:**
   - Host: `81.7.11.191`
   - Port: `22` (SFTP)
   - User: `root`
   - Passwort: `o6gZZqiM`

2. **Frontend hochladen:**
   - Lokaler Pfad: `dad-gaming-hub/dist/*`
   - Server Pfad: `/var/www/dadgaminghub/frontend/`
   - Alle Dateien aus `dist/` Ordner hochladen

3. **Backend aktualisieren:**
   - Lokaler Pfad: `backend/src/*`
   - Server Pfad: `/var/www/dadgaminghub/backend/src/`
   - Alle geänderten Controller hochladen:
     - `controllers/authController.js`
     - `controllers/adminController.js`
     - `controllers/userController.js`
     - `controllers/sessionController.js`
     - `controllers/messageController.js`
     - `controllers/notificationController.js`

4. **Backend neu starten:**
   ```bash
   # SSH verbinden
   ssh root@81.7.11.191

   # Zum Backend-Ordner
   cd /var/www/dadgaminghub/backend

   # PM2 neu starten
   pm2 restart all

   # Logs prüfen
   pm2 logs
   ```

---

## Option 2: Via Git (Wenn Git auf Server eingerichtet)

```bash
# SSH verbinden
ssh root@81.7.11.191

# Zum Projekt
cd /var/www/dadgaminghub

# Git pull
git pull origin main

# Backend Dependencies aktualisieren
cd backend
npm install

# Backend neu starten
pm2 restart all

# Frontend neu bauen
cd ../frontend
npm install
npm run build
```

---

## Option 3: Direktes Kopieren via SCP

### Frontend deployen:
```bash
# Von deinem lokalen PC
scp -r "c:\Users\Stefan\Desktop\Henke-Net Projeklte\vatergames\dad-gaming-hub\dist\*" root@81.7.11.191:/var/www/dadgaminghub/frontend/
```

### Backend deployen:
```bash
# Controllers
scp "c:\Users\Stefan\Desktop\Henke-Net Projeklte\vatergames\backend\src\controllers\*.js" root@81.7.11.191:/var/www/dadgaminghub/backend/src/controllers/

# Server neu starten
ssh root@81.7.11.191 "cd /var/www/dadgaminghub/backend && pm2 restart all"
```

---

## Nginx Konfiguration prüfen

```bash
ssh root@81.7.11.191

# Nginx Config prüfen
cat /etc/nginx/sites-available/dadgaminghub

# Sollte so aussehen:
```

```nginx
server {
    listen 80;
    server_name dad-games.henke-net.com;

    # Frontend
    location / {
        root /var/www/dadgaminghub/frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## Backend .env Datei prüfen

```bash
ssh root@81.7.11.191
cat /var/www/dadgaminghub/backend/.env
```

Sollte enthalten:
```env
PORT=5000
NODE_ENV=production
SUPABASE_URL=https://lzcroaqsmslgbcojsmwj.supabase.co
SUPABASE_SERVICE_KEY=<dein_service_key>
SUPABASE_ANON_KEY=<dein_anon_key>
JWT_SECRET=<secure_random_string>
CLIENT_URL=https://dad-games.henke-net.com
```

---

## PM2 Befehle

```bash
# Status prüfen
pm2 status

# Logs ansehen
pm2 logs

# Neu starten
pm2 restart all

# Stoppen
pm2 stop all

# Backend löschen und neu hinzufügen
pm2 delete all
pm2 start src/server.js --name dad-gaming-api
pm2 save
```

---

## Schnell-Deployment (Nur geänderte Dateien)

### Was wurde heute geändert:

**Frontend:**
- ✅ `Dashboard.jsx` - Verbesserte User-Cards
- ✅ `Navigation.jsx` - Discord Link hinzugefügt
- ✅ `Register.jsx` - Success-Nachricht
- ✅ `Chat.jsx` - Socket.IO URL-Fix
- ✅ `.env.production` - Production API URL

**Backend:**
- ✅ `authController.js` - Email-Bestätigung aktiviert
- ✅ `adminController.js` - User löschen verbessert
- ✅ `sessionController.js` - Auf Supabase migriert
- ✅ `userController.js` - Auf Supabase migriert
- ✅ `messageController.js` - Auf Supabase migriert
- ✅ `notificationController.js` - Auf Supabase migriert

### Diese Dateien hochladen:

1. **Frontend-Build:**
   ```
   dad-gaming-hub/dist/* → /var/www/dadgaminghub/frontend/
   ```

2. **Backend-Controller:**
   ```
   backend/src/controllers/*.js → /var/www/dadgaminghub/backend/src/controllers/
   ```

3. **PM2 neu starten**

---

## Probleme beheben

### Frontend lädt nicht:
```bash
# Nginx neu starten
systemctl restart nginx

# Logs prüfen
tail -f /var/log/nginx/error.log
```

### Backend startet nicht:
```bash
# PM2 Logs
pm2 logs dad-gaming-api

# .env prüfen
cat /var/www/dadgaminghub/backend/.env

# Manuell starten zum Testen
cd /var/www/dadgaminghub/backend
node src/server.js
```

### Socket.IO funktioniert nicht:
```bash
# Nginx Socket.IO Konfiguration prüfen
cat /etc/nginx/sites-available/dadgaminghub | grep socket

# CORS-Einstellungen im Backend prüfen
cat /var/www/dadgaminghub/backend/src/server.js | grep cors
```

---

## Nach dem Deployment testen:

1. ✅ https://dad-games.henke-net.com öffnen
2. ✅ Registrierung testen
3. ✅ Email-Bestätigung prüfen
4. ✅ Login testen
5. ✅ User-Cards prüfen (zeigen "Spielt gerade"?)
6. ✅ Discord-Link funktioniert?
7. ✅ Chat testen
8. ✅ Gaming Session erstellen

---

**Viel Erfolg! 🚀**
