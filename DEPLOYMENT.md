# Deployment Guide - Dad Gaming Hub

## Server Details
- **Domain**: dad-games.henke-net.com
- **Server IP**: 81.7.11.191
- **Server**: euserv VServer

## Prerequisites on Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

## Deployment Steps

### 1. Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/YOUR-USERNAME/dad-gaming-hub.git
cd dad-gaming-hub
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=production

SUPABASE_URL=https://lzcroaqsmslgbcojsmwj.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SERVICE_KEY
SUPABASE_ANON_KEY=YOUR_ANON_KEY

JWT_SECRET=YOUR_SECURE_JWT_SECRET
CLIENT_URL=https://dad-games.henke-net.com
EOF

# Start with PM2
pm2 start src/server.js --name dad-gaming-api
pm2 save
pm2 startup
```

### 3. Setup Frontend
```bash
cd ../dad-gaming-hub
npm install

# Create .env.production
cat > .env.production << EOF
VITE_API_URL=https://dad-games.henke-net.com/api
EOF

# Build for production
npm run build
```

### 4. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/dad-gaming-hub
```

Add configuration:
```nginx
server {
    listen 80;
    server_name dad-games.henke-net.com;

    # Frontend
    location / {
        root /var/www/dad-gaming-hub/dad-gaming-hub/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/dad-gaming-hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Setup SSL (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d dad-games.henke-net.com
```

### 6. Setup Firewall
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## Updates

### Update Application
```bash
cd /var/www/dad-gaming-hub
sudo git pull

# Update backend
cd backend
npm install
pm2 restart dad-gaming-api

# Update frontend
cd ../dad-gaming-hub
npm install
npm run build
```

## Monitoring
```bash
# View logs
pm2 logs dad-gaming-api

# Monitor processes
pm2 monit

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Backup
```bash
# Backup Supabase data via Supabase Dashboard
# Database > Backups

# Backup uploaded files
sudo tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/dad-gaming-hub
```
