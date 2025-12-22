# Dad Gaming Hub - Backend API

Backend-Server für die Dad Gaming Hub Plattform mit Node.js, Express, MongoDB und Socket.IO.

## Features

- **Benutzer-Authentifizierung**: Registrierung, Login, JWT-basierte Authentifizierung
- **Profilverwaltung**: Vollständige Benutzerprofil mit Gaming-Präferenzen
- **Freundschaftssystem**: Freundschaftsanfragen senden/akzeptieren/ablehnen
- **Gaming-Sessions**: Sessions erstellen, beitreten, verwalten
- **Echtzeit-Chat**: Direktnachrichten und Session-Chat mit Socket.IO
- **Benachrichtigungen**: Echtzeit-Benachrichtigungen für alle wichtigen Events
- **Online-Status**: Live-Tracking wer online ist und was gespielt wird

## Tech Stack

- Node.js
- Express.js
- MongoDB mit Mongoose
- Socket.IO (WebSockets)
- JWT für Authentifizierung
- bcryptjs für Passwort-Hashing

## Installation

### Voraussetzungen

- Node.js (v16 oder höher)
- MongoDB (lokal oder MongoDB Atlas)

### Schritte

1. **Dependencies installieren:**
```bash
cd backend
npm install
```

2. **Umgebungsvariablen konfigurieren:**

Erstelle eine `.env` Datei im backend-Ordner:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dad-gaming-hub
JWT_SECRET=dein_sehr_geheimer_jwt_schluessel_hier
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

3. **MongoDB starten:**

Wenn du MongoDB lokal installiert hast:
```bash
mongod
```

Oder verwende MongoDB Atlas (cloud): Ersetze `MONGODB_URI` mit deiner Atlas Connection String.

4. **Server starten:**

Entwicklungsmodus (mit Auto-Reload):
```bash
npm run dev
```

Produktionsmodus:
```bash
npm start
```

Der Server läuft auf `http://localhost:5000`

## API Endpunkte

### Authentifizierung

- `POST /api/auth/register` - Neuen Benutzer registrieren
- `POST /api/auth/login` - Anmelden
- `POST /api/auth/logout` - Abmelden (authentifiziert)
- `GET /api/auth/profile` - Eigenes Profil abrufen (authentifiziert)
- `PUT /api/auth/profile` - Profil aktualisieren (authentifiziert)

### Benutzer

- `GET /api/users` - Alle Benutzer abrufen (mit Filtern)
- `GET /api/users/:id` - Einzelnen Benutzer abrufen
- `POST /api/users/:id/friend-request` - Freundschaftsanfrage senden
- `POST /api/users/:id/accept-friend` - Freundschaftsanfrage akzeptieren
- `POST /api/users/:id/decline-friend` - Freundschaftsanfrage ablehnen
- `DELETE /api/users/:id/friend` - Freund entfernen
- `PUT /api/users/status` - Online-Status aktualisieren

### Gaming Sessions

- `POST /api/sessions` - Neue Session erstellen
- `GET /api/sessions` - Alle Sessions abrufen (mit Filtern)
- `GET /api/sessions/:id` - Einzelne Session abrufen
- `POST /api/sessions/:id/join` - Session beitreten
- `PUT /api/sessions/:id/participant` - Teilnehmerstatus aktualisieren
- `DELETE /api/sessions/:id` - Session löschen

### Nachrichten

- `POST /api/messages` - Nachricht senden
- `GET /api/messages/conversations` - Alle Unterhaltungen abrufen
- `GET /api/messages/conversation/:userId` - Unterhaltung mit Benutzer abrufen
- `GET /api/messages/session/:sessionId` - Session-Nachrichten abrufen
- `PUT /api/messages/read/:userId` - Nachrichten als gelesen markieren

### Benachrichtigungen

- `GET /api/notifications` - Benachrichtigungen abrufen
- `PUT /api/notifications/:id/read` - Benachrichtigung als gelesen markieren
- `PUT /api/notifications/read-all` - Alle als gelesen markieren
- `DELETE /api/notifications/:id` - Benachrichtigung löschen

## Socket.IO Events

### Client → Server

- `user:join` - Benutzer verbindet sich
- `session:join` - Session-Raum beitreten
- `session:leave` - Session-Raum verlassen
- `message:send` - Direktnachricht senden
- `session:message` - Session-Nachricht senden
- `notification:send` - Benachrichtigung senden
- `typing:start` - Tipp-Indikator starten
- `typing:stop` - Tipp-Indikator stoppen
- `status:update` - Status aktualisieren

### Server → Client

- `user:online` - Benutzer ist online
- `user:offline` - Benutzer ist offline
- `message:received` - Neue Direktnachricht
- `session:message:received` - Neue Session-Nachricht
- `notification:received` - Neue Benachrichtigung
- `typing:user` - Benutzer tippt
- `user:status:changed` - Benutzer-Status geändert

## Datenmodelle

### User
- username, email, password
- name, age, kids
- platforms, games, availability
- contacts (Discord, PSN, Xbox, Steam, Switch)
- online, currentActivity
- friends, friendRequests

### GamingSession
- title, game, platform
- host, participants
- scheduledDate, duration
- description, voiceChat, skillLevel
- status (open/full/in-progress/completed/cancelled)

### Message
- sender, recipient, session
- content, type (direct/session/system)
- read, readAt

### Notification
- recipient, sender
- type, title, message
- relatedSession, read, readAt

## Entwicklung

### Projekt-Struktur

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── sessionController.js
│   │   ├── messageController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── GamingSession.js
│   │   ├── Message.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── sessions.js
│   │   ├── messages.js
│   │   └── notifications.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Sicherheit

- Passwörter werden mit bcrypt gehasht
- JWT-Tokens für Authentifizierung
- Geschützte Routes mit Middleware
- Input-Validierung mit express-validator
- CORS konfiguriert

## Support

Bei Fragen oder Problemen erstelle ein Issue im Repository.
