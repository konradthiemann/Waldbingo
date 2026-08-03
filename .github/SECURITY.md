# Sicherheitsrichtlinie

## Sicherheitslücken melden

Bitte melde Sicherheitslücken **nicht** über öffentliche GitHub-Issues, Diskussionen
oder Pull Requests.

Nutze stattdessen **GitHub Private Vulnerability Reporting**:

1. Öffne den Tab **[Security](https://github.com/konradthiemann/Waldbingo/security)**
   dieses Repositories.
2. Klicke auf **„Report a vulnerability"** und beschreibe das Problem (betroffene
   Datei/Funktion, Reproduktionsschritte, mögliche Auswirkung).

Der Report ist privat sichtbar und wird vertraulich bearbeitet. Eine erste Rückmeldung
erfolgt in der Regel innerhalb weniger Tage.

## Unterstützte Versionen

Es wird jeweils nur der aktuelle Stand des `main`-Branches gepflegt. Fixes werden
direkt in `main` eingespielt.

## Umgang mit Secrets

- Dieses Repository enthält **keine** produktiven Secrets. Der Einladungs-Server
  (`waldbingo-app/server/index.js`) liest ausschließlich die nicht-sensiblen
  Umgebungsvariablen `PORT` und `DATA_DIR`.
- Lokale Konfiguration gehört in eine **nicht versionierte** `.env`-Datei
  (per `.gitignore` ausgeschlossen). Niemals API-Keys, Tokens oder Datenbank-URLs
  mit Zugangsdaten committen.
- Sollte doch einmal ein Secret in einen Commit gelangen: das Secret **zuerst
  rotieren** (der eigentliche Fix) und danach ggf. die History bereinigen. Ein bereits
  rotiertes Secret in der History ist wirkungslos.
