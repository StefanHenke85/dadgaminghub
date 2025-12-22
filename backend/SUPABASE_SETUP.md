# Supabase Setup für Dad-Gaming Hub

## 1. Supabase Projekt erstellen

1. Gehe zu [https://supabase.com](https://supabase.com)
2. Erstelle einen kostenlosen Account
3. Klicke auf "New Project"
4. Wähle einen Namen: `dad-gaming-hub`
5. Erstelle ein starkes Datenbank-Passwort
6. Wähle eine Region (z.B. Frankfurt für Europa)
7. Warte bis das Projekt erstellt ist (ca. 2 Minuten)

## 2. Datenbank-Schema einrichten

1. Öffne dein Projekt in Supabase
2. Gehe zu **SQL Editor** (im linken Menü)
3. Erstelle eine "New query"
4. Kopiere den gesamten Inhalt aus `supabase-schema.sql`
5. Füge ihn in den SQL Editor ein
6. Klicke auf "Run" (oder drücke Ctrl+Enter)
7. Warte bis alle Tabellen erstellt sind

## 3. API Keys holen

1. Gehe zu **Project Settings** (Zahnrad-Icon unten links)
2. Klicke auf **API**
3. Dort findest du:
   - **Project URL**: z.B. `https://abcdefgh.supabase.co`
   - **anon public**: Der öffentliche Key (für Frontend)
   - **service_role**: Der Service Key (nur für Backend!)

⚠️ **WICHTIG**: Der `service_role` Key darf NIEMALS im Frontend verwendet werden!

## 4. Environment Variables konfigurieren

### Backend (.env)

Erstelle eine `.env` Datei im `backend/` Ordner:

```env
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://dein-projekt-id.supabase.co
SUPABASE_SERVICE_KEY=dein_service_role_key_hier
SUPABASE_ANON_KEY=dein_anon_public_key_hier

# Optional
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)

Im `dad-gaming-hub/` Frontend-Ordner:

```env
VITE_SUPABASE_URL=https://dein-projekt-id.supabase.co
VITE_SUPABASE_ANON_KEY=dein_anon_public_key_hier
```

## 5. Email Authentication aktivieren

1. Gehe zu **Authentication** → **Providers**
2. Stelle sicher, dass **Email** aktiviert ist
3. Optional: Konfiguriere Email Templates unter **Email Templates**

## 6. Testen

### Tabellen prüfen

1. Gehe zu **Table Editor**
2. Du solltest folgende Tabellen sehen:
   - `profiles`
   - `friendships`
   - `gaming_sessions`
   - `session_participants`
   - `messages`
   - `notifications`

### Testdaten erstellen

Du kannst Testdaten direkt im Table Editor hinzufügen oder über die API nach dem ersten Registrieren.

## 7. Row Level Security (RLS) prüfen

1. Gehe zu **Authentication** → **Policies**
2. Stelle sicher, dass für jede Tabelle Policies vorhanden sind
3. Die wichtigsten Policies:
   - Profiles: Jeder kann lesen, nur eigenes Profil bearbeiten
   - Messages: Nur Sender/Empfänger können lesen
   - Sessions: Öffentliche Sessions für alle, private nur für Teilnehmer

## 8. Realtime aktivieren (optional)

Für Live-Updates (Chat, Online-Status):

1. Gehe zu **Database** → **Replication**
2. Aktiviere Realtime für Tabellen:
   - `messages`
   - `notifications`
   - `profiles` (für Online-Status)

## Troubleshooting

### "relation does not exist"
- Das SQL-Schema wurde nicht korrekt ausgeführt
- Gehe zum SQL Editor und führe `supabase-schema.sql` erneut aus

### "JWT expired" oder Auth-Fehler
- Überprüfe ob die Keys korrekt in `.env` eingetragen sind
- Stelle sicher, dass du den richtigen Key verwendest (service_role für Backend, anon für Frontend)

### RLS verhindert Zugriff
- Prüfe die Policies im Supabase Dashboard
- Stelle sicher, dass der Benutzer authentifiziert ist

## Nächste Schritte

Nach dem Setup:
1. Starte das Backend: `npm run dev`
2. Starte das Frontend: `npm run dev`
3. Registriere einen neuen Benutzer
4. Teste die Features

## Nützliche Links

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
