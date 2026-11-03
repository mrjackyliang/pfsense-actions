# VISION.md

## Purpose

### Problem Statement

Home automation and network-management workflows sometimes need to ask a pfSense
firewall for a small, well-understood capability: check controller connectivity, test
reachability, or send a Wake-on-LAN packet. The pfSense web interface is too interactive
for scripts, while exposing a general remote shell grants far more authority than the
caller needs.

pfSense Actions provides a narrow authenticated HTTP boundary in front of an allowlist of
fixed firewall operations. Express, Docker, and SSH make that boundary easy to validate,
deploy, observe, and maintain without expanding it into a general pfSense management API.

### Target Audience

- **Home-lab operators** - People connecting trusted automation systems to a pfSense
  firewall without handing those systems unrestricted shell access.
- **Network administrators** - Operators who want repeatable, auditable triggers for a
  small collection of operational actions.
- **Self-hosters** - People who need a compact Docker service with explicit secrets,
  health behavior, and dependable upgrades.
- **Automation authors** - Developers integrating shortcuts, dashboards, or workflows
  that need stable success and failure semantics rather than shell output.

### Value Proposition

pfSense Actions exposes a deliberately small set of firewall operations through an
authenticated, rate-limited API. It keeps the public contract simple and data-minimizing
while isolating SSH credentials and pfSense-specific command execution inside one
containerized controller.

## Product Direction

### Principles

- **Narrow verbs, not a remote shell** - Every route maps to a reviewed action with a
  fixed command shape and a documented risk level.
- **Deny by default** - Authentication, validation, and authorization happen before any
  SSH connection or side effect.
- **Client-sized authority** - Personal access tokens grant only the scopes required by
  a script, shortcut, or dashboard, and the controller stores only their hashes.
- **Minimal disclosure** - Callers receive only the information needed to understand
  success or failure; credentials and raw firewall output stay out of API responses.
- **Predictable automation** - Inputs, timeouts, retries, and status codes should be
  stable enough for unattended workflows.
- **Visible operations** - Structured, redacted logs should explain which action ran and
  why it failed without exposing secrets or sensitive network details.
- **Operable without a shell** - Routine token, activity, notification, and
  controller-connection administration should be available through a narrowly protected
  browser console.
- **Container-native delivery** - Configuration, health, shutdown, and persistence
  behavior should be designed for Docker rather than added around a local script.

### Scope

#### Initial Action Set

The supported routes form the public contract:

- Verify connectivity and authenticated access to the configured firewall.
- Read the operating system, release, and architecture through a fixed response schema.
- Run bounded ICMP reachability checks for a validated address.
- Send a Wake-on-LAN packet to a validated MAC and broadcast address.

New routes should favor genuinely useful read-only information. Any additional
state-changing action requires explicit review of its narrow user value and authority.

#### Initial Migration Scope

- A Nova Express.js application workspace with Docker packaging.
- Typed environment and request schemas with fail-fast startup validation.
- Scoped Bearer-token authentication and rate limiting applied consistently before
  action handlers.
- A narrow pfSense adapter with explicit connect, execute, and disconnect lifecycles.
- Readiness, liveness, graceful shutdown, and redacted structured logging.
- An embedded-SQLite operations console for local administrator access, token lifecycle,
  activity review, and tested pfSense connection updates.
- Alerts to services such as ntfy, Telegram, Discord, and email when pfSense stops
  answering or comes back, an action fails, or a wake packet is sent.
- Contract and integration tests for each supported action.

### Explicit Non-Goals

- A general SSH proxy or arbitrary command endpoint.
- Editing, importing, or exporting pfSense configuration.
- Replacing the pfSense web interface or providing broad firewall configuration tools.
- Letting the operations console execute arbitrary pfSense commands or edit firewall
  configuration.
- Exposing the plain-HTTP listener directly to the public internet without TLS and
  compensating network controls.
- Returning raw command output by default.
- Adding actions solely because a command exists on pfSense.

## Product Design

### Core Capabilities

The product authenticates narrowly scoped clients, validates a closed request contract,
executes reviewed pfSense operations through one SSH adapter, exposes controller
administration through a protected operations console, and sends alerts when pfSense
stops answering or an action fails.

### User Experience

Automation clients receive stable, data-minimizing outcomes. Operators can provision
tokens, review redacted activity, test connection changes, and choose where alerts go
without receiving a broad firewall-management interface.

## Positioning

### Differentiators

| pfSense Actions                                   | Broader alternatives                                   |
|---------------------------------------------------|--------------------------------------------------------|
| Small allowlist of purpose-built operations       | General SSH access or broad management APIs            |
| Data-minimizing response contract                 | Raw command and configuration data returned to callers |
| Designed for unattended automation                | Designed primarily for interactive administration      |
| Container boundary owns credentials and lifecycle | Every automation client manages firewall access itself |

## Risks and Future

### Open Questions

Future work should decide:

- Whether generated tokens should require an expiry by default.
- How SSH host-key verification and known-host enrollment are configured.
- Whether the controller supports one firewall per deployment or named targets.
- Which response details are safe and useful beyond HTTP status codes.
- Whether a local-only metrics surface is justified.

## Marketing Copy

### Tagline

Give automation the pfSense actions it needs, and nothing more.

### Elevator Pitch

pfSense Actions is a small self-hosted controller for safely triggering a focused set of
firewall operations. It turns reviewed pfSense commands into scoped HTTP actions for home
automation and network workflows, without exposing a general shell. It packages that
boundary as a predictable Express service and Docker image.

### Key Features

- **Allowlisted actions** - Invoke only reviewed operations with fixed command shapes.
- **Scoped personal tokens** - Give each script only the read or Wake-on-LAN capability
  it needs, and revoke a token at any time to cut off access at once.
- **Operations console** - Create and revoke scoped tokens, inspect redacted activity,
  and test connection changes without opening a shell in the container.
- **Alerts** - Hear through ntfy, Telegram, Discord, email, and other services when
  pfSense stops answering or comes back, or when an action fails.
- **Data-minimizing API** - Use clear status semantics without returning sensitive
  firewall output to callers.
- **Isolated SSH access** - Keep pfSense credentials and command execution behind the
  controller boundary.
- **Automation-friendly contracts** - Validate requests, bound work, and report stable
  success and failure states.
- **Container operations** - Deploy with external secrets, health checks, redacted logs,
  and graceful shutdown.

## Glossary

| Term                     | Definition                                                                                                                            |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| Action                   | One reviewed pfSense operation exposed through a dedicated API route.                                                                 |
| Controller               | The Express service that authenticates callers and performs allowed actions over SSH.                                                 |
| Allowlist                | The closed set of commands the controller is designed to execute.                                                                     |
| Personal access token    | A per-client Bearer credential with a closed set of route capabilities.                                                               |
| Scope                    | A named capability granted to a personal access token.                                                                                |
| Data-minimizing response | A response that communicates outcome without returning raw firewall or network details.                                               |
| Target firewall          | The configured pfSense instance reached by the controller over SSH.                                                                   |
| Notification destination | One place alerts go, such as an ntfy topic, a Telegram chat, or an email inbox, with the events it receives.                          |
| Scheduled check          | The 5-minute SSH sign-in and `uname -mrs` that notices when pfSense stops answering, run only while a destination wants those alerts. |
| Operations console       | The protected browser surface for controller administration, not firewall management.                                                 |

## Additional Vision Notes

### Current Context

> This document captures the product direction for the Nova Express and Docker
> implementation of pfSense Actions.
