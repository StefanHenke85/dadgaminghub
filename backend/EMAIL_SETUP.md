# E-Mail-Bestätigung und Passwort-Reset Setup

## E-Mail-Bestätigung aktivieren

### 1. Supabase E-Mail-Settings konfigurieren

1. Gehe zu: https://supabase.com/dashboard/project/lzcroaqsmslgbcojsmwj
2. Klicke auf **Authentication** → **Email Templates**
3. Hier kannst du die E-Mail-Templates anpassen:
   - **Confirm signup** - Bestätigungs-E-Mail bei Registrierung
   - **Reset password** - Passwort-Zurücksetzen-E-Mail
   - **Magic Link** - Login via E-Mail-Link

### 2. E-Mail-Provider konfigurieren (Optional)

Standardmäßig verwendet Supabase einen eingebauten E-Mail-Service, der für Entwicklung ausreicht.

Für Produktion solltest du einen eigenen E-Mail-Provider einrichten:

1. Gehe zu **Settings** → **Auth** → **SMTP Settings**
2. Konfiguriere deinen SMTP-Server (z.B. SendGrid, Mailgun, AWS SES)

Beispiel für SendGrid:
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
Username: apikey
Password: <dein-sendgrid-api-key>
```

### 3. E-Mail-Bestätigung aktivieren/deaktivieren

1. Gehe zu **Authentication** → **Settings**
2. Unter **Email Auth** findest du:
   - **Enable email confirmations** - Aktiviere diese Option
   - **Enable email change confirmations** - Für E-Mail-Änderungen

**Für Entwicklung:**
- E-Mail-Bestätigung **deaktiviert** lassen (schnellere Tests)
- User können sich direkt einloggen ohne E-Mail zu bestätigen

**Für Produktion:**
- E-Mail-Bestätigung **aktivieren**
- Verhindert Spam-Registrierungen
- Stellt sicher, dass E-Mails gültig sind

### 4. Redirect URLs konfigurieren

1. Gehe zu **Authentication** → **URL Configuration**
2. Füge deine Redirect URLs hinzu:

**Entwicklung:**
```
http://localhost:5173/reset-password
```

**Produktion:**
```
https://deine-domain.com/reset-password
```

## Frontend ist bereits konfiguriert

Das Frontend hat bereits:
- ✅ Passwort-Vergessen Seite (`/forgot-password`)
- ✅ Passwort-Zurücksetzen Seite (`/reset-password`)
- ✅ E-Mail-Bestätigungs-Flow (automatisch durch Supabase)

## E-Mail-Templates anpassen

### Confirm Signup Email

Gehe zu **Authentication** → **Email Templates** → **Confirm signup**

Beispiel-Template:
```html
<h2>Willkommen bei Dad-Gaming Hub!</h2>
<p>Hallo {{ .Data.Name }},</p>
<p>vielen Dank für deine Registrierung bei Dad-Gaming Hub, der Gaming-Community für Väter!</p>
<p>Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst:</p>
<p><a href="{{ .ConfirmationURL }}">E-Mail bestätigen</a></p>
<p>Oder kopiere diesen Link in deinen Browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Viel Spaß beim Zocken! 🎮</p>
```

### Reset Password Email

Gehe zu **Authentication** → **Email Templates** → **Reset password**

Beispiel-Template:
```html
<h2>Passwort zurücksetzen</h2>
<p>Hallo,</p>
<p>Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.</p>
<p>Klicke auf den folgenden Link, um ein neues Passwort zu setzen:</p>
<p><a href="{{ .ConfirmationURL }}">Passwort zurücksetzen</a></p>
<p>Oder kopiere diesen Link in deinen Browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Wenn du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail einfach.</p>
<p>Viele Grüße<br>Das Dad-Gaming Hub Team</p>
```

## Testing

### E-Mail-Bestätigung testen

1. Aktiviere E-Mail-Bestätigung in Supabase
2. Registriere einen neuen Test-User
3. Überprüfe dein E-Mail-Postfach (auch Spam-Ordner!)
4. Klicke auf den Bestätigungs-Link
5. User sollte jetzt bestätigt sein

### Passwort-Reset testen

1. Gehe zu `/forgot-password`
2. Gib deine E-Mail-Adresse ein
3. Überprüfe dein E-Mail-Postfach
4. Klicke auf den Reset-Link
5. Setze ein neues Passwort
6. Login mit dem neuen Passwort

## E-Mail-Logs überprüfen

1. Gehe zu **Authentication** → **Logs**
2. Hier siehst du alle gesendeten E-Mails und deren Status
3. Fehlerhafte E-Mails werden hier angezeigt

## Troubleshooting

### E-Mails kommen nicht an

1. **Spam-Ordner prüfen** - Supabase-E-Mails landen oft im Spam
2. **SMTP Settings prüfen** - Sind die Zugangsdaten korrekt?
3. **Rate Limits prüfen** - Supabase hat Rate Limits für E-Mails
4. **E-Mail-Logs prüfen** - Gibt es Fehler in den Logs?

### Confirmation Link funktioniert nicht

1. **Redirect URL prüfen** - Ist die URL korrekt konfiguriert?
2. **Link abgelaufen** - Links sind nur 24h gültig
3. **Neue E-Mail anfordern** - User kann neue Bestätigungs-E-Mail anfordern

### User kann sich nicht einloggen

1. **E-Mail bestätigt?** - Wenn E-Mail-Bestätigung aktiviert ist
2. **Passwort korrekt?** - Passwort zurücksetzen falls vergessen
3. **Account gebannt?** - Admin prüft Ban-Status

## Best Practices

1. **Für Entwicklung:**
   - E-Mail-Bestätigung deaktiviert
   - Schnellere Tests
   - Weniger E-Mail-Traffic

2. **Für Produktion:**
   - E-Mail-Bestätigung aktiviert
   - Eigener SMTP-Provider (SendGrid, Mailgun)
   - Custom Domain für E-Mails
   - E-Mail-Templates anpassen
   - Rate Limits überwachen

3. **Sicherheit:**
   - Reset-Links sind nur 24h gültig
   - Links können nur einmal verwendet werden
   - E-Mail-Änderungen benötigen Bestätigung
   - Passwörter werden niemals per E-Mail gesendet
