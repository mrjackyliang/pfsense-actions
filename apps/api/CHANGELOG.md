# pfsense-actions-app-api

## 2.0.0 - 2026-11-01

### UPDATED
- Deprecated the `PFSENSE_*` connection variables in favor of the console. When they're set, pfSense Actions still imports them the first time it starts without a saved connection or database, and logs a warning at every start until they're removed.
- Made the Compose file start without secrets or an environment file, moved the default port from 9898 to 22603, turned on IPv6 for its network, and fixed the data directory at `/data` inside the image so a plain `docker run` keeps its database and generated key on the volume.
- Moved the API under `/api/v1` with JSON responses and a shared `{ error: { code, message, issues } }` envelope, and kept `GET /`, `POST /ping`, and `POST /wol` working for existing scripts.
- Limited `count` on `POST /ping` to 1 to 10 attempts. Larger values return `400`.
- Moved the image from Alpine to Debian slim.
- Updated zod to 4.6.7, which fixes a memory exhaustion issue when validating oversized lists in a request.

### FIXED
- Fixed pfSense action routes to distinguish successful commands, adapter failures, and unreachable ping targets with stable HTTP statuses.

### ADDED
- Added encrypted TOTP enrollment and discoverable passkey registration, passwordless passkey sign-in, replay protection, account security controls, and deployment documentation for the administrative console.
- Added an operations console at `/admin`, built with React and Vite in the design shared with transmission-vpn, with System, Light, and Dark appearance modes, token management, a redacted activity log, tested pfSense SSH connection setup, inline field errors, and layouts that work on phones.
- Added a first-run setup screen that creates the administrator account with a one-time code printed in the container log, so no administrator password, encryption key, or pfSense connection has to be configured before the first start.
- Added notifications. The Notifications page sends alerts for the events you choose to ntfy, Reverse Proxy for ntfy, Telegram, Discord, Slack, Gotify, Pushover, Matrix, email, Apprise, or a webhook, and each destination has a Send test button. While a destination wants to hear about it, pfSense Actions checks pfSense every five minutes and reports when it can't be reached and when it's back. It can also report locked sign-ins, secrets removed with a lost key, failed actions, and Wake-on-LAN packets. Secret fields are sealed with the encryption key and never shown again.
- Added an authenticated read-only system information route that returns only the validated operating system, release, and architecture fields.
- Added ten single-use recovery codes when the authenticator app is turned on, accepted in place of an authenticator code at sign-in and replaceable from the console.
- Added a pinned, multi-architecture s6-overlay runtime that owns PID 1 and supervises the non-root pfSense Actions service.
- Added personal access tokens with per-route scopes, stored only as SHA-256 hashes, with a friendly name and optional expiry that you can change later in the console.
- Derived the console's address from each request, trusting forwarded headers only from private and loopback proxies, and tied each passkey to the hostname it was added on, so no public URL needs to be configured.
- Generated the encryption key on the first start into `keys/installation.key` in the data directory. When the key is missing on an existing database, pfSense Actions makes a new one and removes only the pfSense credential and the authenticator app the old key sealed, listing them in the log and the console so they can be entered again. A key file from another database stops startup with a clear message.
- A strength meter sits under every field that sets a password. It rates the password from Weak to Strong and points out common words, runs such as 1234, repeated characters, years, and the username. Any password of 12 or more characters is still accepted.
- Kept console sessions, sign-in challenges, and passkey ceremonies in the database, so a session lasts 24 hours and survives restarts, and required the session's CSRF token in a header on every change.
- Added a local administrator account for the console, separate from client tokens, with all controller state in an encrypted SQLite database on the data volume. Administrator passwords are hashed with Argon2id, sign-in is limited to 10 failed attempts per address every 15 minutes, and the console asks for the password before authenticator and passkey changes.
- Added validated runtime identity and time zone initialization for the protected data volume.

### REMOVED
- Removed the filter-reload and Dynamic DNS refresh routes to keep the public API focused on connectivity, reachability, and Wake-on-LAN.
- Removed the `API_KEY` variable. Each client signs in with its own personal access token from the console instead.
