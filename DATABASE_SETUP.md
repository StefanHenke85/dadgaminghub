# 🗄️ Datenbank Setup - Dad Gaming Hub

## Schnellstart

**Du brauchst nur EINE SQL-Datei auszuführen: `MASTER_SETUP.sql`**

### Schritt 1: Basis-Tabellen erstellen
Falls noch nicht geschehen, führe zuerst das Haupt-Schema aus:
```sql
-- Datei: backend/supabase-schema.sql
-- Diese Datei erstellt alle Basis-Tabellen (profiles, gaming_sessions, etc.)
```

### Schritt 2: Master Setup ausführen
```sql
-- Datei: MASTER_SETUP.sql
-- Diese Datei fügt alle Features hinzu:
-- ✅ Online-Status Tracking (last_seen)
-- ✅ Discord Integration
-- ✅ Gaming-Statistiken (Vorbereitung)
```

### Schritt 3: Überprüfung
Nach dem Ausführen solltest du diese Ausgabe sehen:
```
✅ MASTER SETUP ERFOLGREICH!
total_users: X
online_users: Y

✅ Discord Integration - enabled: true
✅ Online Status Tracking - enabled: true
✅ Gaming Statistics - enabled: true
```

## 📊 Was wird hinzugefügt?

### 1. Online-Status Tracking
```sql
profiles.last_seen TIMESTAMP WITH TIME ZONE
```
- Wird bei jedem API-Request automatisch aktualisiert
- User gelten als "online" wenn `last_seen < 5 Minuten`
- Performance-Index für schnelle Abfragen

### 2. Discord Integration
```sql
profiles.discord_webhook_url TEXT
gaming_sessions.discord_webhook_url TEXT
```
- Speichere Webhook URL im Profil (einmalig)
- Automatische Benachrichtigungen bei neuen Sessions
- Optional: Pro-Session Webhook URL

### 3. Gaming-Statistiken (Vorbereitung für zukünftige Features)
```sql
profiles.total_sessions INTEGER
profiles.total_playtime INTEGER
profiles.favorite_game TEXT
profiles.stats_updated_at TIMESTAMP
```
- Automatisches Tracking via Trigger
- Grundlage für Achievements & Leaderboards
- Wird bei Session-Erstellung aktualisiert

## 🔧 Troubleshooting

### Alle User zeigen "online"
➡️ Führe `MASTER_SETUP.sql` aus - fügt `last_seen` Spalte hinzu

### Discord-Benachrichtigungen funktionieren nicht
➡️ Überprüfe ob `discord_webhook_url` Spalte existiert:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'discord_webhook_url';
```

### Statistiken werden nicht aktualisiert
➡️ Überprüfe ob Trigger existiert:
```sql
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'gaming_sessions';
```

## 📁 SQL-Dateien Übersicht

### Aktiv (Verwenden)
- `backend/supabase-schema.sql` - Haupt-Schema (einmalig ausführen)
- `MASTER_SETUP.sql` - Alle Features & Updates (jederzeit ausführbar)

### Archiv (Historisch)
Die alten SQL-Dateien wurden nach `archive/old-sql-files/` verschoben:
- `ADD_DISCORD_WEBHOOK_TO_PROFILES.sql` → Jetzt in MASTER_SETUP.sql
- `ADD_LAST_SEEN_COLUMN.sql` → Jetzt in MASTER_SETUP.sql
- Weitere alte Migrations-Dateien

## 🎯 Nächste Schritte

Nach dem Setup:

1. ✅ Teste den Online-Status im Dashboard
2. ✅ Konfiguriere Discord Webhook in deinem Profil
3. ✅ Erstelle eine Test-Session mit Discord-Benachrichtigung
4. ✅ Statistiken werden automatisch getrackt (sichtbar in zukünftigen Features)

## 💡 Gaming-Statistiken Features (Roadmap)

Die Statistik-Spalten sind bereits vorbereitet für:

### Phase 1: Basis-Stats (In Entwicklung)
- Session-Anzahl pro User
- Top-Spiele Ranking
- Aktivste Spieler

### Phase 2: Erweiterte Statistiken
- Spielzeit-Tracking
- Plattform-Verteilung
- Session-Erfolgsrate (vollständig vs. abgebrochen)

### Phase 3: Achievements & Badges
- "First Session" Badge
- "10 Sessions Veteran" Achievement
- "Squad Leader" (5+ gehostete Sessions)
- "Night Owl" (Sessions nach 22 Uhr)
- "Dad of the Month" (aktivster User)

### Phase 4: Leaderboards
- Top Hosts (meiste Sessions organisiert)
- Top Players (meiste Teilnahmen)
- Game Champions (pro Spiel/Plattform)

**Implementierung:** Die Basis-Infrastruktur läuft bereits automatisch im Hintergrund. Die UI-Features werden schrittweise hinzugefügt.
