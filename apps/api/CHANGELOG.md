# pfsense-actions-app-api

## 2.2.1 - 2026-11-21

### UPDATED
- Web console and mock API code, which now follows the full lint rule set and reads the Discord webhook placeholder from a chat platform helper, with no change in behavior.
- Tests now report coverage through a `check:coverage` script, which fails when line, function, branch or statement coverage drops below the project minimum, and the README badges now include that coverage.
- Notification delivery code, which now uses one adapter per service with no change to saved destinations or the requests they send.
- Nova 0.49.0, which supplies the coverage thresholds behind `check:coverage` through its `VitestCoverage` toolkit and brings updated ESLint presets and stricter type checks to the workspace's tooling.
- README badges, which now include Docker Hub pulls and image size.
- README introduction, which now describes the project with its new long description.

## 2.2.0 - 2026-11-17

### UPDATED
- App state lives at /config, with the installation key in keys/ and the database in database/, all owned by PUID and PGID; an existing /data install moves over on its first start, and the container uses the shared health check, shutdown timing and plain log lines of the other Docker apps.

## 2.1.0 - 2026-11-17

### UPDATED
- Revoke and Remove buttons for API tokens, notification services, and passkeys show a trash icon.
- The new notification dialog starts on "— Select one —", so a service is chosen on purpose, and submitting without one shows the required error beneath the field.
- A new token shows in the token dialog itself, and disabled switches look disabled.
- The console's icons and select arrows use the Lucide icon set.
- The phone layout has bottom tabs that match the sidebar, with Connection and Notifications under More, and Password and sign-in is now named Sign-in and security.
- Toasts and page ends in the console stay clear of the save bar, copy rows show their label above the value, the sidebar fades where more items are below, and disabled switches keep the Off look, faded.

### FIXED
- Rate limits and the sign-in limit can no longer be reset by an IPv6 client switching addresses; IPv6 clients now count by their /56 network.
- Only the latest console toast stays visible, as the previous message is dismissed before its replacement shows.

### ADDED
- Export and Import under Connection > Backup cover the pfSense connection, notification destinations, and access-token hashes. Imports preview additions, replacements, and skipped duplicates, then apply every selected section in one transaction after a fresh account confirmation.
- Every console page has its own address, so Back, Forward, refresh and bookmarks open the same page, and signing in returns to the page you asked for.
- Debug logging under Diagnostics on the Connection page. While it's on, the container log names each SSH sign-in and command to pfSense with its exit code and how long it took, the scheduled pfSense check, each notification sent, and slow or canceled requests.

### REMOVED
- The PORT and PFSENSE_ACTIONS_PORT variables; the console always listens on 22603 inside the container, and a different host port is set with the port mapping (`-p 8080:22603`).

## 2.0.0 - 2026-11-01

### UPDATED
- Deprecated the `PFSENSE_*` connection variables in favor of the console. When they're set, pfSense Actions still imports them the first time it starts without a saved connection or database, and logs a warning at every start until they're removed.
- Made the Compose file start without secrets or an environment file, moved the default port from 9898 to 22603, turned on IPv6 for its network, and fixed the data directory at `/data` inside the image so a plain `docker run` keeps its database and generated key on the volume.
- Moved the API under `/api/v1` with JSON responses and a shared `{ error: { code, message, issues } }` envelope, and kept `GET /`, `POST /ping`, and `POST /wol` working for existing scripts.
- Limited `count` on `POST /ping` to 1 to 10 attempts. Larger values return `400`.
- Moved the image from Alpine to Debian slim.
- The zod package is now 4.6.7, which fixes a memory exhaustion issue when validating oversized lists in a request.

### FIXED
- The pfSense action routes distinguish successful commands, adapter failures, and unreachable ping targets with stable HTTP statuses.

### ADDED
- Encrypted TOTP enrollment and discoverable passkey registration, passwordless passkey sign-in, replay protection, account security controls, and deployment documentation for the administrative console.
- An operations console at `/admin`, built with React and Vite in the design shared with transmission-vpn, with System, Light, and Dark appearance modes, token management, a redacted activity log, tested pfSense SSH connection setup, inline field errors, and layouts that work on phones.
- A first-run setup screen that creates the administrator account with a one-time code printed in the container log, so no administrator password, encryption key, or pfSense connection has to be configured before the first start.
- Notifications are new. The Notifications page sends alerts for the events you choose to ntfy, Reverse Proxy for ntfy, Telegram, Discord, Slack, Gotify, Pushover, Matrix, email, Apprise, or a webhook, and each destination has a Send test button. While a destination wants to hear about it, pfSense Actions checks pfSense every five minutes and reports when it can't be reached and when it's back. It can also report locked sign-ins, secrets removed with a lost key, failed actions, and Wake-on-LAN packets. Secret fields are sealed with the encryption key and never shown again.
- An authenticated read-only system information route that returns only the validated operating system, release, and architecture fields.
- Ten single-use recovery codes when the authenticator app is turned on, accepted in place of an authenticator code at sign-in and replaceable from the console.
- A pinned, multi-architecture s6-overlay runtime that owns PID 1 and supervises the non-root pfSense Actions service.
- Personal access tokens with per-route scopes, stored only as SHA-256 hashes, with a friendly name and optional expiry that you can change later in the console.
- Derived the console's address from each request, trusting forwarded headers only from private and loopback proxies, and tied each passkey to the hostname it was added on, so no public URL needs to be configured.
- Generated the encryption key on the first start into `keys/installation.key` in the data directory. When the key is missing on an existing database, pfSense Actions makes a new one and removes only the pfSense credential and the authenticator app the old key sealed, listing them in the log and the console so they can be entered again. A key file from another database stops startup with a clear message.
- A strength meter sits under every field that sets a password. It rates the password from Weak to Strong and points out common words, runs such as 1234, repeated characters, years, and the username. Any password of 12 or more characters is still accepted.
- Kept console sessions, sign-in challenges, and passkey ceremonies in the database, so a session lasts 24 hours and survives restarts, and required the session's CSRF token in a header on every change.
- A local administrator account for the console, separate from client tokens, with all controller state in an encrypted SQLite database on the data volume. Administrator passwords are hashed with Argon2id, sign-in is limited to 10 failed attempts per address every 15 minutes, and the console asks for the password before authenticator and passkey changes.
- Validated runtime identity and time zone initialization for the protected data volume.

### REMOVED
- The filter-reload and Dynamic DNS refresh routes are gone to keep the public API focused on connectivity, reachability, and Wake-on-LAN.
- The `API_KEY` variable is gone. Each client signs in with its own personal access token from the console instead.

## 1.3.1 - 2025-03-14

### UPDATED
- The `prepare` script changed to a `postinstall` script because the script is designed only for after dependency installation.
- The `Dockerfile` upgraded to prevent redundant builds.

### FIXED
- Ping response was not properly recognized between `100.0% packet loss` and `0.0% packet loss` because of the `0.0%` discrepancy.

## 1.3.0 - 2025-03-12

### UPDATED
- The `wol-check` route is renamed to `ping` instead.
- Redundant return values for `isAuthenticated()` function.

### ADDED
- Rate limiting for 3 requests per 10 second window.

## 1.2.2 - 2025-03-10

### UPDATED
- Each `ping` would now count for 5 times instead of 3 for better accuracy.

### ADDED
- Strict check setting for the `wol-check` endpoint.

## 1.2.1 - 2025-03-05

### UPDATED
- Stabilized device pinging.

## 1.2.0 - 2025-03-05

### UPDATED
- Simplified `ping` wait process.
- Revamped ESLint configuration.
- Dependencies.

### ADDED
- Ability to change count of packets sent through `ping`.

## 1.1.1 - 2024-09-11

### UPDATED
- Improved ping check timing by using ten two-packet attempts instead of three five-packet attempts.

## 1.1.0 - 2024-09-07

### UPDATED
- Only command responses will now be converted to a JSON string then logged.

### ADDED
- Wake-on-LAN device check feature.

## 1.0.0 - 2024-09-06

### ADDED
- The initial Docker-based pfSense Actions controller with authenticated filter reload, Dynamic DNS refresh, and Wake-on-LAN endpoints over pfSense SSH connections.
