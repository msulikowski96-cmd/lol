# Wdrożenie Nexus Sight na Render

## Wymagania

- Konto na [Render](https://render.com)
- Kod źródłowy w repozytorium Git (GitHub, GitLab lub Bitbucket)
- Klucz API Riot Games ([developer.riotgames.com](https://developer.riotgames.com))
- Node.js 20+ (Render zapewnia automatycznie)

---

## Krok 1: Przygotowanie repozytorium

1. Utwórz nowe repozytorium na GitHub (lub GitLab/Bitbucket).
2. Skopiuj kod projektu do repozytorium.
3. Upewnij się, że plik `pnpm-lock.yaml` jest commitowany.

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TWOJ_USER/nexus-sight.git
git push -u origin main
```

---

## Krok 2: Tworzenie Web Service na Render

1. Zaloguj się na [dashboard.render.com](https://dashboard.render.com).
2. Kliknij **New** → **Web Service**.
3. Połącz swoje repozytorium z GitHub.
4. Wypełnij formularz:

| Pole | Wartość |
|------|---------|
| **Name** | `nexus-sight` |
| **Region** | Frankfurt (EU Central) lub najbliższy do Ciebie |
| **Branch** | `master` |
| **Runtime** | `Node` |
| **Build Command** | `npm install --include=dev && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free (lub Starter za $7/mies. bez cold starts) |

Tabele w bazie (`users`, `usage` itd.) serwer tworzy sam przy starcie — osobny krok `db push` nie jest potrzebny. Plik `.npmrc` (`legacy-peer-deps=true`) jest wymagany, bez niego `npm install` kończy się błędem `ERESOLVE`.

---

## Krok 3: Zmienne środowiskowe

W ustawieniach Web Service kliknij **Environment** i dodaj:

| Zmienna | Wartość | Opis |
|---------|---------|------|
| `DATABASE_URL` | `postgresql://...` | **Internal Database URL** bazy Render (adres z `dpg-…`). Zewnętrzny URL też działa (SSL włącza się sam). Bez tej zmiennej konta trafiają do pliku tymczasowego i **znikają po restarcie**. |
| `SESSION_SECRET` | losowy ciąg, min. 16 znaków | **Wymagany.** Bez niego po każdym restarcie wszyscy są wylogowani. |
| `RIOT_API_KEY` | `RGAPI-…` | Klucz API z Riot Developer Portal |
| `NVIDIA_API_KEY` | klucz NVIDIA | Analiza AI, trener na żywo, optymalizator |
| `NVIDIA_MODEL` | `nvidia/nemotron-3-ultra-550b-a55b` | Opcjonalnie. Jeśli masz ustawione `NVIDIA_AI_MODEL=qwen/...` — usuń je, ten model został wycofany |
| `ADMIN_PASSWORD` | min. 12 znaków | Opcjonalnie. Ustawia hasło admina (pierwszy adres z `ADMIN_EMAILS`). Admin może też logować się przez Google. |
| `ADMIN_EMAILS` | `a@b.pl,c@d.pl` | Opcjonalnie. Adresy z prawami admina przy logowaniu przez Google (domyślnie msulikowski96@gmail.com, sulikowskim96@gmail.com). |
| `OVERLAY_TOKEN` | losowy ciąg, min. 24 znaki | Opcjonalnie, tylko dla nakładki desktopowej. |
| `NODE_ENV` | `production` | Ustawiany też przez `npm start` |

`PORT` ustawia Render — serwer go odczytuje (lokalnie domyślnie 3000).

Stan serwera i bazy: `https://twoja-domena/api/status` — pole `db.ready` mówi, czy baza jest połączona.

---

## Krok 4: Deploy

1. Kliknij **Create Web Service**.
2. Render zainstaluje zależności i zbuduje frontend oraz serwer. Przy starcie serwer połączy się z bazą i utworzy brakujące tabele.
3. Po zakończeniu buildu, aplikacja będzie dostępna pod adresem:
   `https://nexus-sight.onrender.com`

---

## Jak to działa

Projekt działa jako **jeden serwis**:

- API serwer Express obsługuje endpointy `/api/*` (proxy do Riot Games API)
- W trybie produkcyjnym ten sam serwer serwuje zbudowany frontend (pliki statyczne z Vite build)
- Frontend wysyła zapytania do `/api/*` — na tym samym serwerze, bez problemów z CORS

```
Przeglądarka  →  Render Web Service
                  ├── /api/*  →  Express API  →  Riot Games API
                  └── /*      →  pliki statyczne (React SPA)
```

---

## Aktualizacja

Każdy `git push` na branch `master` automatycznie uruchamia nowy build na Render.

---

## Rozwiązywanie problemów

### "Nie znaleziono gracza"
- Sprawdź czy `RIOT_API_KEY` jest ustawiony poprawnie w zmiennych środowiskowych
- Klucze developerskie Riot wygasają co 24h — wygeneruj nowy na [developer.riotgames.com](https://developer.riotgames.com)
- Do produkcji złóż wniosek o klucz produkcyjny (Personal/Production API Key)

### Aplikacja się nie ładuje
- Sprawdź logi na Render (zakładka **Logs**)
- Otwórz `/api/status`: `db.ready: false` oznacza problem z `DATABASE_URL` (szczegóły w polu `db.error` i w logach `[db]`)
- Sprawdź czy build przeszedł bez błędów

### Logowanie
- Konta z czasów przed poprawką bezpieczeństwa, które miały domyślne hasło admina, mają je unieważnione — zaloguj się przez Google albo ustaw `ADMIN_PASSWORD`.
- Logowanie przez Google wymaga dodania domeny strony w Firebase Console → Authentication → Settings → **Authorized domains**.

### Cold starts (plan Free)
- Na darmowym planie Render usypia serwis po 15 min nieaktywności
- Pierwsze zapytanie po uśpieniu trwa ~30 sekund
- Rozwiązanie: użyj planu Starter ($7/mies.) lub skonfiguruj health check ping

---

## Struktura plików (produkcja)

```
artifacts/
├── api-server/
│   └── dist/
│       └── index.mjs          ← serwer Node.js
└── web/
    └── dist/
        └── public/
            ├── index.html     ← frontend SPA
            ├── assets/        ← JS/CSS bundle
            ├── images/        ← hero-bg.png
            └── favicon.svg
```
