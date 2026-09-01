---
name: Render versus Replit database
description: Environment-specific constraint when publishing this app through Render versus Replit.
---

Replit-managed PostgreSQL is injected into Replit development and production environments; an external Render service does not receive that `DATABASE_URL` automatically.

**Why:** The old Render deployment failed before starting because its database had been deleted and Render had no replacement `DATABASE_URL`, while the Replit database remained healthy.

**How to apply:** Prefer Replit Publish for this project when using the managed database. If keeping Render, provision a Render PostgreSQL database and configure its `DATABASE_URL` plus the required application secrets in Render; do not assume the Replit database is available there.