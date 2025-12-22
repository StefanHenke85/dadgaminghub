# Admin-System Setup

## 🔐 Admin-Funktionen einrichten

### 1. Admin-Extension in Supabase ausführen

1. Öffne dein Supabase Projekt: https://supabase.com/dashboard/project/lzcroaqsmslgbcojsmwj
2. Gehe zu **SQL Editor**
3. Erstelle eine neue Query
4. Kopiere den kompletten Inhalt aus `supabase-admin-extension.sql`
5. Füge ihn ein und klicke **Run**

Das Script erstellt:
- `role` Spalte in profiles (user/admin/moderator)
- `is_banned` und Ban-Felder
- `admin_logs` Tabelle für Audit-Logs
- Funktionen zum Bannen/Entbannen
- RLS Policies für Admin-Zugriff

### 2. Dich selbst zum Admin machen

**Option A: Via SQL (empfohlen)**

1. Im SQL Editor, führe aus:
```sql
SELECT make_user_admin('deine@email.com');
```

Ersetze `deine@email.com` mit der E-Mail, die du bei der Registrierung verwendet hast.

**Option B: Direkt in der Datenbank**

1. Gehe zu **Table Editor** → **profiles**
2. Finde deine Zeile (anhand username oder name)
3. Editiere die `role` Spalte von `user` zu `admin`
4. Klicke **Save**

### 3. Admin-Status prüfen

Führe im SQL Editor aus:
```sql
SELECT id, username, name, email, role
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE role IN ('admin', 'moderator');
```

Du solltest dich in der Liste sehen mit `role = 'admin'`.

## 🎮 Admin-Features nutzen

### Backend-API Endpunkte

Alle Endpunkte unter `/api/admin/*` erfordern:
- Authentifizierung (JWT Token)
- Admin oder Moderator Rolle

#### Statistiken abrufen
```
GET /api/admin/stats
```
Gibt zurück: Gesamt-User, Gebannte, Online, Neue heute, etc.

#### Alle Benutzer anzeigen
```
GET /api/admin/users?page=1&limit=20&search=name&role=user&banned=false
```

#### User bannen
```
POST /api/admin/users/:userId/ban
Body: { "reason": "Verstoß gegen Regeln" }
```

#### User entbannen
```
POST /api/admin/users/:userId/unban
```

#### User löschen (nur Admin, nicht Moderator)
```
DELETE /api/admin/users/:userId
```

#### User-Rolle ändern
```
PUT /api/admin/users/:userId/role
Body: { "role": "moderator" }
```
Rollen: `user`, `moderator`, `admin`

#### Admin-Logs anzeigen
```
GET /api/admin/logs?page=1&limit=50&action=ban_user
```

### Rollen-Unterschiede

**User** (Standard)
- Kann sich registrieren, Profile ansehen, Freunde hinzufügen

**Moderator**
- Alles von User
- Kann User bannen/entbannen
- Kann alle User-Profile sehen
- Kann Admin-Logs sehen

**Admin** (Super-Admin)
- Alles von Moderator
- Kann User löschen
- Kann User-Rollen ändern
- Kann andere zu Moderator/Admin machen

## 🛡️ Sicherheits-Features

### Ban-System
- Gebannte User können sich nicht einloggen
- Ban-Grund wird gespeichert
- Wer gebannt hat wird protokolliert
- Ban-Zeitpunkt wird gespeichert

### Admin-Logs
Jede Admin-Aktion wird geloggt:
- Wer hat die Aktion ausgeführt?
- Was wurde gemacht?
- Bei wem (target user)?
- Wann?
- Details (z.B. Ban-Grund)

### Schutz-Mechanismen
- Admins können nicht gebannt werden
- Admins können nicht gelöscht werden (außer von sich selbst)
- Alle Admin-Actions werden geloggt
- Row Level Security in Supabase

## 🧪 Testen

1. **Melde dich mit deinem Admin-Account an**

2. **Test über API (Postman/Thunder Client/curl):**

```bash
# 1. Login als Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"deine@email.com","password":"deinpasswort"}'

# Kopiere den Token aus der Response

# 2. Stats abrufen
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer DEIN_TOKEN"

# 3. Alle User anzeigen
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer DEIN_TOKEN"
```

3. **Im Frontend** (nach dem wir das Admin-Dashboard erstellt haben):
   - Gehe zu `/admin`
   - Du solltest das Admin-Dashboard sehen
   - Nur Admins/Moderatoren haben Zugriff

## 📋 Nächste Schritte

Nach dem Backend-Setup:
1. Admin-Dashboard im Frontend erstellen
2. User-Verwaltungs-Interface
3. Ban/Unban Buttons
4. Admin-Logs Viewer
5. Statistik-Dashboard

## ⚠️ Wichtig

- **Halte deinen Admin-Account sicher!**
- Verwende ein starkes Passwort
- Erstelle keine unnötigen Admin-Accounts
- Überprüfe regelmäßig die Admin-Logs
- Ban-Gründe sollten klar und nachvollziehbar sein
