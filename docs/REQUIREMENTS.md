# PCForge Mobile — Requirements

| Field | Value |
| --- | --- |
| Project | PCForge Mobile |
| Document | Requirements |
| Version | 0.1 |
| Status | Draft |
| Last Updated | 2026-10-01 |
| Specification Version | 0.1 |

## 1. Purpose

This document defines the testable functional and non-functional requirements for PCForge Mobile. It operationalizes the product scope and behavior in [pcforge-app-SPEC.md](pcforge-app-SPEC.md), which remains the product-level source of truth. Existing FR and NFR identifiers are preserved.

## 2. Product Scope

### In Scope

- Browse, search, filter, paginate, and inspect component catalog data provided by the PCForge API.
- Favorite and unfavorite components with local persistence.
- Create, rename, edit, list, and delete multiple PC builds.
- Add, replace, and remove components, including multi-item categories.
- Recalculate compatibility and estimated power, including incomplete-analysis states.
- Persist builds and favorites locally and restore them without authentication.
- Provide loading, empty, success, and error feedback for asynchronous operations.
- Optional Firebase authentication and cloud workspace synchronization as a stretch feature.

### Out of Scope

- Product pricing, retailer/Amazon integration, purchasing, carts, orders, and payments.
- Real-time collaboration, social profiles, and public build sharing.
- Backend administration or editing BuildCores source data from the mobile app.
- Mandatory user accounts, authentication, or cloud synchronization.
- External database configuration on student devices.

---

## 3. Requirement Conventions

### Functional Requirements

Format:

`FR-001 — <Requirement Name>`

Functional requirement identifiers are retained from the SPEC. Each describes observable app behavior and has individually verifiable acceptance criteria.

### Non-Functional Requirements

Format:

`NFR-001 — <Requirement Name>`

Non-functional requirements describe measurable product qualities or constraints.

### Priority

- Must
- Should
- Could
- Won't

MoSCoW priorities map MVP requirements to Must and optional Firebase stretch requirements to Could.

## 4. Functional Requirements

### Feature / Epic: Component Catalog (F-001)

#### FR-001 — Load Component Categories

Description:

WHEN the user opens the component catalog, THE SYSTEM SHALL display the supported component categories.

Acceptance Criteria:

- AC-FR-001-01: The catalog displays the supported categories returned by the API.
- AC-FR-001-02: Selecting a displayed category starts retrieval for that category.

Priority:

Must

Traceability:

- SPEC Feature: `F-001`
- User Flow: `UF-001`

---

#### FR-002 — Retrieve Components

Description:

WHEN the user selects a category, THE SYSTEM SHALL request the corresponding paginated component data from the PCForge API.

Acceptance Criteria:

- AC-FR-002-01: The request targets the selected category using the API contract.
- AC-FR-002-02: A successful response is passed to the component-list presentation.
- AC-FR-002-03: An API failure is presented as a catalog error without preventing access to locally persisted workspace data.
- AC-FR-002-04: The first catalog request uses page 1 and the API default page size of 50 unless the user selects another supported size.
- AC-FR-002-05: When more pages are available, the app can request another page while preserving the active category, search, and filters.

Priority:

Must

Traceability:

- SPEC Feature: `F-001`
- User Flow: `UF-001`

---

#### FR-003 — Display Component List

Description:

WHEN component data is successfully retrieved, THE SYSTEM SHALL display the available components in a scrollable list.

Acceptance Criteria:

- AC-FR-003-01: Every component in a successful non-empty response can be reached in the scrollable list.
- AC-FR-003-02: An empty successful response is represented by an empty state rather than a failure state.

Priority:

Must

Traceability:

- SPEC Feature: `F-001`
- User Flow: `UF-001`

### Feature / Epic: Component Search and Filtering (F-002)

#### FR-004 — Search Components

Description:

WHEN the user enters a search term, THE SYSTEM SHALL filter or request component results matching the supported search behavior.

Acceptance Criteria:

- AC-FR-004-01: Entering a known search term updates the visible results to matching components.
- AC-FR-004-02: Clearing the search restores results for the active category and filters.
- AC-FR-004-03: A search with no matches displays an empty state and an action to clear the search or filters.

Priority:

Must

Traceability:

- SPEC Feature: `F-002`
- User Flow: `UF-001`

---

#### FR-005 — Filter Components

Description:

WHEN the user applies a supported filter, THE SYSTEM SHALL display only components satisfying the selected filter conditions.

Acceptance Criteria:

- AC-FR-005-01: Applying a supported filter excludes components that do not satisfy it.
- AC-FR-005-02: Multiple active filters return only components satisfying all selected conditions.
- AC-FR-005-03: Clearing filters restores results without those filter conditions.

Priority:

Must

Traceability:

- SPEC Feature: `F-002`
- User Flow: `UF-001`

### Feature / Epic: Component Details (F-003)

#### FR-006 — Display Component Details

Description:

WHEN the user opens a component, THE SYSTEM SHALL display the normalized specifications available for that component.

Acceptance Criteria:

- AC-FR-006-01: Opening a listed component displays its available normalized specifications.
- AC-FR-006-02: A missing specification is shown as unavailable and is not represented as zero or false.
- AC-FR-006-03: An unavailable component response displays a not-found or data-error state.

Priority:

Must

Traceability:

- SPEC Feature: `F-003`
- User Flow: `UF-002`

### Feature / Epic: Favorites (F-004)

#### FR-007 — Favorite Component

Description:

WHEN the user favorites a component, THE SYSTEM SHALL mark it as favorite and persist the change locally.

Acceptance Criteria:

- AC-FR-007-01: Favoriting a component updates its visible favorite state.
- AC-FR-007-02: The component appears in Favorites after the local write succeeds.
- AC-FR-007-03: A persistence failure is reported without crashing the application.

Priority:

Must

Traceability:

- SPEC Feature: `F-004`
- User Flow: `UF-003`

---

#### FR-008 — Unfavorite Component

Description:

WHEN the user unfavorites a component, THE SYSTEM SHALL remove it from the local favorites collection.

Acceptance Criteria:

- AC-FR-008-01: Unfavoriting updates the visible favorite state.
- AC-FR-008-02: The component is absent from Favorites after the local write succeeds.

Priority:

Must

Traceability:

- SPEC Feature: `F-004`
- User Flow: `UF-003`

### Feature / Epic: Build Management (F-005)

#### FR-009 — Create Build

Description:

WHEN the user submits a valid build name, THE SYSTEM SHALL create and persist a new build.

Acceptance Criteria:

- AC-FR-009-01: Submitting a non-empty build name creates a build visible in My Builds.
- AC-FR-009-02: A whitespace-only name is rejected and the user is told that a name is required.
- AC-FR-009-03: The created build remains available after application restart.

Priority:

Must

Traceability:

- SPEC Feature: `F-005`
- User Flow: `UF-004`

---

#### FR-010 — Rename Build

Description:

WHEN the user submits a new valid name for an existing build, THE SYSTEM SHALL persist the new name.

Acceptance Criteria:

- AC-FR-010-01: Submitting a valid new name updates the selected build in My Builds.
- AC-FR-010-02: The updated name remains after application restart.
- AC-FR-010-03: An empty or whitespace-only name is rejected.

Priority:

Must

Traceability:

- SPEC Feature: `F-005`
- User Flow: `UF-005`

---

#### FR-011 — Edit Build

Description:

WHEN the user changes components in an existing build, THE SYSTEM SHALL update the build state and derived analysis.

Acceptance Criteria:

- AC-FR-011-01: Adding, replacing, or removing a component updates the selected build state.
- AC-FR-011-02: Compatibility and power analysis are recalculated after supported changes.
- AC-FR-011-03: Saving and reopening the build restores the edited configuration.

Priority:

Must

Traceability:

- SPEC Feature: `F-005`
- User Flow: `UF-005`

---

#### FR-012 — Delete Build

Description:

WHEN the user confirms deletion, THE SYSTEM SHALL remove the selected build from local persistence.

Acceptance Criteria:

- AC-FR-012-01: Deleting a build requires an explicit confirmation.
- AC-FR-012-02: After confirmation, the build no longer appears in My Builds, including after restart.
- AC-FR-012-03: Deleting a build does not delete its components from the catalog or Favorites.
- AC-FR-012-04: Cancelling deletion leaves the build unchanged.

Priority:

Must

Traceability:

- SPEC Feature: `F-005`
- User Flow: `UF-006`

---

#### FR-013 — List Builds

Description:

WHEN the user opens My Builds, THE SYSTEM SHALL display all locally persisted builds.

Acceptance Criteria:

- AC-FR-013-01: My Builds displays every valid persisted build.
- AC-FR-013-02: An empty collection is represented by an empty state.

Priority:

Must

Traceability:

- SPEC Feature: `F-005`
- User Flow: `UF-004`, `UF-005`, `UF-006`, `UF-010`

### Feature / Epic: Build Component Selection (F-006)

#### FR-014 — Add Component to Build

Description:

WHEN the user selects Add to Build, THE SYSTEM SHALL add the component to the appropriate build slot or collection.

Acceptance Criteria:

- AC-FR-014-01: Adding a component updates the appropriate category slot or collection in the active build.
- AC-FR-014-02: The added component is still present when the saved build is reopened.

Priority:

Must

Traceability:

- SPEC Feature: `F-006`
- User Flow: `UF-004`, `UF-005`

---

#### FR-015 — Remove Component from Build

Description:

WHEN the user removes a selected component, THE SYSTEM SHALL update the build and recalculate derived analysis.

Acceptance Criteria:

- AC-FR-015-01: Removing a component removes only the selected entry from the build.
- AC-FR-015-02: Compatibility and power analysis are recalculated after removal.

Priority:

Must

Traceability:

- SPEC Feature: `F-006`
- User Flow: `UF-005`, `UF-007`

---

#### FR-016 — Support Multi-Item Categories

Description:

WHEN a category is configured as multi-item, THE SYSTEM SHALL allow multiple component entries according to category rules.

Acceptance Criteria:

- AC-FR-016-01: A configured multi-item category can contain more than one component entry.
- AC-FR-016-02: Single-item categories do not accept more than the configured quantity.
- AC-FR-016-03: Duplicate entries follow the configured category quantity rule.
- AC-FR-016-04: A build allows no more than two GPUs.
- AC-FR-016-05: Memory module count does not exceed the motherboard's available memory slots, and selected modules use the same memory component.
- AC-FR-016-06: Storage device count does not exceed the available motherboard connections for the selected device interfaces.
- AC-FR-016-07: Case fan count does not exceed supported case mounting positions; approximately ten is an upper bound only when the case supports them.

Priority:

Must

Traceability:

- SPEC Feature: `F-006`
- User Flow: `UF-007`

### Feature / Epic: Compatibility Analysis (F-007)

#### FR-017 — Evaluate Compatibility

Description:

WHEN the build changes, THE SYSTEM SHALL evaluate all applicable compatibility rules.

Acceptance Criteria:

- AC-FR-017-01: Each supported build change triggers evaluation of applicable rules.
- AC-FR-017-02: A known compatible component combination is not reported as incompatible by the evaluated rules.
- AC-FR-017-03: A known incompatible combination produces a failed rule result.

Priority:

Must

Traceability:

- SPEC Feature: `F-007`
- User Flow: `UF-008`

---

#### FR-018 — Report Compatibility Issues

Description:

WHEN a compatibility rule fails, THE SYSTEM SHALL display the affected components and an understandable explanation.

Acceptance Criteria:

- AC-FR-018-01: A failed compatibility result identifies the affected component or components.
- AC-FR-018-02: The displayed issue explains which compatibility condition failed.
- AC-FR-018-03: The build remains editable and the conflicting component is not silently removed.

Priority:

Must

Traceability:

- SPEC Feature: `F-007`
- User Flow: `UF-008`

---

#### FR-019 — Report Incomplete Analysis

Description:

WHEN required data for a compatibility rule is unavailable, THE SYSTEM SHALL identify the analysis as incomplete rather than claiming compatibility.

Acceptance Criteria:

- AC-FR-019-01: A rule missing required source data is marked incomplete.
- AC-FR-019-02: The application identifies the missing specification or explains that required data is unavailable.
- AC-FR-019-03: Incomplete analysis is not represented as confirmed compatibility.

Priority:

Must

Traceability:

- SPEC Feature: `F-007`
- User Flow: `UF-008`

### Feature / Epic: Power Estimation (F-008)

#### FR-020 — Calculate Power

Description:

WHEN the build changes, THE SYSTEM SHALL calculate estimated power from available component power data.

Acceptance Criteria:

- AC-FR-020-01: Adding, removing, or replacing a component with power data recalculates estimated consumption.
- AC-FR-020-02: The estimate uses known component power values only.
- AC-FR-020-03: Missing required power values result in an incomplete estimate, not an invented value.

Priority:

Must

Traceability:

- SPEC Feature: `F-008`
- User Flow: `UF-009`

---

#### FR-021 — Recommend PSU Capacity

Description:

WHEN sufficient power data exists, THE SYSTEM SHALL apply a fixed 30% margin to estimated maximum consumption and display the next safer standard commercial PSU capacity.

Acceptance Criteria:

- AC-FR-021-01: With sufficient power data, the displayed recommendation follows the documented safety-margin rule.
- AC-FR-021-02: The recommendation updates when relevant component selections change.
- AC-FR-021-03: The recommendation is not presented as a manufacturer certification.
- AC-FR-021-04: A 450 W estimated maximum produces a 585 W post-margin value and recommends 650 W rather than 600 W.

Priority:

Must

Traceability:

- SPEC Feature: `F-008`
- User Flow: `UF-009`

### Feature / Epic: Local Persistence (F-009)

#### FR-022 — Persist Builds Locally

Description:

WHEN a build is saved, THE SYSTEM SHALL persist it locally using the approved local storage mechanism.

Acceptance Criteria:

- AC-FR-022-01: A saved build can be loaded after the application is restarted.
- AC-FR-022-02: Previously saved builds remain available when the API is temporarily unavailable.
- AC-FR-022-03: A local persistence failure is reported without crashing the application.

Priority:

Must

Traceability:

- SPEC Feature: `F-009`
- User Flow: `UF-004`, `UF-005`, `UF-006`, `UF-010`

---

#### FR-023 — Persist Favorites Locally

Description:

WHEN a favorite changes, THE SYSTEM SHALL persist the updated favorites collection locally.

Acceptance Criteria:

- AC-FR-023-01: Favorites can be restored after application restart.
- AC-FR-023-02: Previously saved favorites remain accessible when the API is temporarily unavailable.
- AC-FR-023-03: Deleting a build does not remove a component from Favorites.

Priority:

Must

Traceability:

- SPEC Feature: `F-009`
- User Flow: `UF-003`, `UF-010`

### Feature / Epic: Optional Authentication and Cloud Persistence (F-010)

#### FR-024 — Optional Authentication

Description:

WHERE Firebase authentication is enabled and the user chooses Sign In, THE SYSTEM SHALL authenticate the user through a supported provider.

Acceptance Criteria:

- AC-FR-024-01: With Firebase enabled, a user can authenticate through a configured supported provider.
- AC-FR-024-02: Cancelling or failing authentication returns an error or local-only state without blocking core functionality.
- AC-FR-024-03: With Firebase disabled, the application does not require authentication for MVP flows.

Priority:

Could

Traceability:

- SPEC Feature: `F-010`
- User Flow: `UF-011`

---

#### FR-025 — Optional Cloud Workspace

Description:

WHEN an authenticated user has cloud synchronization enabled, THE SYSTEM SHALL load the user's cloud workspace.

Acceptance Criteria:

- AC-FR-025-01: An authenticated user with cloud synchronization enabled can load the workspace associated with their identity.
- AC-FR-025-02: A cloud loading failure is reported and local workspace functionality remains available.

Priority:

Could

Traceability:

- SPEC Feature: `F-010`
- User Flow: `UF-011`

---

#### FR-026 — Optional Workspace Synchronization

Description:

WHEN cloud synchronization is enabled, THE SYSTEM SHALL synchronize supported builds and favorites according to the documented synchronization policy.

Acceptance Criteria:

- AC-FR-026-01: Builds and favorites synchronize according to the approved policy when cloud synchronization is enabled.
- AC-FR-026-02: Conflicts follow the documented reconciliation policy and are not silently discarded.
- AC-FR-026-03: A synchronization failure is reported and does not make local-only use mandatory to abandon.

Priority:

Could

Traceability:

- SPEC Feature: `F-010`
- User Flow: `UF-011`

## 5. Non-Functional Requirements

### NFR-001 — Mobile Responsiveness

Category:

Compatibility

Description:

THE SYSTEM SHALL provide usable layouts across the supported mobile screen sizes.

Acceptance Criteria:

- AC-NFR-001-01: Core catalog, detail, build, and analysis screens can be used on each supported Android screen-size class.
- AC-NFR-001-02: At supported sizes, primary content and actions do not overlap or become unreachable due to clipping.
- AC-NFR-001-03: The application starts successfully using the documented Expo project setup.

Priority:

Must

Traceability:

- SPEC: `NFR-001`, `AC-001` to `AC-016`

### NFR-002 — Feedback States

Category:

Usability

Description:

THE SYSTEM SHALL provide visible loading, empty, success, and error states for asynchronous operations where applicable.

Acceptance Criteria:

- AC-NFR-002-01: Catalog retrieval displays loading, successful results, and empty-result states.
- AC-NFR-002-02: API, persistence, authentication, and synchronization failures display an appropriate error state where those operations are enabled.

Priority:

Must

Traceability:

- SPEC: `NFR-002`, `AC-002` to `AC-019`

### NFR-003 — Offline Local Workspace

Category:

Availability

Description:

THE SYSTEM SHALL allow previously persisted builds and favorites to remain accessible when the API is temporarily unavailable.

Acceptance Criteria:

- AC-NFR-003-01: With the API unreachable, a user can open previously saved builds and favorites.
- AC-NFR-003-02: Catalog operations show an appropriate connection error instead of preventing access to local workspace screens.

Priority:

Must

Traceability:

- SPEC: `NFR-003`, `AC-015` to `AC-019`

### NFR-004 — API Separation

Category:

Maintainability

Description:

THE SYSTEM SHALL access component catalog data through the PCForge API rather than embedding the full catalog in the mobile UI.

Acceptance Criteria:

- AC-NFR-004-01: Catalog list and detail data are obtained through the PCForge API integration.
- AC-NFR-004-02: The mobile presentation layer does not include a duplicate full component catalog.

Priority:

Must

Traceability:

- SPEC: `NFR-004`, `AC-018`

### NFR-005 — Educational Maintainability

Category:

Maintainability

Description:

THE SYSTEM SHALL maintain clear boundaries between presentation, state, data access, and domain logic so the architecture can be explained during the class.

Acceptance Criteria:

- AC-NFR-005-01: A code review can identify separate responsibilities for presentation, application state, API/local data access, and build-analysis logic.
- AC-NFR-005-02: Core flows can be explained and exercised without configuring Firebase.
- AC-NFR-005-03: The `class-start` branch can be followed from its initial state using the documented teaching steps.

Priority:

Must

Traceability:

- SPEC: `NFR-005`, `AC-017` to `AC-020`

## 6. Requirement Priority Matrix

| ID | Requirement | Type | Priority | Release |
| --- | --- | --- | --- | --- |
| FR-001 | Load Component Categories | Functional | Must | MVP |
| FR-002 | Retrieve Paginated Components | Functional | Must | MVP |
| FR-003 | Display Component List | Functional | Must | MVP |
| FR-004 | Search Components | Functional | Must | MVP |
| FR-005 | Filter Components | Functional | Must | MVP |
| FR-006 | Display Component Details | Functional | Must | MVP |
| FR-007 | Favorite Component | Functional | Must | MVP |
| FR-008 | Unfavorite Component | Functional | Must | MVP |
| FR-009 | Create Build | Functional | Must | MVP |
| FR-010 | Rename Build | Functional | Must | MVP |
| FR-011 | Edit Build | Functional | Must | MVP |
| FR-012 | Delete Build | Functional | Must | MVP |
| FR-013 | List Builds | Functional | Must | MVP |
| FR-014 | Add Component to Build | Functional | Must | MVP |
| FR-015 | Remove Component from Build | Functional | Must | MVP |
| FR-016 | Support Multi-Item Categories | Functional | Must | MVP |
| FR-017 | Evaluate Compatibility | Functional | Must | MVP |
| FR-018 | Report Compatibility Issues | Functional | Must | MVP |
| FR-019 | Report Incomplete Analysis | Functional | Must | MVP |
| FR-020 | Calculate Power | Functional | Must | MVP |
| FR-021 | Recommend PSU Capacity | Functional | Must | MVP |
| FR-022 | Persist Builds Locally | Functional | Must | MVP |
| FR-023 | Persist Favorites Locally | Functional | Must | MVP |
| FR-024 | Optional Authentication | Functional | Could | Stretch |
| FR-025 | Optional Cloud Workspace | Functional | Could | Stretch |
| FR-026 | Optional Workspace Synchronization | Functional | Could | Stretch |
| NFR-001 | Mobile Responsiveness | Non-Functional | Must | MVP |
| NFR-002 | Feedback States | Non-Functional | Must | MVP |
| NFR-003 | Offline Local Workspace | Non-Functional | Must | MVP |
| NFR-004 | API Separation | Non-Functional | Must | MVP |
| NFR-005 | Educational Maintainability | Non-Functional | Must | MVP |

## 7. Constraints

### C-001 — React Native and Expo

The mobile application is developed with React Native and Expo using TypeScript.

### C-002 — Navigation and Styling

The application uses Expo Router for navigation and React Native's styling system rather than SCSS.

### C-003 — Separate Catalog API

Component catalog data is obtained through the PCForge API; the mobile UI does not embed the full catalog. The API and mobile repositories are independently runnable.

### C-004 — Local-First Core

Builds and favorites are persisted locally so core functionality does not require authentication or cloud synchronization.

### C-005 — Optional Firebase

Firebase Authentication and Firestore are optional future extensions and their absence must not block MVP functionality.

### C-006 — Classroom Demonstration

The core demonstration should be feasible in approximately 60 to 90 minutes and remain focused on React Native concepts.

### C-007 — Initial Platform

The first release targets Android and development through Expo. Use the latest stable Expo SDK and Android SDK available at scaffold time and record their exact versions in project configuration.

### C-008 — Teaching Branches

The `main` branch contains the completed implementation and `class-start` contains the initial teaching state.

## 8. Business Rules

### BR-001 — Build Naming

A build must have a non-empty user-provided name before it can be saved.

### BR-002 — Single-Item Categories

A build contains at most one CPU, CPU cooler, motherboard, case, primary power supply, and operating system.

### BR-003 — Multi-Item Categories

A build contains up to the motherboard-supported count of memory modules, and all selected modules must be the same component. Storage devices may be added up to the motherboard-supported connections for their interfaces and do not need to be identical. Case fans may be added up to the selected case's supported mounting positions, with approximately ten as an upper bound only when supported. Configured peripherals such as monitors, sound cards, keyboards, headphones, mice, speakers, webcams, and accessories may contain multiple entries according to category rules.

### BR-004 — Video Card Quantity

A build may contain at most two video cards, and only when project compatibility rules permit the selected motherboard and configuration.

### BR-005 — Compatibility Evidence

Compatibility is evaluated from normalized component specifications and explicit project rules. Missing required data is not proof of compatibility.

### BR-006 — Power Estimate Evidence

Power estimation uses only known component power values and identifies incomplete estimates when required values are missing.

### BR-007 — PSU Recommendation

Recommended PSU capacity applies a fixed 30% margin to estimated maximum consumption and rounds up to the next safer standard commercial capacity. For example, 450 W becomes 585 W after the margin and recommends 650 W rather than 600 W. The recommendation is not presented as a manufacturer certification.

### BR-008 — Favorites Are Independent

Favorite state is independent of build membership; deleting a build does not remove its components from Favorites.

### BR-009 — Local Workspace Authority

Local persistence is authoritative while cloud synchronization is disabled. Firebase being disabled does not require the user to sign in.

## 9. Edge Cases

| ID | Scenario | Expected Behavior | Related Requirement |
| --- | --- | --- | --- |
| EC-001 | A component lacks a specification required by a compatibility rule | Mark analysis incomplete and identify unavailable data; do not claim compatibility | FR-019 |
| EC-002 | Search or filter returns no components | Show an empty state with an action to clear search or filters | FR-004, FR-005 |
| EC-003 | A duplicate component is added to a multi-item category | Apply the category's quantity rule and explain a rejected duplicate | FR-016 |
| EC-004 | Build name is empty or whitespace-only | Prevent saving and identify the required name | FR-009, FR-010 |
| EC-005 | Build contains incompatible components | Keep the build editable and show the issue; do not silently remove a component | FR-017, FR-018 |
| EC-006 | Selected components have unknown power consumption | Mark the estimate incomplete and identify missing power data | FR-020, FR-021 |
| EC-007 | Component API is unavailable | Show a catalog connection error while keeping saved builds and favorites accessible | FR-002, FR-022, FR-023 |
| EC-008 | Persisted local data is malformed or unreadable | Reject invalid data safely, record the failure, initialize a safe empty state, and do not crash | FR-022, FR-023 |
| EC-009 | Local persistence fails during a change | Report a non-blocking error where possible and retain in-memory operation | FR-007, FR-009, FR-022, FR-023 |
| EC-010 | Authentication or cloud synchronization fails | Report the failure and preserve local-only access | FR-024, FR-025, FR-026 |

## 10. Out of Scope

| ID | Excluded Item | Reason | Potential Future Release |
| --- | --- | --- | --- |
| OOS-001 | Prices and retailer/Amazon integrations | PCForge is a builder and catalog, not an ecommerce product | Won't |
| OOS-002 | Shopping carts, product purchasing, orders, and payments | Transaction processing is outside the product scope | Won't |
| OOS-003 | Real-time collaboration | Not required for the local-first MVP | Unknown |
| OOS-004 | Social profiles and public build sharing | Social features are not required for core build planning | Unknown |
| OOS-005 | Backend administration | Catalog editing is prepared outside the mobile application | Unknown |
| OOS-006 | Editing BuildCores source data from the app | Source data is normalized and maintained separately | Unknown |
| OOS-007 | Mandatory authentication and cloud synchronization | Core functionality must remain local-first | Won't |
| OOS-008 | External database setup on student devices | Local persistence supports the classroom MVP without external infrastructure | Won't |
| OOS-009 | Native ecommerce functionality | Purchasing and retailer workflows are explicitly excluded | Won't |

## 11. Traceability Matrix

| SPEC Feature | User Flow | Requirement | Acceptance Criteria | Task |
| --- | --- | --- | --- | --- |
| F-001 Component Catalog | UF-001 | FR-001, FR-002, FR-003 | AC-FR-001-01, AC-FR-002-01, AC-FR-002-04, AC-FR-002-05, AC-FR-003-01 | Not assigned |
| F-002 Search and Filtering | UF-001 | FR-004, FR-005 | AC-FR-004-01, AC-FR-005-01 | Not assigned |
| F-003 Component Details | UF-002 | FR-006 | AC-FR-006-01 | Not assigned |
| F-004 Favorites | UF-003 | FR-007, FR-008 | AC-FR-007-01, AC-FR-008-01 | Not assigned |
| F-005 Build Management | UF-004, UF-005, UF-006 | FR-009, FR-010, FR-011, FR-012, FR-013 | AC-FR-009-01, AC-FR-010-01, AC-FR-011-01, AC-FR-012-01, AC-FR-013-01 | Not assigned |
| F-006 Build Component Selection | UF-004, UF-005, UF-007 | FR-014, FR-015, FR-016 | AC-FR-014-01, AC-FR-015-01, AC-FR-016-01, AC-FR-016-04 to AC-FR-016-07 | Not assigned |
| F-007 Compatibility Analysis | UF-008 | FR-017, FR-018, FR-019 | AC-FR-017-01, AC-FR-018-01, AC-FR-019-01 | Not assigned |
| F-008 Power Estimation | UF-009 | FR-020, FR-021 | AC-FR-020-01, AC-FR-021-01, AC-FR-021-04 | Not assigned |
| F-009 Local Persistence | UF-003, UF-010 | FR-022, FR-023 | AC-FR-022-01, AC-FR-023-01 | Not assigned |
| F-010 Optional Authentication | UF-011 | FR-024, FR-025, FR-026 | AC-FR-024-01, AC-FR-025-01, AC-FR-026-01 | Not assigned |
| Cross-cutting mobile behavior | UF-001 to UF-011 | NFR-001 to NFR-005 | AC-NFR-001-01, AC-NFR-002-01, AC-NFR-003-01, AC-NFR-004-01, AC-NFR-005-01 | Not assigned |

## 12. Requirement Dependencies

| Requirement | Depends On | Reason |
| --- | --- | --- |
| FR-002 | FR-001 | Component retrieval follows selection of a supported category. |
| FR-003 | FR-002 | The list displays successfully retrieved component data. |
| FR-004, FR-005 | FR-002, NFR-004 | Search and filtering operate on API-backed catalog data. |
| FR-006 | FR-002 | Component details are opened from an available catalog component. |
| FR-007, FR-008 | FR-023 | Favorite actions update the locally persisted collection. |
| FR-009, FR-010, FR-012, FR-013 | FR-022 | Build management relies on local build persistence. |
| FR-011 | FR-014, FR-015, FR-017, FR-020 | Editing changes component selections and recalculates derived analysis. |
| FR-016 | FR-014 | Multi-item behavior extends component addition with category cardinality rules. |
| FR-018, FR-019 | FR-017 | Issue and incomplete states report the compatibility evaluation result. |
| FR-021 | FR-020 | PSU capacity is derived from estimated power when sufficient data exists. |
| FR-024 | Firebase Authentication enabled | Authentication is conditional on optional Firebase configuration. |
| FR-025 | FR-024 | Cloud workspace retrieval requires an authenticated user. |
| FR-026 | FR-025 | Workspace synchronization requires cloud workspace access and an approved conflict policy. |

## 13. Open Questions

- [NEEDS CLARIFICATION: After the OpenDB snapshot is available, which source fields support normalized display and compatibility checks?]
- [NEEDS CLARIFICATION: Which compatibility rules can be supported by the fields present in the snapshot?]
- [NEEDS CLARIFICATION: What exact storage and case-fan limits apply to each motherboard and case in the selected catalog?]
- [NEEDS CLARIFICATION: What synchronization policy will apply when local and Firestore data differ?]

## 14. Verification Strategy

Verify functional requirements with focused unit tests for catalog state, build operations, compatibility rules, and power calculations; integration tests for PCForge API requests and local persistence; and UI or end-to-end tests for browse, favorite, build management, analysis, and restart flows. Manually verify supported Android screen sizes, loading/empty/error states, API-offline local workspace access, and the classroom `class-start` workflow. Verify optional Firebase requirements only when Firebase is configured, and confirm that local MVP flows pass without it. Each acceptance criterion above is the concrete verification target; unresolved rules and the cloud synchronization policy must be decided before their related criteria can be finalized.

## 15. Related Documentation

- [SPEC.md](SPEC.md)
- [USERJOURNEY.md](USERJOURNEY.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
