# Architecture

## Document Information

| Field | Value |
| --- | --- |
| Project | `PCForge Mobile` |
| Document | Architecture |
| Version | `0.1` |
| Status | `Draft` |
| Last Updated | `2026-10-01` |
| Architecture Style | `Feature-based modular architecture with layered client boundaries and component-driven UI` |

## Related Documentation

* [CONSTITUTION](CONSTITUTION.md)
* [SPEC](SPEC.md)
* [REQUIREMENTS](REQUIREMENTS.md)
* [PLAN](PLAN.md)
* [NAVIGATIONMAP](NAVIGATIONMAP.md)
* [SECURITY](SECURITY.md)
* [API](API.md)

---

## 1. Purpose

This document defines the architectural boundaries and dependency rules for the PCForge React Native application.

It governs the separation between presentation, feature logic, state management, API access, local persistence, and optional Firebase integration. The architecture is intentionally simple enough to teach within a 60 to 90 minute class while remaining maintainable and testable.

## 2. Architectural Drivers

| Driver | Source | Architectural Impact |
| --- | --- | --- |
| React Native mobile application | SPEC / FR-001 to FR-026 | UI and platform boundaries use React Native and Expo |
| Classroom reproducibility | SPEC / NFR-006 | Avoid mandatory infrastructure and external databases |
| API separation | SPEC / NFR-004 | Catalog access goes through a dedicated data-access layer |
| Local persistence | SPEC / FR-022, FR-023 | Persistence is isolated behind storage services/repositories |
| Compatibility analysis | SPEC / FR-017 to FR-019 | Domain rules remain independent from UI components |
| Power calculation | SPEC / FR-020, FR-021 | Derived calculations remain in domain utilities/services |
| Maintainability | SPEC / NFR-005 | Feature modules and explicit dependency direction |
| Optional Firebase | SPEC / FR-024 to FR-026 | Authentication/cloud integration remains an optional infrastructure boundary |

## 3. Architecture Overview

### 3.1 Architectural Style

**Style:** Feature-based modular architecture with layered client boundaries and component-driven UI.

The application is organized by product feature while maintaining explicit separation between presentation, domain logic, state, and infrastructure.

The architecture is not a strict Clean Architecture implementation. It borrows its dependency direction and separation principles without introducing unnecessary ceremony for a classroom application.

### 3.2 High-Level Structure

The application code is organized under `src/`, alongside Expo Router's source-based route tree:

* `src/app/` for routes and screen composition.
* `src/components/` for reusable UI primitives and composed components.
* `src/features/` for feature-specific presentation and domain behavior.
* `src/stores/` for global reactive state.
* `src/services/` for API and persistence boundaries.
* `src/types/` for shared contracts.
* `src/utils/` for pure calculations and helpers.
* `src/constants/` for stable application definitions.
* `src/hooks/` for reusable hooks.
* `src/tests/` for unit, integration, UI, and E2E tests.
* `src/global.css` for the scaffold's global web styles; native components use React Native `StyleSheet`.

Expo-managed project files, assets, scripts, and documentation remain at the repository root.

The principal dependency direction is:

```text
Screens
  ↓
Feature logic / stores
  ↓
Domain utilities
  ↓
Services / repositories
  ↓
External API / local storage / Firebase
```

UI components must not directly access AsyncStorage, Firebase, or raw HTTP implementation details.

### 3.3 Architectural Principles

* Keep product behavior independent from UI rendering.
* Keep external integrations behind explicit boundaries.
* Prefer local state for local concerns and global state only when shared.
* Keep compatibility and power calculations deterministic and testable.
* Do not require authentication for MVP functionality.
* Avoid abstractions that do not solve a concrete project problem.
* Treat frontend authorization checks as UX controls, never as security boundaries.
* Keep API response models separate from UI-specific view models when transformation is necessary.

## 4. Architectural Patterns

| Pattern | Problem Solved | Application | Constraints |
| --- | --- | --- | --- |
| Feature-based modules | Prevent unrelated functionality from becoming coupled | Builds, components, favorites, compatibility | Features should not create circular dependencies |
| Repository / service boundary | Isolate external data access | API and local persistence services | UI must not call storage or fetch directly |
| Component-driven UI | Reuse visual behavior | Atoms, molecules, organisms | Components should remain focused |
| Reactive state store | Share build and favorites state | Zustand | Avoid storing transient screen state globally |
| Pure domain functions | Make calculations testable | Compatibility and power calculation | Functions must not depend on React Native UI |
| Adapter boundary | Allow optional providers | Firebase/local persistence | Provider-specific code stays in infrastructure |

### 4.1 Feature-Based Modular Architecture

#### 4.1.1 Purpose

Keep product functionality understandable as the application grows.

#### 4.1.2 Application

The main features are:

```text
src/features/
├── builds/
├── components/
├── favorites/
└── compatibility/
```

Each feature may contain feature-specific types, hooks, selectors, and UI composition while reusable visual primitives remain under `components/`.

#### 4.1.3 Dependency Rules

Features may depend on shared types, domain utilities, and approved services.

Features must not import another feature's private implementation directly. Shared behavior should move to a common module only when it is genuinely shared.

### 4.2 Repository / Service Boundary

#### 4.2.1 Purpose

Prevent UI components from knowing how API requests or local persistence are implemented.

#### 4.2.2 Application

Examples include:

```text
src/services/
├── api.ts
├── components.service.ts
└── storage.service.ts
```

#### 4.2.3 Dependency Rules

Screens and UI components depend on service interfaces or exported service functions rather than raw `fetch` or AsyncStorage calls.

### 4.3 Pure Domain Calculation

#### 4.3.1 Purpose

Keep compatibility and power calculations deterministic and easy to test.

#### 4.3.2 Application

```text
src/utils/
├── compatibility.ts
└── power.ts
```

#### 4.3.3 Dependency Rules

Calculation functions may depend on domain types and constants but must not import React components, navigation, AsyncStorage, or network clients.

## 5. System Architecture

### 5.1 Technology Boundaries

| Boundary | Technology | Responsibility | Ownership |
| --- | --- | --- | --- |
| Mobile UI | React Native | Render screens and interactions | Internal |
| App runtime | Expo | Development/runtime platform | External |
| Navigation | Expo Router | Route composition and navigation | External |
| State | Zustand | Shared reactive application state | External |
| Local persistence | AsyncStorage | Persist builds and favorites | External |
| API client | Fetch API | HTTP communication | Platform |
| Backend API | PCForge API | Component catalog | Internal separate repository |
| Optional Auth | Firebase Authentication | Identity | External |
| Optional Cloud Data | Firestore | Cloud workspace | External |

### 5.2 System Context

The mobile application is used by a PC builder and communicates with the PCForge API to retrieve component catalog data.

The local device provides persistent storage for builds and favorites. Firebase Authentication and Firestore are optional external systems and are not required for MVP operation.

### 5.3 Application Structure

The app follows a unidirectional dependency model. Screens and reusable UI consume feature state and services. Services isolate network, local persistence, and optional cloud providers. Compatibility and power calculations remain pure domain operations.

## 6. Frontend / Client Architecture

### 6.1 Responsibilities

The frontend is responsible for:

* Rendering the mobile user interface.
* Navigation.
* User interaction.
* Local application state.
* Build composition.
* Favorite state.
* Compatibility evaluation.
* Power estimation.
* Local persistence.
* Consuming the backend API.
* Optional Firebase authentication and synchronization.
* User-visible loading, empty, success, and error states.

### 6.2 Presentation

Presentation consists of Expo Router screens and reusable React Native components.

Screens should compose behavior rather than implement business rules directly.

The component hierarchy may use:

```text
atoms
molecules
organisms
```

but the project should not force every component into an Atomic Design category when a simpler feature component is clearer.

### 6.3 Domain

The domain layer contains:

* `Build`.
* `Component`.
* `CompatibilityIssue`.
* `PowerEstimate`.
* Category definitions.
* Compatibility rules.
* Power calculation rules.

Domain logic must remain independent from React rendering and storage mechanisms.

### 6.4 Data / Infrastructure

Data and infrastructure include:

* API client.
* Component service.
* Local persistence service.
* Optional Firebase adapters.

Infrastructure code converts external data into application models where necessary.

## 7. Backend Architecture

### 7.1 Responsibilities

The mobile frontend treats the backend as an external application boundary.

The frontend is responsible only for consuming its documented API contract. It must not depend on the backend's internal directory structure or JSON files.

### 7.2 API Boundary

The frontend communicates with the backend through REST endpoints such as:

```text
GET /api/health
GET /api/categories
GET /api/components
GET /api/components/:id
```

Query parameters are used for supported search and filtering operations.

### 7.3 Services / Use Cases

Frontend services expose operations such as:

```text
getCategories()
getComponents(params)
getComponent(id)
```

The service layer translates API failures into application-consumable error states.

### 7.4 External Integrations

The frontend has no direct integration with BuildCores OpenDB. BuildCores data is prepared and exposed through the PCForge API.

Optional Firebase integration is isolated from the core API client.

## 8. Firebase Architecture

> Firebase is optional and is not required for MVP.

### 8.1 Services

| Service | Purpose | Boundary |
| --- | --- | --- |
| Firebase Authentication | OAuth-based user identity | Infrastructure |
| Firestore | Cloud builds and favorites | Infrastructure |

### 8.2 Security Boundary

Firebase credentials/configuration may be present in the client only in the form intended for Firebase client SDK initialization.

Authorization rules for Firestore must be enforced by Firestore security rules and authenticated identity. Client-side route guards are not security controls.

## 9. Local Persistence

AsyncStorage is the local persistence mechanism for the MVP.

The persistence boundary is isolated from Zustand so state management does not become coupled to the storage implementation.

The local workspace contains:

```text
builds
favorites
```

The application loads persisted state during startup and writes changes after relevant state mutations.

Local persistence is authoritative when Firebase synchronization is disabled.

If Firebase is later enabled, synchronization behavior must be explicitly defined before implementation. The application must not silently merge conflicting local and cloud state.

## 10. Package and Component Architecture

### 10.1 Project Structure

```text
pcforge-app/
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── explore.tsx
│   │   ├── builds/
│   │   ├── components/
│   │   └── ...
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── ui/
│   ├── constants/
│   ├── features/
│   │   ├── builds/
│   │   ├── components/
│   │   ├── favorites/
│   │   └── compatibility/
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   ├── ui/
│   │   └── e2e/
│   ├── types/
│   ├── utils/
│   └── global.css
├── assets/
├── docs/
│   └── screenshots/
├── scripts/
├── app.json
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

### 10.2 Component Responsibilities

| Component | Responsibility | Depends On | Must Not Depend On |
| --- | --- | --- | --- |
| Route screen | Compose screen behavior | Features, components, router | Raw AsyncStorage |
| UI atom | Render one reusable primitive | React Native | API, stores |
| UI molecule | Compose small reusable UI | Atoms, presentation props | Direct storage |
| UI organism | Compose larger UI sections | Molecules, feature props | Raw network calls |
| Feature module | Implement feature-specific behavior | Stores, services, domain | Private internals of unrelated features |
| Zustand store | Own shared reactive state | Types, services | UI implementation |
| API service | Retrieve backend data | Fetch, API types | React components |
| Storage service | Persist local workspace | AsyncStorage | UI components |
| Compatibility utility | Evaluate compatibility | Domain types, rules | Network, storage, React |
| Power utility | Calculate estimated power | Domain types | Network, storage, React |

## 11. Data Flow

### 11.1 Primary Flow

```text
UI → Feature/Hook → Service → API → PCForge API → JSON
```

For local workspace changes:

```text
UI → Build Store → Storage Service → AsyncStorage
```

For compatibility:

```text
Build Store → Compatibility Function → Compatibility Result → UI
```

For power:

```text
Build Store → Power Function → Power Estimate → UI
```

The API catalog is read through the service layer. Build state is maintained locally in Zustand and persisted independently.

### 11.2 Error Flow

```text
External Error
    ↓
Service
    ↓
Typed/normalized application error
    ↓
Feature state
    ↓
Screen
    ↓
User-visible error state
```

Infrastructure errors must not be rendered directly as raw exceptions.

### 11.3 Synchronization Flow

MVP:

```text
Zustand
  ↓
AsyncStorage
```

Optional cloud mode:

```text
Local State
  ↕
Synchronization Service
  ↕
Firestore
```

The synchronization policy must be defined before cloud synchronization is enabled.

## 12. State Management

### 12.1 State Model

State is divided into:

* Server/catalog state: components retrieved from the API.
* Build state: current and saved builds.
* Favorite state: favorite component identifiers.
* UI state: loading, errors, filters, search terms, modal visibility.
* Optional authentication state.

### 12.2 Reactive State

Zustand is used for cross-screen build and favorite state.

React local state is preferred for temporary UI concerns such as:

* Search text.
* Filter panel visibility.
* Form input.
* Temporary selection state.

### 12.3 Loading / Success / Error States

Asynchronous catalog operations should expose explicit states:

```text
idle
loading
success
empty
error
```

Build persistence should provide enough state to avoid presenting a successful save before persistence has completed when persistence failure matters.

### 12.4 Asynchronous Execution

The frontend uses `async/await` for API and persistence operations.

No background worker or queue is required for the MVP.

## 13. Additional Patterns and Rules

### 13.1 Dependency Injection

Formal dependency injection is not required for the MVP.

Services should be imported through explicit module boundaries. If testing requires provider replacement, lightweight dependency injection or module-level adapters may be introduced without adding a DI framework.

### 13.2 Mapping

API responses may be mapped to application domain types when the API representation differs from the mobile domain model.

The UI must not depend on raw backend field names when a stable application model is required.

### 13.3 Error Handling

Network and persistence errors must be normalized before reaching presentation components.

Errors shown to users should be actionable and should not expose internal implementation details.

### 13.4 Concurrency

The application must avoid stale writes where multiple persistence operations can overlap.

Where necessary, state changes should be serialized through the store's update flow.

The MVP does not require distributed concurrency control because local workspace state belongs to one device.

## 14. Testing Architecture

| Test Level | Scope | Main Purpose |
| --- | --- | --- |
| Unit | Domain functions and stores | Validate compatibility, power, and state transitions |
| Integration | Services and API interaction | Validate request/response handling |
| UI | React Native components/screens | Validate rendering and interactions |
| E2E | Main user flows | Validate browse, build, save, edit, and delete behavior |

### 14.1 Test Boundaries

The most important unit-test boundaries are:

* Compatibility rules.
* Power calculation.
* Build mutations.
* Favorite mutations.
* API response mapping.

Integration tests should validate service behavior without requiring production Firebase.

### 14.2 Test Doubles

Use mocked API responses for deterministic frontend tests.

Use an in-memory storage adapter or mocked AsyncStorage for persistence tests.

Firebase should be mocked or isolated from MVP tests.

## 15. SOLID Principles

| Principle | Application in This Project |
| --- | --- |
| Single Responsibility | Screens compose UI, stores manage shared state, services access data, and domain utilities calculate results |
| Open/Closed | New compatibility rules can be added without rewriting existing UI components |
| Liskov Substitution | Storage/API provider abstractions should remain interchangeable where abstractions are introduced |
| Interface Segregation | Services expose focused operations instead of one oversized application service |
| Dependency Inversion | Feature/domain logic depends on service boundaries rather than concrete storage or network details where abstraction provides value |

## 16. Architecture Constraints

* React Native and Expo are the mobile platform boundaries.
* TypeScript is required.
* Expo Router is the navigation boundary.
* SCSS must not be introduced as the primary React Native styling mechanism.
* UI components must not directly access AsyncStorage.
* UI components must not directly call raw `fetch`.
* Compatibility and power calculations must not depend on React rendering.
* Firebase must remain optional for MVP.
* No database client belongs in the mobile application.
* No secret credentials may be embedded in the application bundle.
* The frontend must not treat client-side authorization checks as a security boundary.

## 17. Architecture Evolution

### Current Architecture

The current architecture is local-first and API-backed:

```text
React Native
   ├── PCForge API
   └── AsyncStorage
```

Firebase is optional and not required for core operation.

### Expected Evolution

Potential future evolution:

```text
React Native
   ├── PCForge API
   ├── Firebase Auth
   └── Firestore
```

A future backend database migration does not require a corresponding mobile architecture rewrite as long as the API contract remains stable.

### Migration Rules

* Preserve the public API contract when changing backend storage.
* Keep local persistence available as a fallback if cloud mode is not required.
* Introduce synchronization only after defining conflict resolution.
* Avoid moving compatibility logic to the backend unless a product requirement requires centralized validation.
* Avoid adding global state for data that remains screen-local.

## 18. Architectural Decisions

| ID | Decision | Reason | Alternatives Considered |
| --- | --- | --- | --- |
| ADR-001 | Use Expo for React Native development | Reduces classroom setup and provides a practical runtime/tooling layer | Bare React Native |
| ADR-002 | Use TypeScript | Improves component and domain contract clarity | JavaScript |
| ADR-003 | Use Expo Router | File-based navigation is concise and teachable | React Navigation configured manually |
| ADR-004 | Use StyleSheet | Matches native React Native styling and avoids unnecessary styling dependencies | NativeWind, styled-components |
| ADR-005 | Use Zustand | Keeps shared build/favorite state small and explicit | Redux Toolkit, Context API |
| ADR-006 | Use AsyncStorage for MVP persistence | Requires no external infrastructure | SQLite, SecureStore, database |
| ADR-007 | Keep compatibility calculations on mobile | Makes the React Native lesson visibly demonstrate application logic | Server-side compatibility |
| ADR-008 | Keep Firebase optional | Prevents authentication/cloud setup from blocking the core class | Mandatory Firebase |
| ADR-009 | Separate frontend and backend repositories | Allows students to clone and run the API independently | Monorepo |

## 19. Architecture Verification Checklist

* [ ] Architecture matches approved requirements.
* [ ] Dependency direction is explicit.
* [ ] No forbidden dependency exists.
* [ ] Major patterns are documented and justified.
* [ ] Testing boundaries are defined.
* [ ] SOLID principles are addressed.
* [ ] Specialized documents remain consistent.
* [ ] No unresolved architectural contradiction remains.

## 20. Change Log

| Version | Date | Change | Reason |
| --- | --- | --- | --- |
| `0.1` | `2026-10-01` | Initial mobile architecture | Establish project boundaries and classroom-oriented architecture |
