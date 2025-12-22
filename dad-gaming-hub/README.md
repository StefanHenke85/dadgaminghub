# Dad-Gaming Hub - Frontend

Eine moderne React-Anwendung für Gaming-Väter, um sich zu vernetzen und gemeinsame Gaming-Sessions zu planen.

## Features

- **Benutzer-Authentifizierung**: Login und Registrierung
- **Gaming-Profile**: Zeige deine Lieblingsspiele, Plattformen und Verfügbarkeit
- **Benutzer-Suche**: Finde andere Väter nach Spielen, Plattformen und Online-Status
- **Freundschaftssystem**: Sende Freundschaftsanfragen und vernetze dich
- **Responsive Design**: Funktioniert auf Desktop und Mobile

## Tech Stack

- React 19
- Vite
- Tailwind CSS v4
- React Router DOM
- Axios für API-Calls
- Socket.IO Client (für Echtzeit-Features)

## Installation & Start

### Voraussetzungen

- Node.js (v20.15 oder höher)
- Das Backend muss laufen (siehe `../backend/README.md`)

### Schritte

1. **Dependencies installieren:**
```bash
npm install
```

2. **Umgebungsvariablen konfigurieren:**

Die `.env` Datei ist bereits erstellt:
```env
VITE_API_URL=http://localhost:5000/api
```

Falls das Backend auf einem anderen Port läuft, passe die URL entsprechend an.

3. **Entwicklungsserver starten:**
```bash
npm run dev
```

Die App läuft auf `http://localhost:5173`

4. **Build für Produktion:**
```bash
npm run build
npm run preview
```

## Projekt-Struktur

```
src/
├── components/
│   ├── Login.jsx              # Login-Seite
│   ├── Register.jsx           # Registrierungs-Seite
│   ├── Dashboard.jsx          # Hauptseite mit Benutzer-Liste
│   ├── Navigation.jsx         # Header mit Logout
│   └── ProtectedRoute.jsx     # Route-Guard für geschützte Seiten
├── context/
│   └── AuthContext.jsx        # Globales Auth State Management
├── services/
│   └── api.js                 # API Service Layer
├── index.css                  # Tailwind CSS Import
└── main.jsx                   # App Entry Point mit Router
```

## Verwendung

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

### Login

1. Gib deine E-Mail und Passwort ein
2. Nach erfolgreichem Login kommst du zum Dashboard

### Dashboard

- **Suche**: Finde andere Väter nach Namen oder Spielen
- **Filter**: Filtere nach Plattform (PC, PS5, Xbox, Switch) und Online-Status
- **Profile**: Sieh dir Profile anderer Väter an
- **Freundschaftsanfragen**: Sende Anfragen an andere Spieler

## API Integration

Das Frontend kommuniziert mit dem Backend über:

- **REST API**: Für CRUD-Operationen
- **JWT Authentication**: Token-basierte Authentifizierung
- **Axios Interceptors**: Automatisches Hinzufügen von Auth-Token

### API Endpoints (verwendet vom Frontend)

- `POST /api/auth/register` - Registrierung
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Eigenes Profil
- `PUT /api/auth/profile` - Profil aktualisieren
- `GET /api/users` - Alle Benutzer laden (mit Filtern)
- `POST /api/users/:id/friend-request` - Freundschaftsanfrage senden

## Nächste Schritte

Geplante Features:
- Gaming-Sessions erstellen und beitreten
- Echtzeit-Chat mit Socket.IO
- Benachrichtigungen
- Profil-Bearbeitung
- Avatar-Upload
- Gaming-Statistiken

## Troubleshooting

### Tailwind CSS lädt nicht

Falls Tailwind CSS nicht lädt:
1. Stelle sicher, dass `@tailwindcss/postcss` installiert ist
2. Prüfe `postcss.config.js` (sollte `@tailwindcss/postcss` verwenden)
3. In `src/index.css` sollte nur `@import "tailwindcss";` stehen

### Backend-Verbindung fehlschlägt

1. Prüfe, ob das Backend auf Port 5000 läuft
2. Überprüfe die `.env` Datei
3. Öffne die Browser-Konsole für Fehler

### Port 5173 ist belegt

```bash
# Windows
netstat -ano | findstr :5173
taskkill //F //PID [PID_NUMBER]

# Oder verwende einen anderen Port
npm run dev -- --port 3000
```

## Support

Bei Fragen oder Problemen erstelle ein Issue im Repository.
