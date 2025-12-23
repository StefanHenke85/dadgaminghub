# Dad Gaming Hub - Quick Start Guide

## ✅ Was ist fertig?

### Backend
- ✅ Supabase Integration (PostgreSQL, Auth, Storage)
- ✅ JWT Authentication
- ✅ User Management (Profile, Friends)
- ✅ Gaming Sessions API
- ✅ Real-time Chat (Socket.IO)
- ✅ Admin Dashboard API
- ✅ Avatar Upload zu Supabase Storage

### Frontend
- ✅ Login / Registration
- ✅ User Dashboard mit Suche & Filter
- ✅ Profil-Bearbeitung
- ✅ Avatar Upload
- ✅ Gaming Sessions erstellen & beitreten
- ✅ Echtzeit-Chat
- ✅ Admin Dashboard (User Management, Bans, Roles)
- ✅ Responsive Design (Tailwind CSS)

## 🚀 Lokale Entwicklung

### 1. Backend starten
```bash
cd backend
npm install
# .env Datei erstellen mit Supabase Credentials
npm run dev
# Läuft auf http://localhost:5000
```

### 2. Frontend starten
```bash
cd dad-gaming-hub
npm install
npm run dev
# Läuft auf http://localhost:5173
```

### 3. Login
- **Email**: info@henke-net.com
- **Passwort**: LeonieSophie2018#
- **Rolle**: Admin

## 📦 Deployment auf dad-games.henke-net.com

### Option 1: Automatisches Deployment
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manuelles Deployment
Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für detaillierte Schritte.

## 🔧 Wichtige Konfigurationen

### Supabase Setup
1. **Storage Bucket erstellen**: `avatars` (Public)
2. **RLS Policies**: Siehe backend/SUPABASE_SETUP.md
3. **Email Templates**: Konfiguriert für Password Reset

### Environment Variables

**Backend (.env)**:
```env
PORT=5000
SUPABASE_URL=https://lzcroaqsmslgbcojsmwj.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_secure_secret
CLIENT_URL=http://localhost:5173
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 Features

### Für User
- Profil mit Gaming-IDs (Discord, PSN, Xbox, Steam, Switch)
- Spieler suchen & filtern nach Plattform, Games, Verfügbarkeit
- Gaming Sessions erstellen & beitreten
- Echtzeit-Chat mit anderen Spielern
- Avatar hochladen

### Für Admins
- User-Übersicht mit Statistiken
- User bannen/entbannen
- Rollen ändern (User/Moderator/Admin)
- Admin-Logs
- User-Suche

## 🐛 Bekannte Issues

- ~~Login-Problem behoben~~ ✅
- ~~Auth-Middleware auf Supabase umgestellt~~ ✅
- ~~Avatar Upload implementiert~~ ✅

## 🔜 Nächste Schritte

1. **GitHub Repository erstellen**
   ```bash
   # Repository auf GitHub erstellen, dann:
   git remote add origin https://github.com/YOUR-USERNAME/dad-gaming-hub.git
   git push -u origin master
   ```

2. **Auf Server deployen**
   - Siehe DEPLOYMENT.md
   - Server: 81.7.11.191
   - Domain: dad-games.henke-net.com

3. **Supabase Storage Bucket**
   - `avatars` Bucket in Supabase erstellen
   - Public Access aktivieren

4. **SSL Zertifikat**
   - Let's Encrypt einrichten (siehe DEPLOYMENT.md)

## 📞 Support

Bei Fragen oder Problemen:
- **Email**: info@henke-net.com
- **GitHub Issues**: (Nach Repository-Erstellung)

---

**Made with ❤️ for gaming dads**
