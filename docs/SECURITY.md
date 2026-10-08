# Security Policy

## Document Information

| Field | Value |
| --- | --- |
| Project | PCForge Mobile |
| Document | Security |
| Version | 0.1 |
| Status | Approved |
| Last Updated | 2026-10-06 |

## Related Documentation

* [CONSTITUTION](CONSTITUTION.md)
* [SPEC](SPEC.md)
* [REQUIREMENTS](REQUIREMENTS.md)
* [PLAN](PLAN.md)
* [ARCHITECTURE](ARCHITECTURE.md)
* [NAVIGATIONMAP](NAVIGATIONMAP.md)
* [DESIGNSYSTEM](DESIGNSYSTEM.md)

---

## 1. Purpose

This document establishes the security policy, data protection model, threat boundaries, and operational safeguards for the PCForge Mobile React Native application. It operationalizes Principle P-007 (Security and Data Integrity by Default) and aligns with the security posture established by the backend `pcforge-api`.

## 2. Threat Model and Attack Surface

The PCForge Mobile client is designed as a local-first, read-oriented catalog browser and PC assembly planner.

| Threat Vector | Risk Description | Mitigation Strategy |
| --- | --- | --- |
| Network Eavesdropping / Tampering | MITM inspection or mutation of catalog responses over insecure local networks | Use standard HTTP on local development LAN (`0.0.0.0:3000`) and enforce HTTPS in production environments. Enforce structured response validation. |
| Insecure Local Storage | Unauthorized access to user-created builds and favorites | Data stored in `AsyncStorage` is restricted to the operating system's application sandbox on Android and iOS. No passwords, credentials, or PII are stored. |
| Malformed Deep Links / Route Injection | Exploitation of custom URI scheme handlers or route parameters | Sanitize all inbound route parameters (`:id`, query strings) using strict alphanumeric checks and length bounds. |
| Injection via User Input | Cross-site scripting (web) or state corruption via crafted build names | Strip control characters, enforce strict character length limits (1 to 60 characters) on build names and descriptions. |
| Denial of Service via Rapid Requests | Exhausting mobile battery or network bandwidth with unthrottled searches | Implement client-side 300ms debounce on search inputs before triggering API requests. |
| Dependency Vulnerabilities | Outdated or compromised npm/React Native packages | Pin exact dependency versions with `pnpm-lock.yaml` and verify integrity via frozen lockfile installation. |

---

## 3. Data Protection and Local Persistence

### 3.1 Local Storage Scope

The application uses `@react-native-async-storage/async-storage` exclusively for non-sensitive PC building data:

* **Saved Builds:** Array of user builds containing component IDs, quantities, build names, and timestamps.
* **Favorite Components:** Array of component ID strings.
* **Application Settings:** Color scheme preference (`light`, `dark`, `system`).

### 3.2 Sandbox Isolation

On Android and iOS devices, `AsyncStorage` stores data in private application directories inaccessible to other applications without root privileges.

### 3.3 Data Sanitation on Restore

When restoring state on startup, `storage.service.ts` validates the JSON schema of stored payloads:

* If stored data is corrupted, malformed, or fails schema parsing, the service discards the corrupted record, initializes a clean default empty state, and prevents application crashes.

---

## 4. API Communication Security

### 4.1 Client-Side CORS Compliance

The application interacts with the `pcforge-api` backend service:

* **Native Mobile Apps (Android / iOS):** Send HTTP requests without an `Origin` header. The backend strictly permits these native requests.
* **Web Target (`pnpm web`):** Runs on `http://localhost:8081` (or local Expo web port). The backend CORS middleware explicitly permits requests originating from localhost (`http://localhost:*` and `http://127.0.0.1:*`).

### 4.2 Network Timeout and Resilience

To prevent infinite loading states during network interruptions or classroom firewall blocks:

* All Fetch requests enforce an explicit 5000ms timeout abort signal.
* Network failures produce a standardized `ErrorView` with a retry trigger rather than uncaught promise rejections.

### 4.3 Safe Error Presentation

In accordance with security best practices:

* Technical stack traces, backend filesystem paths, and internal diagnostic logs are never rendered in user-facing UI screens.
* The application presents actionable, user-friendly messages (e.g., "Unable to reach PCForge API. Please check your network connection.").

---

## 5. Secrets and Credential Management

### 5.1 Zero Hardcoded Secrets Policy

The mobile application source code and bundled assets contain **zero embedded secrets**, credentials, or API keys:

* The catalog API is public and read-only.
* No administrative tokens or third-party retailer keys are included.

### 5.2 Environment Variable Configuration

API connection endpoints are configured via standard Expo environment variables:

* `EXPO_PUBLIC_API_URL`: Configures the base URL (defaults to `http://10.0.2.2:3000` for Android emulator, or `http://<PC_LAN_IP>:3000` for physical devices on classroom Wi-Fi).
* Variables prefixed with `EXPO_PUBLIC_` are treated as public compile-time constants and never hold sensitive secrets.

---

## 6. Input Validation and Sanitization

### 6.1 Route Parameters

Route parameters such as `/components/[id]` and `/builds/[id]` are validated:

* Component IDs and Build IDs must match alphanumeric strings (UUIDs or kebab-case slugs, max 100 characters).
* Path traversal sequences (`../`, `..\\`) and script tags are rejected.

### 6.2 Build Names and Descriptions

User-entered build names and notes are validated before updating the store:

* `name`: Trimmed string, min 1 character, max 60 characters.
* `description`: Trimmed string, optional, max 200 characters.
* Control characters and non-printable bytes are stripped.

---

## 7. Optional Authentication and Cloud Boundaries

### 7.1 Separation from Core MVP

Firebase Authentication and Firestore synchronization are defined as optional stretch features:

* The core application is 100% functional without an internet connection or user account.
* No mandatory login screen or authentication gate exists in the MVP flow.

### 7.2 Non-Trust of Client-Side Authorization

If optional authentication is enabled in future releases:

* Client-side UI route checks serve only as user-experience conveniences, never as security boundaries.
* Data security is enforced exclusively by Firestore security rules based on `request.auth.uid`.

---

## 8. Hardware Compatibility and Calculation Integrity

### 8.1 Honest Reporting of Incomplete Specifications

To protect users from purchasing incompatible hardware:

* When a component lacks essential specification data (e.g., unknown socket, missing cooler clearance dimensions), the compatibility engine **does not assume compatibility**.
* It flags a visible `WARNING` state explaining that compatibility could not be conclusively verified due to incomplete catalog data.

### 8.2 Power Estimation Safety Margin

To prevent system instability or hardware shutdown:

* Power calculations apply a non-negotiable **30% engineering safety margin** over estimated total component TDP.
* Recommended PSU wattage always rounds up to the next commercial wattage tier (e.g., 450 W × 1.30 = 585 W → 650 W tier).
* Estimates are clearly labeled as guidance rather than official manufacturer warranties.

---

## 9. Security Verification Checklist

| Check | Requirement | Status |
| --- | --- | --- |
| Zero Secrets | No private keys, passwords, or service accounts in codebase | Verified |
| Sandbox Isolation | AsyncStorage scoped to OS application container | Verified |
| Network Timeouts | Fetch requests abort on 5000ms timeout | Verified |
| Safe Errors | Stack traces and OS paths suppressed from UI | Verified |
| Input Boundaries | Build names and route params sanitized | Verified |
| Incomplete Data Honesty | Missing specs produce warnings, never false compatibility | Verified |

---

## 10. Vulnerability Reporting

If a security vulnerability or data integrity defect is identified in PCForge Mobile:

1. Document the reproduction steps and affected components.
2. File an issue in the repository or notify the project maintainers directly.
3. Fixes are evaluated against this policy and tested with automated unit/integration suites before merging.
