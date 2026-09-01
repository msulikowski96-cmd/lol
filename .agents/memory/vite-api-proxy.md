---
name: Vite API proxy
description: Development preview connectivity between the separate web and API workflows.
---

The web artifact and API artifact run on separate ports during development, so Vite must proxy `/api` requests to the API workflow. Without that proxy, Vite’s SPA fallback returns `index.html` with HTTP 200 and the frontend interprets the response as missing data.

**Why:** The player profile displayed “Za mało danych do analizy” even though the API returned 20 analyzed matches; the browser was receiving the Vite HTML fallback rather than the JSON response.

**How to apply:** Keep the `/api` proxy configured for both Vite dev and preview servers. Production does not need this proxy because the Express production process serves the built frontend and API together.