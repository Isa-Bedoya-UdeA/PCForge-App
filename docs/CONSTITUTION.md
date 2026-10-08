# Project Constitution

| Field | Value |
| --- | --- |
| Project | PCForge Mobile |
| Document | Constitution |
| Version | 0.1 |
| Status | Draft |
| Last Updated | 2026-10-01 |

## 1. Purpose

This constitution defines the non-negotiable engineering principles for the PCForge Mobile repository. It governs specifications, requirements, plans, architecture, implementation, tests, and operational documentation. The repository is not scaffolded yet; these principles apply when the user creates `pcforge-app` and moves the staged documents into it.

## 2. Authority and Precedence

### Source of Truth

The constitution establishes engineering constraints. `SPEC.md` defines product behavior; `REQUIREMENTS.md` makes that behavior testable; `PLAN.md` records the approved implementation strategy; `ARCHITECTURE.md` defines module boundaries; and `AGENTS.md` defines operational workflows. `USERJOURNEY.md`, `NAVIGATIONMAP.md`, `DESIGNSYSTEM.md`, `API.md`, and security/Firebase documents refine their respective domains without silently changing product scope.

### Conflict Resolution

Do not silently resolve conflicts. Stop the affected work, identify the conflicting statements and documents, and ask the user to decide. An approved product change must update `SPEC.md` first, followed by affected requirements, plan, architecture, journey/navigation/design documentation, and implementation guidance.

---

## 3. Non-Negotiable Principles

### P-001 — Specification Authority

#### 3.1.1 Principle

Approved product specifications define user-visible behavior and scope.

#### 3.1.2 Rule

Implement only behavior traceable to approved SPEC and REQUIREMENTS. If source data, implementation, or testing reveals a missing decision or contradiction, ask the user before choosing behavior.

#### 3.1.3 Verification

Review changed screens, domain rules, and tests against the relevant feature, FR, AC, and user flow.

### P-002 — Separation of Concerns

#### 3.2.1 Principle

Domain logic, state, data access, navigation, and presentation have explicit boundaries.

#### 3.2.2 Rule

Keep compatibility and power calculations independent from React Native rendering. Screens/components do not call raw Fetch or AsyncStorage; use feature/store/service boundaries. Zustand owns shared build/favorite state, while transient UI state stays local unless it is genuinely shared.

#### 3.2.3 Verification

Review dependencies and test pure compatibility/power functions and stores without rendering UI or contacting production services.

### P-003 — Tests as a Quality Gate

#### 3.3.1 Principle

Relevant automated tests must pass before work is complete.

#### 3.3.2 Rule

Changes to build mutations, favorites, compatibility, power, persistence, API mapping, routes, or user flows require affected unit/integration/UI/E2E coverage. Do not remove or weaken tests to hide failures.

#### 3.3.3 Verification

After scaffold, run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, and `pnpm build` as applicable; use `pnpm android` for relevant Android checks. These scripts must be defined in the mobile package; they cannot run before scaffold.

### P-004 — SOLID Principles

#### 3.4.1 Principle

Apply SOLID proportionally to keep feature and service responsibilities focused.

#### 3.4.2 Rule

Use feature boundaries, focused Zustand stores, API/local persistence services, and pure domain functions. Add abstractions only for real boundaries or testability; do not add another router, state framework, DI framework, or excessive architecture ceremony.

#### 3.4.3 Verification

Review dependency direction, feature coupling, module responsibilities, and tests for domain operations independently from UI.

### P-005 — Language Convention

#### 3.5.1 Principle

Consistent language makes code, documentation, and user interaction clear.

#### 3.5.2 Rule

Write code, identifiers, comments, and technical documents in English. Communicate progress and explanations to the user in Spanish unless requested otherwise. User-facing app language follows approved product/design documentation.

#### 3.5.3 Verification

Review changed code, technical docs, and user-facing strings for consistency with this convention.

### P-006 — No Silent Scope Expansion

#### 3.6.1 Principle

Unapproved features, integrations, dependencies, or architectural changes are prohibited.

#### 3.6.2 Rule

Use React Native, Expo, TypeScript, Expo Router, React Native StyleSheet, Zustand, AsyncStorage, Fetch API, and pnpm. Keep the app local-first. Firebase Authentication and Firestore remain optional stretch features; do not enable them or define cloud reconciliation without approval.

#### 3.6.3 Verification

Review manifest, lockfile, source, and documentation diffs against SPEC, REQUIREMENTS, and ARCHITECTURE.

### P-007 — Security and Data Integrity by Default

#### 3.7.1 Principle

Security and correctness must not be weakened for convenience.

#### 3.7.2 Rule

Never embed private credentials or service-account keys in the app. Client-side checks are not authorization boundaries. Do not invent missing hardware specifications or treat missing compatibility data as proof of compatibility. Mark incomplete power/compatibility analysis honestly. Apply the fixed 30% margin and safer commercial capacity rule for PSU recommendations; do not present the result as manufacturer certification.

#### 3.7.3 Verification

Test missing-data cases, local persistence restore, errors, secret scans/configuration, compatibility outcomes, and PSU calculation examples including 450 W → 585 W → 650 W.

### P-008 — Documentation Consistency

#### 3.8.1 Principle

Implementation and product/technical documentation must remain consistent.

#### 3.8.2 Rule

When approved behavior or architecture changes, update the relevant SPEC, REQUIREMENTS, USERJOURNEY, NAVIGATIONMAP, DESIGNSYSTEM, PLAN, ARCHITECTURE, and AGENTS documents. Do not leave resolved discovery questions in the product SPEC; ask the user and record only approved decisions.

#### 3.8.3 Verification

Review requirement IDs, acceptance criteria, routes, local/cloud behavior, and technical boundaries across related documents after changes.

---

## 4. Engineering Quality Gates

| Gate | Required Condition | Verification |
| --- | --- | --- |
| Specification | User-visible behavior and boundaries are approved | SPEC and User Journey review |
| Requirements | Behavior maps to FRs and testable ACs | REQUIREMENTS traceability review |
| Architecture | UI, features, stores, services, and domain rules respect boundaries | Dependency review |
| Tests | Affected domain, service, UI, and E2E checks pass | pnpm scripts established at scaffold |
| Security | No embedded secrets; optional auth remains optional; uncertainty is explicit | Security/config review and edge-case tests |
| Documentation | Journeys, routes, design, and behavior match implementation | Cross-document review |

---

## 5. Forbidden Practices

* Use npm, Yarn, Bun, or another package manager instead of pnpm.
* Put compatibility or power calculations in UI components or move them to the API without approval.
* Access AsyncStorage or raw Fetch directly from screens/components.
* Treat missing component specifications as compatible, zero, or a fabricated value.
* Make Firebase, authentication, cloud persistence, or conflict resolution mandatory for local MVP use.
* Embed service-account credentials or weaken Firestore security rules for convenience.
* Add ecommerce, retailer, database, or social functionality without approval.

---

## 6. Exceptions

Only the user/product owner may approve an exception. Record its scope, rationale, affected principles, verification plan, and expiry/review date in the relevant decision document before implementation. An exception does not implicitly authorize unrelated changes.

## 7. Amendment Process

1. Propose the principle change with rationale and affected product/technical documents.
2. Obtain explicit user approval and update this constitution's version and status if changed.
3. Propagate the approved change to SPEC, REQUIREMENTS, PLAN, ARCHITECTURE, USERJOURNEY, NAVIGATIONMAP, DESIGNSYSTEM, AGENTS, and tests as applicable; review for conflicts.

---

## 8. Related Documentation

* [AGENTS.md](AGENTS.md)
* [SPEC.md](SPEC.md)
* [REQUIREMENTS.md](REQUIREMENTS.md)
* [ARCHITECTURE.md](ARCHITECTURE.md)
* [USERJOURNEY.md](USERJOURNEY.md)
