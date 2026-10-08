# PCForge Mobile — Product Specification

| Field | Value |
| --- | --- |
| Project | PCForge Mobile |
| Document | Specification |
| Version | 0.1 |
| Status | Draft |
| Last Updated | 2026-10-01 |
| Owner | PCForge Team |

## 1. Overview

### 1.1 Product Summary

PCForge Mobile is a React Native application for planning, validating, and saving custom PC builds. It provides a curated component catalog sourced from a local BuildCores OpenDB snapshot through a dedicated backend API, allows users to select compatible components, calculates estimated power consumption, reports compatibility issues, and stores builds and favorites locally on the device.

The product is intentionally positioned as a customized PCPartPicker-style builder rather than an ecommerce application. It does not display prices, process purchases, or integrate with Amazon or other retailers.

### 1.2 Problem Statement

PC builders need to evaluate many hardware characteristics at the same time, including sockets, memory standards, form factors, physical dimensions, interfaces, quantities, and power requirements. Comparing these constraints manually makes it easy to select incompatible components or underestimate power requirements.

PCForge addresses this problem by centralizing component information and providing build-level compatibility and power feedback while keeping the build process understandable for users who may not have expert hardware knowledge.

### 1.3 Target Users

| User | Description | Primary Goal |
| --- | --- | --- |
| PC Builder | User planning a custom desktop PC | Create and validate a complete build |
| Hardware Explorer | User researching individual components | Search, filter, inspect, and favorite components |
| Student / Learner | User using the application in an educational context | Understand how a React Native app consumes an API and manages application state |

### 1.4 Product Vision

Provide a focused mobile PC-building experience that makes hardware selection, compatibility checking, and power estimation understandable and interactive.

The initial product prioritizes a reliable local-first experience. Authentication and cloud synchronization may be introduced later without changing the core build model.

---

## 2. Product Scope

### 2.1 In Scope

- Browse PC components by category.
- Search components.
- Filter components using relevant specifications.
- View detailed component specifications.
- Add and remove components from favorites.
- Create multiple PC builds.
- Rename builds.
- Edit builds.
- Delete builds.
- Add one or multiple components where the category permits it.
- Remove individual components from a build.
- Validate component compatibility.
- Calculate estimated system power consumption.
- Display recommended PSU capacity using a fixed 30% margin over estimated maximum consumption and round up to a safer standard commercial capacity.
- Persist builds and favorites locally.
- Consume component data from the PCForge API.
- Handle loading, empty, error, and success states.
- Provide a mobile-first user interface.
- Support the educational demonstration of React Native concepts.

### 2.2 Out of Scope

- Product prices.
- Amazon or retailer integrations.
- Shopping cart functionality.
- Orders or payments.
- Product purchasing.
- Real-time collaboration.
- Social profiles.
- Public build sharing.
- Backend administration.
- Editing BuildCores source data from the mobile app.
- External database configuration on student devices.
- Mandatory authentication.
- Mandatory cloud synchronization.
- Native ecommerce functionality.

### 2.3 Constraints

- The application must be developed with React Native and Expo.
- TypeScript is required.
- The application must use Expo Router for navigation.
- Styling must use React Native's styling system rather than SCSS.
- pnpm is the package manager for this independent mobile repository.
- Component data must come from the PCForge API.
- The backend must be independently runnable by students without requiring an external database.
- Local persistence must allow the core application to work without authentication.
- The class demonstration should be feasible within approximately 60 to 90 minutes.
- The application must remain functional if optional Firebase features are not implemented.
- The frontend repository and backend repository are separate.
- The `main` branch contains the completed implementation and `class-start` contains the initial teaching state.

### 2.4 Assumptions

- The PCForge API is running and reachable from the mobile application during the class.
- The API exposes normalized component data derived from BuildCores OpenDB.
- Component specifications contain enough information for the defined compatibility rules.
- Compatibility rules are maintained by the PCForge project rather than delegated to BuildCores.
- Builds and favorites can be represented as local application state.
- AsyncStorage is sufficient for the initial local persistence requirements.
- Firebase Authentication and Firestore are optional future extensions.
- The first release targets Android and development through Expo.
- Use the latest stable Expo SDK and Android SDK available when scaffolding, then record the exact versions in project configuration.
- Network connectivity is available when retrieving component catalog data.

---

## 3. Functional Overview

PCForge is organized around four major functional areas: component discovery, build management, build analysis, and local persistence.

### 3.1 Functional Area — Component Catalog

Users browse components by category, search by text, apply relevant filters, inspect detailed specifications, and favorite individual components.

### 3.2 Functional Area — Build Builder

Users create named builds and assemble them from components. A build supports one or multiple items depending on the component category, and users can replace or remove selected items.

### 3.3 Functional Area — Build Analysis

The application evaluates defined compatibility relationships and calculates estimated power consumption. Results are presented as compatible, warning, or incompatible states with actionable information.

### 3.4 Functional Area — Local Workspace

Builds and favorites are persisted locally so the application remains useful without authentication. Optional cloud synchronization may later extend this workspace.

---

## 4. Core Features

### F-001 — Component Catalog

#### 4.1.1 Purpose

Provide a centralized way to discover hardware and related PC components.

#### 4.1.2 Description

Users can browse component categories and retrieve component data from the PCForge API.

#### 4.1.3 Primary Users

- PC Builder
- Hardware Explorer
- Student / Learner

#### 4.1.4 Expected Outcome

The user can reach a relevant component list without manually knowing the component identifier.

#### 4.1.5 Related User Flows

- UF-001 — Browse and search components
- UF-002 — View component details
- UF-003 — Favorite a component

#### 4.1.6 Related Requirements

- [pcforge-app-REQUIREMENTS.md](pcforge-app-REQUIREMENTS.md): FR-001, FR-002, FR-003

### F-002 — Component Search and Filtering

#### 4.2.1 Purpose

Reduce the effort required to find suitable components.

#### 4.2.2 Description

Users can search component names and apply category-specific filters using available specifications.

#### 4.2.3 Primary Users

- PC Builder
- Hardware Explorer

#### 4.2.4 Expected Outcome

The component list is narrowed to items matching the user's search or filter criteria.

#### 4.2.5 Related User Flows

- UF-001 — Browse and search components

#### 4.2.6 Related Requirements

- [pcforge-app-REQUIREMENTS.md](pcforge-app-REQUIREMENTS.md): FR-004, FR-005

### F-003 — Component Details

#### 4.3.1 Purpose

Allow users to inspect the specifications required for an informed selection.

#### 4.3.2 Description

The application displays normalized component information such as brand, model, category, dimensions, capacity, interface, socket, memory standard, TDP, and other available specifications.

#### 4.3.3 Primary Users

- PC Builder
- Hardware Explorer

#### 4.3.4 Expected Outcome

The user can understand the relevant specifications before adding a component to a build or favorite list.

#### 4.3.5 Related User Flows

- UF-002 — View component details

#### 4.3.6 Related Requirements

- [pcforge-app-REQUIREMENTS.md](pcforge-app-REQUIREMENTS.md): FR-006

### F-004 — Favorites

#### 4.4.1 Purpose

Allow users to keep components they may want to reuse later.

#### 4.4.2 Description

Users can favorite and unfavorite individual components and view their locally stored favorites.

#### 4.4.3 Primary Users

- PC Builder
- Hardware Explorer

#### 4.4.4 Expected Outcome

Favorite state persists between application sessions.

#### 4.4.5 Related User Flows

- UF-003 — Favorite a component

#### 4.4.6 Related Requirements

- [pcforge-app-REQUIREMENTS.md](pcforge-app-REQUIREMENTS.md): FR-007, FR-008

### F-005 — Build Management

#### 4.5.1 Purpose

Allow users to create and maintain multiple PC configurations.

#### 4.5.2 Description

Users can create, rename, edit, save, and delete builds.

#### 4.5.3 Primary Users

- PC Builder

#### 4.5.4 Expected Outcome

The user can maintain multiple independent PC configurations.

#### 4.5.5 Related User Flows

- UF-004 — Create a build
- UF-005 — Edit a build
- UF-006 — Delete a build

#### 4.5.6 Related Requirements

- [pcforge-app-REQUIREMENTS.md](pcforge-app-REQUIREMENTS.md): FR-009, FR-010, FR-011, FR-012, FR-013

### F-006 — Build Component Selection

#### 4.6.1 Purpose

Allow users to assemble a build from the component catalog.

#### 4.6.2 Description

The builder allows users to select CPU, CPU cooler, motherboard, memory, storage, video card, case, power supply, operating system, monitor, sound card, case fans, keyboard, headphones, mouse, speakers, webcam, and accessories. Categories that support multiple items use collections rather than a single slot. A build allows up to two GPUs; memory count is bounded by motherboard slots and all selected modules must be the same memory component; storage count is bounded by supported motherboard connections; and fan count is bounded by case mounting positions (approximately ten at most when supported).

#### 4.6.3 Primary Users

- PC Builder

#### 4.6.4 Expected Outcome

The build accurately represents the selected component configuration.

#### 4.6.5 Related User Flows

- UF-004 — Create a build
- UF-005 — Edit a build
- UF-007 — Add multiple components

#### 4.6.6 Related Requirements

- [pcforge-app-REQUIREMENTS.md](pcforge-app-REQUIREMENTS.md): FR-014, FR-015, FR-016

### F-007 — Compatibility Analysis

#### 4.7.1 Purpose

Prevent or clearly identify invalid component combinations.

#### 4.7.2 Description

The application evaluates defined relationships such as CPU and motherboard socket compatibility, memory and motherboard memory standard compatibility, motherboard and case form factor compatibility, GPU and motherboard interface compatibility, GPU and case physical clearance, cooler and CPU socket compatibility, storage and motherboard interface compatibility, and other supported rules.

#### 4.7.3 Primary Users

- PC Builder

#### 4.7.4 Expected Outcome

The user receives a clear compatibility status and an explanation for each detected issue.

#### 4.7.5 Related User Flows

- UF-008 — Resolve an incompatibility

#### 4.7.6 Related Requirements

- [pcforge-app-REQUIREMENTS.md](pcforge-app-REQUIREMENTS.md): FR-017, FR-018, FR-019

### F-008 — Power Estimation

#### 4.8.1 Purpose

Help users understand the expected power demand of a build.

#### 4.8.2 Description

The application aggregates available power values to calculate estimated maximum system consumption, applies a fixed 30% safety margin, and recommends the next safer standard commercial PSU capacity. For example, 450 W × 1.30 = 585 W, which recommends 650 W rather than 600 W.

#### 4.8.3 Primary Users

- PC Builder

#### 4.8.4 Expected Outcome

The build displays estimated consumption and a recommended PSU capacity.

#### 4.8.5 Related User Flows

- UF-009 — Review build power consumption

#### 4.8.6 Related Requirements

- [pcforge-app-REQUIREMENTS.md](pcforge-app-REQUIREMENTS.md): FR-020, FR-021

### F-009 — Local Persistence

#### 4.9.1 Purpose

Keep the core user workspace available without mandatory authentication.

#### 4.9.2 Description

Builds and favorites are persisted locally using AsyncStorage. Local state is restored when the application starts.

#### 4.9.3 Primary Users

- PC Builder
- Hardware Explorer

#### 4.9.4 Expected Outcome

The user does not lose saved builds or favorites when the application is restarted.

#### 4.9.5 Related User Flows

- UF-010 — Restore local workspace

#### 4.9.6 Related Requirements

- [pcforge-app-REQUIREMENTS.md](pcforge-app-REQUIREMENTS.md): FR-022, FR-023

### F-010 — Optional Authentication and Cloud Persistence

#### 4.10.1 Purpose

Provide a path to account-based synchronization if implementation time allows.

#### 4.10.2 Description

Firebase Authentication may provide OAuth-based sign-in and Firestore may store builds and favorites for authenticated users.

#### 4.10.3 Primary Users

- Registered User

#### 4.10.4 Expected Outcome

An authenticated user can access their synchronized workspace from supported devices.

#### 4.10.5 Related User Flows

- UF-011 — Sign in and synchronize workspace

#### 4.10.6 Related Requirements

- [pcforge-app-REQUIREMENTS.md](pcforge-app-REQUIREMENTS.md): FR-024, FR-025, FR-026

---

## 5. User Flows

The user journeys and detailed flows for PCForge Mobile are maintained in [pcforge-app-USERJOURNEY.md](pcforge-app-USERJOURNEY.md). The document preserves UF-001 through UF-011, including the optional Firebase flow.

---

## 6. Product Requirements

The authoritative functional and non-functional requirements, acceptance criteria, priorities, constraints, and detailed traceability are maintained in [pcforge-app-REQUIREMENTS.md](pcforge-app-REQUIREMENTS.md). Existing FR and NFR identifiers are preserved.

---

## 7. Feature Prioritization

### MVP

- Component catalog.
- Component search.
- Component filtering.
- Component details.
- Favorites.
- Build creation.
- Build editing.
- Build deletion.
- Build renaming.
- Multi-item component collections.
- Compatibility analysis.
- Power estimation.
- Local persistence.
- API integration.
- Loading, empty, and error states.

### Important

- Advanced category-specific filters.
- Detailed compatibility issue explanations.
- Recommended PSU calculation.
- Build summary.
- Improved empty states.
- Offline access to saved local workspace.

### Stretch

- Firebase Authentication.
- OAuth login.
- Firestore synchronization.
- Cloud builds.
- Cloud favorites.
- Cross-device workspace.

### Out of Scope

- Ecommerce.
- Prices.
- Amazon integration.
- Payments.
- Orders.
- Public social features.
- Real-time collaboration.

---

## 8. Product Rules

- A build must have a user-provided name before it can be saved.
- A build may contain at most one CPU unless the component model explicitly supports otherwise.
- A build may contain at most one CPU cooler unless the project model explicitly supports otherwise.
- A build may contain at most one motherboard.
- A build may contain one or more identical memory modules, up to the number of supported motherboard slots.
- A build may contain storage devices up to the number and type of connections supported by the motherboard; storage devices need not be identical.
- A build may contain up to two video cards only when the project compatibility rules allow the selected motherboard and configuration.
- Case fans are limited by the mounting positions supported by the selected case; the expected upper bound is approximately ten when the case supports them.
- A build may contain at most one case.
- A build may contain at most one primary power supply.
- A build may contain one operating system.
- A build may contain one or more monitors, sound cards, case fans, keyboards, headphones, mice, speakers, webcams, and accessories when the category model permits multiple items.
- Compatibility must be evaluated from normalized component specifications and explicit project rules.
- Missing data must not be interpreted as proof of compatibility.
- Power estimation must use only known power values and identify incomplete estimates when required values are missing.
- Recommended PSU capacity must apply a fixed 30% margin to estimated maximum consumption and round up to the next safer standard commercial capacity; it must not be presented as a manufacturer certification.
- Favorite state is independent from build membership.
- Deleting a build must not delete its components from the catalog or favorites.
- Local persistence is the authoritative workspace while cloud synchronization is disabled.
- When Firebase is disabled, authentication must not be required to use core functionality.

---

## 9. Edge Cases

### Missing Component Specification

#### 9.1.1 Condition

A component does not contain a specification required by an applicable rule.

#### 9.1.2 Expected Behavior

The application marks the relevant compatibility or power analysis as incomplete and explains that the required source data is unavailable.

### Empty Search Result

#### 9.2.1 Condition

A search or filter produces no components.

#### 9.12.2 Expected Behavior

The application displays an empty state and provides an action to clear the search or filters.

### Duplicate Multi-Item Component

#### 9.3.1 Condition

The user adds the same component more than once to a multi-item category.

#### 9.3.2 Expected Behavior

The application follows the category's quantity rule and either allows the duplicate with quantity representation or rejects it with a clear explanation.

### Invalid Build Name

#### 9.4.1 Condition

The user attempts to save a build with an empty or whitespace-only name.

#### 9.4.2 Expected Behavior

The application prevents saving and identifies the required field.

### Incompatible Build

#### 9.5.1 Condition

At least one compatibility rule fails.

#### 9.5.2 Expected Behavior

The build remains editable and the issue is prominently visible. The application does not silently remove the conflicting component.

### Unknown Power Consumption

#### 9.6.1 Condition

One or more selected components have no usable power value.

#### 9.6.2 Expected Behavior

The application displays an incomplete power estimate and identifies the missing data.

### API Unavailable

#### 9.7.1 Condition

The component API cannot be reached.

#### 9.7.2 Expected Behavior

The application displays an error state for catalog operations while keeping locally persisted builds and favorites accessible.

### Corrupted Local Data

#### 9.8.1 Condition

Persisted data cannot be parsed or does not match the expected schema.

#### 9.8.2 Expected Behavior

The application rejects invalid records safely, logs the failure through the application's error mechanism, and initializes a safe empty state rather than crashing.

---

## 10. Error and Failure Behavior

| Scenario | Expected User-Visible Behavior | Recovery |
| --- | --- | --- |
| API unavailable | Catalog displays a connection error | Retry request |
| API returns invalid response | Catalog displays a data error | Retry or return to previous screen |
| Component not found | Detail screen displays not-found state | Return to catalog |
| Search returns no results | Empty state | Clear search or filters |
| Build name invalid | Validation message | Enter a valid name |
| Local persistence fails | Non-blocking error where possible | Retry save or continue with in-memory state |
| Compatibility data missing | Analysis marked incomplete | Inspect missing specification or continue |
| Incompatible components | Compatibility issue shown | Replace or remove affected component |
| Power data missing | Estimate marked incomplete | Add components with known power data |
| Firebase authentication fails | Authentication error | Retry or continue locally |
| Firestore unavailable | Synchronization error | Retry synchronization |

---

## 11. Product Metrics / Success Criteria

| Metric | Target | Measurement |
| --- | --- | --- |
| Core build completion | A user can create and save a build during the class | Demonstration |
| Compatibility visibility | Every supported build change triggers updated compatibility analysis | Functional test |
| Power visibility | A build with sufficient power data displays estimated watts | Functional test |
| Local persistence | Saved builds and favorites survive restart | Manual verification |
| API integration | Catalog data is loaded from the backend API | Network/API verification |
| Class reproducibility | At least two classmates can run the project and follow the main flow | Classroom verification |
| Core flow completion | User can browse, select, validate, and save a build without authentication | End-to-end manual test |

---

## 12. Related Documentation

- `CONSTITUTION.md`
- `AGENTS.md`
- [pcforge-app-REQUIREMENTS.md](pcforge-app-REQUIREMENTS.md)
- `PLAN.md`
- `ARCHITECTURE.md`
- `DESIGNSYSTEM.md`
- `DATABASE.md`
- `SECURITY.md`
- `API.md`
- `DEPLOY.md`
- `pcforge-app-USERJOURNEY.md`
