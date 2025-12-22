# Dad-Gaming Hub

Eine moderne Full-Stack Web-Anwendung für Gaming-Väter zum Vernetzen und Organisieren von Gaming-Sessions.

## 🎮 Features

- **Benutzer-Authentifizierung**: Registrierung und Login mit Supabase Auth
- **Gaming-Profile**: Zeige Lieblingsspiele, Plattformen (PC, PS5, Xbox, Switch) und Verfügbarkeit
- **Benutzer-Suche**: Finde andere Väter nach Spielen, Plattformen und Online-Status
- **Freundschaftssystem**: Sende und verwalte Freundschaftsanfragen
- **Gaming-Sessions**: Erstelle und organisiere gemeinsame Gaming-Sessions
- **Echtzeit-Chat**: Direktnachrichten und Session-Chat (coming soon)
- **Benachrichtigungen**: Echtzeit-Updates zu Anfragen und Events (coming soon)
- **Responsive Design**: Funktioniert perfekt auf Desktop und Mobile

## 🛠 Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS v4
- React Router DOM
- Supabase Client
- Axios
- Socket.IO Client

### Backend
- Node.js + Express
- Supabase (PostgreSQL)
- Supabase Auth
- Socket.IO
- JWT

### Datenbank
- Supabase PostgreSQL
- Row Level Security (RLS)
- Realtime Subscriptions

## 📋 Voraussetzungen

- Node.js (v20.15 oder höher)
- npm oder yarn
- Ein Supabase Account (kostenlos)

## 🚀 Installation

### 1. Repository klonen

```bash
git clone <your-repo-url>
cd vatergames
```

### 2. Supabase Projekt einrichten

Folge der detaillierten Anleitung in [`backend/SUPABASE_SETUP.md`](backend/SUPABASE_SETUP.md)

**Kurzversion:**
1. Erstelle ein kostenloses Projekt auf [supabase.com](https://supabase.com)
2. Führe das SQL-Schema aus `backend/supabase-schema.sql` im SQL Editor aus
3. Hole deine API Keys aus den Project Settings

### 3. Backend einrichten

```bash
cd backend
npm install

# Erstelle .env Datei
copy .env.example .env

# Bearbeite .env und füge deine Supabase Credentials ein:
# SUPABASE_URL=https://dein-projekt.supabase.co
# SUPABASE_SERVICE_KEY=dein_service_role_key
# SUPABASE_ANON_KEY=dein_anon_key
```

### 4. Frontend einrichten

```bash
cd dad-gaming-hub
npm install

# .env ist bereits vorhanden, füge deine Supabase Credentials ein:
# VITE_SUPABASE_URL=https://dein-projekt.supabase.co
# VITE_SUPABASE_ANON_KEY=dein_anon_key
```

### 5. Starten

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd dad-gaming-hub
npm run dev
```

Die App läuft auf:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 📖 Verwendung

### Registrierung

1. Öffne `http://localhost:5173`
2. Klicke auf "Jetzt registrieren"
3. Fülle das Formular aus:
   - Benutzername (mind. 3 Zeichen)
   - Name
   - Alter (mind. 18)
   - Anzahl Kinder
   - E-Mail
   - Passwort (mind. 6 Zeichen)
4. Nach erfolgreicher Registrierung wirst du automatisch eingeloggt

### Profil vervollständigen

Nach der Registrierung solltest du dein Profil vervollständigen:
- Füge deine Gaming-Plattformen hinzu (PC, PS5, Xbox, Switch)
- Trage deine Lieblingsspiele ein
- Setze deine Verfügbarkeit (Wochentage)
- Füge Kontaktdaten hinzu (Discord, PSN, Xbox Live, etc.)

### Andere Väter finden

- Nutze die Suchfunktion um nach Spielen oder Namen zu suchen
- Filtere nach Plattform
- Filtere nach Online/Offline Status
- Klicke auf "Anfrage senden" um eine Freundschaftsanfrage zu versenden

### Gaming-Sessions erstellen (coming soon)

- Erstelle eine Session mit Spiel, Plattform und Termin
- Lade Freunde ein oder mache sie öffentlich
- Chatte mit den Teilnehmern
- Organisiere Voice-Chat über Discord, Party Chat oder In-Game

## 📁 Projekt-Struktur

```
vatergames/
├── backend/                    # Node.js Backend
│   ├── src/
│   │   ├── config/            # Supabase & andere Configs
│   │   ├── controllers/       # Request Handler
│   │   ├── middleware/        # Auth, Validation, etc.
│   │   ├── routes/           # API Routes
│   │   └── server.js         # Express Server + Socket.IO
│   ├── supabase-schema.sql   # Datenbank Schema
│   ├── SUPABASE_SETUP.md     # Detaillierte Setup-Anleitung
│   └── package.json
│
├── dad-gaming-hub/            # React Frontend
│   ├── src/
│   │   ├── components/       # React Komponenten
│   │   ├── context/          # State Management (Auth)
│   │   ├── lib/              # Supabase Client
│   │   ├── services/         # API Services
│   │   ├── main.jsx          # App Entry Point
│   │   └── index.css         # Tailwind CSS
│   └── package.json
│
└── README.md                  # Diese Datei
```

## 🔒 Sicherheit

- **Row Level Security**: Alle Datenbank-Tabellen sind mit RLS geschützt
- **Authentication**: Supabase Auth mit JWT
- **Environment Variables**: Sensible Daten in `.env` Dateien
- **Password Hashing**: Automatisch durch Supabase
- **CORS**: Konfiguriert für sicheren API-Zugriff

## 🐛 Troubleshooting

### Supabase Connection Error

1. Prüfe ob die Supabase Keys korrekt in `.env` eingetragen sind
2. Stelle sicher, dass das SQL-Schema ausgeführt wurde
3. Überprüfe ob RLS Policies korrekt konfiguriert sind

### Frontend lädt nicht

1. Prüfe ob alle Dependencies installiert sind: `npm install`
2. Lösche `node_modules` und installiere neu
3. Prüfe die Browser-Konsole für Fehler

### Backend Connection Error

1. Stelle sicher, dass das Backend läuft (Port 5000)
2. Prüfe `.env` Datei im Backend
3. Schaue in die Backend-Logs für Fehler

### Tailwind CSS lädt nicht

1. Stelle sicher, dass `@tailwindcss/postcss` installiert ist
2. `postcss.config.js` sollte `@tailwindcss/postcss` verwenden
3. In `src/index.css` sollte `@import "tailwindcss";` stehen

## 🎯 Roadmap

- [x] Benutzer-Authentifizierung
- [x] Profilverwaltung
- [x] Benutzer-Suche und Filter
- [x] Freundschaftssystem
- [ ] Gaming-Sessions erstellen und verwalten
- [ ] Echtzeit-Chat mit Socket.IO
- [ ] Push-Benachrichtigungen
- [ ] Profil-Bearbeitungsseite
- [ ] Avatar-Upload zu Supabase Storage
- [ ] Gaming-Statistiken
- [ ] Mobile App (React Native)

## 👥 Contributing

Contributions sind willkommen! Bitte erstelle ein Issue oder Pull Request.

## 📄 Lizenz

MIT License

## 💬 Support

Bei Fragen oder Problemen:
1. Prüfe die `SUPABASE_SETUP.md` Anleitung
2. Schaue in die README Dateien der Unterordner
3. Erstelle ein Issue im Repository

---

Made with ❤️ für Gaming-Dads
