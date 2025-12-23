# Dad Gaming Hub - Features Erklärung

## 🎮 Vater-Cards - Verbessert!

### Was wird jetzt angezeigt?

**1. Header mit Online-Status:**
- 🟢 **Online** (grün, pulsierend) oder ⚫ **Offline** (grau)
- Name, Username, Alter, Anzahl Kinder

**2. Aktuelle Aktivität (NEU!):**

Wenn der User **online** ist:
- **Spielt gerade:** Zeigt ein lila/rosa Badge mit dem Spielnamen
  ```
  🎮 SPIELT GERADE
  Call of Duty: Warzone
  ```
- **Verfügbar:** "💬 Online und verfügbar"

Wenn der User **offline** ist:
- "Zuletzt online: [Zeit]"

**3. Lieblingsspiele:**
- Liste aller Spiele, die der User gerne spielt
- Kleine graue Badges

**4. Plattformen:**
- PS4, PS5, Xbox, PC, Switch etc.
- Bunte Badges mit Icons

### Wie setzen User ihr aktuelles Spiel?

User können in ihrem Profil den Status ändern:
1. Gehe zu Profil bearbeiten
2. Feld "Aktuelle Aktivität"
3. Eingeben: z.B. "Call of Duty", "FIFA 25", "Baldur's Gate 3"
4. Andere sehen das sofort auf der Card!

---

## 👥 Freundschaftsanfragen - Wie funktioniert das?

### Aktueller Stand:
- ⚠️ **NOCH NICHT VOLLSTÄNDIG IMPLEMENTIERT**
- Button "Anfrage senden" ist da, aber macht noch nichts Echtes

### Was passiert beim Klick auf "Anfrage senden"?
1. Modal öffnet sich mit User-Details
2. Bestätigung erforderlich
3. **Backend speichert Anfrage** (kommt noch)
4. Empfänger sieht Benachrichtigung
5. Kann akzeptieren oder ablehnen

### Was wird benötigt? (für volle Funktion)

**Datenbank-Tabelle:**
```sql
CREATE TABLE friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  friend_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Backend-Funktionen:**
- `sendFriendRequest()` - Speichert Anfrage
- `acceptFriendRequest()` - Akzeptiert & erstellt Freundschaft
- `declineFriendRequest()` - Lehnt ab
- `getFriends()` - Liste aller Freunde
- `getFriendRequests()` - Offene Anfragen

**Momentane Lösung:**
Aktuell können sich User direkt über Chat/Discord kontaktieren!

---

## 💬 Chat - Wie funktioniert das?

### Technologie:
- **Socket.IO** für Echtzeit-Kommunikation
- Messages werden in `messages` Tabelle gespeichert

### Ablauf:
1. User A klickt auf Chat
2. Wählt User B aus der Liste
3. Schreibt Nachricht
4. **Socket.IO** sendet Nachricht in Echtzeit
5. User B sieht Nachricht sofort (wenn online)
6. Nachricht wird in Datenbank gespeichert

### Nachrichtentypen:
- **Direktnachrichten:** 1-zu-1 Chat zwischen zwei Usern
- **Session-Chat:** Gruppenchat für Gaming Sessions

### Features:
- ✅ Echtzeit-Nachrichten
- ✅ Gelesen/Ungelesen Status
- ✅ Nachrichtenverlauf wird gespeichert
- ✅ "User schreibt..." Indikator (über Socket.IO)

### Wie User benachrichtigt werden:
- Sound-Benachrichtigung (optional)
- Browser-Benachrichtigung (wenn erlaubt)
- Badge mit Anzahl ungelesener Nachrichten

---

## 🎙️ Discord Integration - Optionen

### Option A: Einfacher Link (EMPFOHLEN FÜR HEUTE)

**Was wird gemacht:**
1. User gibt Discord-Username im Profil an
2. Button "Discord Server beitreten" auf der Seite
3. Link führt zu deinem Discord-Server
4. User tritt manuell bei

**Vorteile:**
- ✅ Schnell implementiert (5 Minuten)
- ✅ Keine komplexe OAuth
- ✅ Funktioniert sofort

**Code:**
```jsx
<a
  href="https://discord.gg/DEIN-INVITE-LINK"
  target="_blank"
  className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
>
  🎙️ Discord Server beitreten
</a>
```

### Option B: Volle Integration (KOMPLEX)

**Was wird gemacht:**
1. Discord OAuth Login
2. Bot fügt User automatisch zum Server hinzu
3. Rollen-Synchronisation (z.B. "Vater", "Admin")
4. Status-Sync (Was spielt User gerade)

**Vorteile:**
- ✅ Automatisches Hinzufügen
- ✅ Rollen werden automatisch vergeben
- ✅ Status-Synchronisation

**Nachteile:**
- ❌ Discord Bot erforderlich
- ❌ OAuth App erstellen
- ❌ Komplexe Implementierung (2-3 Stunden)
- ❌ Server-Rechte erforderlich

**Benötigt:**
- Discord Developer Application
- Bot Token
- OAuth2 Client ID + Secret
- Server Admin-Rechte

---

## 🚀 Empfehlung für heute

### Priorität 1: MUSS funktionieren
1. ✅ Vater-Cards zeigen "Spielt gerade" - **ERLEDIGT**
2. ✅ Registrierung mit Email-Bestätigung - **ERLEDIGT**
3. ✅ Socket.IO CORS-Fix für Production - **ERLEDIGT**
4. ⏳ Production Build auf Server hochladen - **IN ARBEIT**

### Priorität 2: Sollte funktionieren
1. Chat testen (sollte schon funktionieren)
2. Discord Link hinzufügen (5 Minuten)
3. "Was spielst du gerade?" Feature testen

### Priorität 3: Später
1. Freundschaftssystem komplett implementieren
2. Volle Discord Integration
3. Benachrichtigungs-Center
4. Gaming Session Reminder

---

## 📝 Schnell-Anleitung: Features nutzen

### Als User "Was spiele ich gerade" setzen:
1. Einloggen
2. Navigation → Profil bearbeiten
3. Feld "Aktuelle Aktivität" ausfüllen
4. Speichern
5. ✅ Alle sehen jetzt auf deiner Card was du spielst!

### Discord Server Link hinzufügen:
1. Discord Server → Einladungslink erstellen
2. Link kopieren (z.B. `https://discord.gg/abc123`)
3. Im Code einfügen (Navigation oder Dashboard)
4. User können beitreten

### Chat nutzen:
1. Auf Chat-Icon klicken
2. User aus Liste wählen
3. Nachricht schreiben
4. ✅ Nachricht wird in Echtzeit gesendet!

---

## ❓ FAQ

**Q: Warum bekomme ich keine Bestätigungs-Email?**
A: Prüfe in Supabase → Authentication → Email Templates. SMTP muss konfiguriert sein.

**Q: Warum funktioniert Socket.IO nicht in Production?**
A: Die `.env.production` Datei muss die richtige URL haben:
```
VITE_API_URL=https://dad-games.henke-net.com/api
```

**Q: Wie ändere ich mein "Spielt gerade"?**
A: Profil bearbeiten → Aktuelle Aktivität → Speichern

**Q: Kann ich mehrere Spiele gleichzeitig als "Spielt gerade" anzeigen?**
A: Nein, nur ein Spiel zur Zeit. Die Lieblingsspiele-Liste zeigt alle Spiele.

---

## 🔧 Technische Details

### Datenbank-Schema (profiles Tabelle):
```sql
- online (boolean) - Ist User online?
- current_activity (text) - Was macht User gerade? z.B. "Call of Duty"
- last_seen (timestamp) - Wann war User zuletzt online?
- games (text[]) - Array aller Lieblingsspiele
- platforms (text[]) - Array aller Plattformen
- contacts (jsonb) - Discord, PSN, Xbox etc.
```

### Socket.IO Events:
```javascript
// User geht online
socket.emit('user:join', userId);

// User sendet Nachricht
socket.emit('message:send', { recipientId, message });

// User schreibt...
socket.emit('typing:start', { recipientId, userId });

// Status-Update
socket.emit('status:update', { userId, online, currentActivity });
```

---

**Erstellt am:** 22. Dezember 2024
**Für:** Dad Gaming Hub
**Status:** In Entwicklung 🚀
