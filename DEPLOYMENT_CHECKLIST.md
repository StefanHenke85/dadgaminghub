# Deployment Checklist - Dad Gaming Hub

## ✅ Pre-Deployment

- [x] Backend vollständig implementiert
- [x] Frontend vollständig implementiert
- [x] Git Repository initialisiert
- [x] .gitignore konfiguriert
- [x] Dokumentation erstellt

## 🔧 Supabase Setup

- [ ] **Storage Bucket erstellen**
  - Gehe zu Storage > New Bucket
  - Name: `avatars`
  - Public: ✅ Ja

- [ ] **RLS Policies prüfen**
  - `profiles` Tabelle: Public read access
  - Storage Policies für Avatar Upload

- [ ] **Email Templates**
  - Password Reset Template aktiviert
  - SMTP konfiguriert

## 📦 Server Setup (81.7.11.191)

### 1. Initiale Server-Konfiguration
```bash
# SSH in Server
ssh root@81.7.11.191

# System aktualisieren
apt update && apt upgrade -y

# Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2 installieren
npm install -g pm2

# Nginx installieren
apt install -y nginx

# Git installieren
apt install -y git
```

### 2. Repository klonen
```bash
cd /var/www
git clone https://github.com/YOUR-USERNAME/dad-gaming-hub.git
cd dad-gaming-hub
```

### 3. Backend deployen
```bash
cd backend

# Dependencies installieren
npm install --production

# .env erstellen
nano .env
# Füge ein:
# PORT=5000
# NODE_ENV=production
# SUPABASE_URL=https://lzcroaqsmslgbcojsmwj.supabase.co
# SUPABASE_SERVICE_KEY=<your_service_key>
# SUPABASE_ANON_KEY=<your_anon_key>
# JWT_SECRET=<secure_random_string>
# CLIENT_URL=https://dad-games.henke-net.com

# Mit PM2 starten
pm2 start src/server.js --name dad-gaming-api
pm2 save
pm2 startup
```

### 4. Frontend bauen
```bash
cd ../dad-gaming-hub

# Dependencies installieren
npm install

# .env.production erstellen
echo "VITE_API_URL=https://dad-games.henke-net.com/api" > .env.production

# Build erstellen
npm run build
```

### 5. Nginx konfigurieren
```bash
nano /etc/nginx/sites-available/dad-gaming-hub
```

Füge ein:
```nginx
server {
    listen 80;
    server_name dad-games.henke-net.com;

    # Frontend
    location / {
        root /var/www/dad-gaming-hub/dad-gaming-hub/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
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

Aktivieren:
```bash
ln -s /etc/nginx/sites-available/dad-gaming-hub /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 6. SSL Zertifikat (Let's Encrypt)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d dad-games.henke-net.com
```

### 7. Firewall
```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

## 🧪 Testing

Nach Deployment testen:

- [ ] https://dad-games.henke-net.com lädt
- [ ] Login funktioniert
- [ ] Profil-Bearbeitung funktioniert
- [ ] Avatar-Upload funktioniert
- [ ] Gaming Sessions funktionieren
- [ ] Chat funktioniert (Socket.IO)
- [ ] Admin Dashboard zugänglich

## 📝 Post-Deployment

- [ ] DNS-Eintrag dad-games.henke-net.com → 81.7.11.191 prüfen
- [ ] SSL-Zertifikat funktioniert (HTTPS)
- [ ] PM2 läuft und auto-restart aktiviert
- [ ] Backup-Strategie implementieren
- [ ] Monitoring einrichten (optional: Uptime Robot)

## 🔄 Updates

Für zukünftige Updates:
```bash
cd /var/www/dad-gaming-hub
git pull
cd backend && npm install && pm2 restart dad-gaming-api
cd ../dad-gaming-hub && npm install && npm run build
```

## 📊 Monitoring

```bash
# Backend Logs
pm2 logs dad-gaming-api

# Nginx Logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# System Status
pm2 status
systemctl status nginx
```

## 🆘 Troubleshooting

### Backend startet nicht
```bash
pm2 logs dad-gaming-api
# Prüfe .env Datei
# Prüfe Supabase Credentials
```

### Frontend 404 Errors
```bash
# Prüfe ob dist/ Ordner existiert
ls /var/www/dad-gaming-hub/dad-gaming-hub/dist

# Nginx reload
systemctl reload nginx
```

### Socket.IO funktioniert nicht
```bash
# Prüfe Nginx Config für /socket.io location
# Prüfe PM2 logs für Backend errors
```

---

**Server Credentials**
- IP: 81.7.11.191
- User: root
- Password: o6gZZqiM
- Domain: dad-games.henke-net.com
