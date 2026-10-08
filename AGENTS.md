# AGENTS.md

## 1. Project Context

### Purpose

This repository contains PCForge Mobile, a local-first React Native application for discovering PC components and creating, analyzing, and saving builds. The app uses Expo, TypeScript, Expo Router, React Native StyleSheet, Zustand, AsyncStorage, Fetch API, and pnpm. Firebase Authentication and Firestore are optional stretch integrations.

This root file is the single agent-instructions source for the repository. Project documentation is stored under `docs/`.

### Source of Truth Hierarchy

1. `docs/CONSTITUTION.md` — non-negotiable engineering principles.
2. `docs/SPEC.md` — product behavior and scope.
3. `docs/REQUIREMENTS.md` — testable requirements and acceptance criteria.
4. `docs/PLAN.md` — approved implementation strategy.
5. `docs/ARCHITECTURE.md` — architectural structure and decisions.
6. `AGENTS.md` — operational instructions for agents.

If these documents conflict with the approved stack or each other, report the conflict and ask before changing behavior or architecture.

---

## 2. Required Documentation Before Coding

Before modifying code, read the following repository documents when present:

- [ ] `docs/CONSTITUTION.md`
- [ ] `docs/SPEC.md`
- [ ] `docs/REQUIREMENTS.md`
- [ ] `docs/PLAN.md`
- [ ] `docs/ARCHITECTURE.md`
- [ ] `docs/USERJOURNEY.md`
- [ ] `docs/NAVIGATIONMAP.md`
- [ ] `docs/DESIGNSYSTEM.md`
- [ ] `docs/API.md` for catalog requests, data models, or API error handling
- [ ] `docs/SECURITY.md` for authentication, secrets, permissions, or cloud behavior
- [ ] `docs/FIRESTORE.md` only for an explicitly approved Firebase/Firestore change
- [ ] `docs/DEPLOY.md` when build, release, or deployment behavior is involved
- [ ] `README.md`

Do not invent decisions when a document is absent. Keep changes within the approved product and architecture documents and surface unresolved decisions before implementation depends on them.

### Expo and React Native API Documentation

Expo and React Native APIs can change between SDK releases. Before changing code that uses Expo, EAS, or React Native APIs:

1. Read the installed `expo` version from `package.json`.
2. Consult the matching versioned Expo documentation. This checkout currently uses Expo SDK 57, so its documentation is at `https://docs.expo.dev/versions/v57.0.0/`.
3. For unresolved Expo-specific questions, consult `https://docs.expo.dev/llms.txt` and follow its links to the relevant official page. Do not rely on remembered API behavior when versioned documentation is available.
4. Verify third-party/native module compatibility with the installed Expo SDK before adding or changing it.

---

## 3. Development Environment

| Item | Value |
| --- | --- |
| Runtime | Node.js, Expo SDK 57, React Native 0.86 |
| Package Manager | pnpm only |
| Language | TypeScript |
| Framework | React Native with Expo |
| Navigation | Expo Router; routes are in `src/app/` |
| IDE | VS Code |
| Build System | Expo CLI; no production build or deployment workflow is configured |

The separate API is a Node.js/TypeScript Express 5 service. Keep the repositories independent; do not turn them into a monorepo or pnpm workspace without approval. Use pnpm for all package operations; do not use npm, npx, Yarn, or Bun.

---

## 4. Canonical Commands

Use only commands supported by the current package or the local Expo CLI. Do not invent package scripts.

### Install

```bash
pnpm install
```

### Development

```bash
pnpm start
```

### Android

```bash
pnpm android
```

### Lint

```bash
pnpm lint
```

### Type Check / Static Analysis

```bash
pnpm exec tsc --noEmit
```

### Tests

Jest and `jest-expo` are installed, but no test script or test files are currently configured. Once tests exist, run:

```bash
pnpm exec jest --preset jest-expo
```

### Expo Diagnostics

```bash
pnpm dlx expo-doctor
```

### Expo-Compatible Dependencies

```bash
pnpm exec expo install <package>
```

Use this command instead of `pnpm add` for Expo/React Native native modules so Expo can select SDK-compatible versions. Use `pnpm exec expo install --fix` only when intentionally repairing SDK dependency versions.

No formatter, E2E, production build, or deployment script is configured in `package.json`. Do not document or run one as if it existed. Production/EAS builds are outside current scope and require explicit approval.

---

## 5. Coding Style

### Language

- Code, identifiers, comments, and technical documentation: English.
- User-facing app text: follow approved product/design documentation.
- User-facing progress and explanations: Spanish unless the user requests another language.
- Do not add comments that merely narrate code; explain only non-obvious decisions.

### Naming

- Variables, functions, and hooks: `camelCase`; hooks use the `use` prefix.
- React components, classes, and types: `PascalCase`.
- Expo Router route files: follow file-based routing conventions and preserve established route names.
- Stores and services: use established `*.store.ts` and `*.service.ts` naming where applicable.
- Tests: follow the test framework and naming conventions established by the repository.

### Quotes

- Follow configured lint/format rules.
- If no quote rule exists, preserve the surrounding file's style and do not reformat unrelated code.

### Imports and Routing

- Follow configured TypeScript module resolution and import ordering.
- Use Expo Router for navigation. Routes live in `src/app/`; `_layout.tsx` files define navigators. Keep non-route components, hooks, and utilities outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router` when needed.
- Keep routes/screens separate from feature logic, state, domain functions, and infrastructure.
- Do not import private internals across features or create circular dependencies.

### Error Handling

- Normalize API and persistence errors in services before they reach presentation components.
- Render explicit loading, empty, success, and error states for asynchronous operations where applicable.
- Keep catalog failures from hiding persisted builds and favorites.
- Treat missing component data as incomplete analysis, never as compatibility or an invented power value.
- Do not show raw exceptions, secrets, or internal implementation details to users.
- Avoid stale or reordered persistence writes; serialize updates through the approved store/service boundary where necessary.

### Logging

- Use the project's approved diagnostics mechanism.
- Do not log secrets, tokens, full private configuration, or unnecessary user data.
- Never rely on client-side authorization checks as a security boundary.

---

## 6. Architecture and Implementation Rules

- Follow the feature-based architecture: `src/app/` routes, reusable `src/components/`, product `src/features/`, shared `src/stores/`, `src/services/`, domain `src/types/`, pure `src/utils/`, and stable `src/constants/`.
- Keep dependencies directed from screens/features toward services and domain logic; keep domain calculations independent from React Native rendering.
- Use Zustand for cross-screen build and favorite state. Keep transient search/filter/form state local unless genuinely shared.
- Access AsyncStorage only through the storage service/repository boundary. UI components and stores must not call AsyncStorage directly.
- Access the PCForge API through the API/service boundary using Fetch API. UI components must not call raw `fetch` directly.
- Keep compatibility and power calculations custom, deterministic, and independently testable; do not move them to the API or add a third-party compatibility engine.
- Keep API response models separate from mobile domain/view models when mapping is necessary.
- Use React Native `StyleSheet`. Do not introduce SCSS or a replacement styling framework.
- AsyncStorage is the MVP source of truth for builds and favorites. Restore valid data or a safe empty state if stored data is malformed.
- Firebase Authentication and Firestore are optional stretch integrations. Use them only for an explicitly approved task and keep local-only operation functional.
- Do not implement cloud reconciliation until a synchronization/conflict policy is approved. Never silently overwrite conflicting local/cloud state.
- If `ios/` or `android/` directories are absent, follow Continuous Native Generation: configure native behavior through `app.json` and config plugins; do not create or edit native directories by hand.
- Expo Go contains only bundled native modules. A newly added native dependency may require an Android development build using `pnpm exec expo run:android`; check the SDK-versioned docs first.
- Agents must follow approved architecture and must not introduce patterns without approval.

---

## 7. Dependency Rules

### Allowed

- The approved stack: React Native, Expo, TypeScript, Expo Router, React Native StyleSheet, Zustand, AsyncStorage, and Fetch API.
- Firebase Authentication/Firestore only for an explicitly approved optional feature.
- Small test, accessibility, or validation tools compatible with the installed Expo SDK and approved plan.
- pnpm as the sole package manager.

### Prohibited

- npm, npx, Yarn, Bun, or a second package manager/workspace tool.
- Another global state library, competing router, or styling replacement without approval.
- SCSS or a database client in the mobile app.
- Mandatory Firebase, authentication, or cloud sync for core functionality.
- Backend catalog duplication, ecommerce, retailer, payment, or social integrations.

### Adding Dependencies

Before adding a dependency:

1. Check whether React Native, Expo, TypeScript, Zustand, AsyncStorage, Fetch, or an existing package provides the capability.
2. Check compatibility against the installed Expo SDK's versioned documentation.
3. Review maintenance, license, security, bundle, native-module, and classroom setup impact.
4. Obtain user approval before expanding the stack or adding a major dependency.
5. Install with pnpm. Use `pnpm exec expo install <package>` for Expo/native packages and never edit `pnpm-lock.yaml` manually.

---

## 8. File and Directory Boundaries

### May Modify Freely

- `src/app/**` for requested routes and screen composition.
- `src/components/**`, `src/features/**`, `src/stores/**`, `src/services/**`, `src/types/**`, `src/utils/**`, and `src/constants/**` for changes within the approved architecture.
- Relevant tests and `docs/**` when a requested change requires them.

### Modify With Caution

- `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `app.json`, and test/lint configuration.
- Expo Router routes and deep-link behavior.
- Persisted workspace shape, AsyncStorage keys, and restore behavior.
- Compatibility rules, power calculations, normalized API models, and category quantity rules.
- Firebase adapters, auth state, Firestore security rules, and synchronization behavior.
- API base URL configuration; it is not a secret.

### Do Not Modify Without Explicit Approval

- Product scope, requirement priorities, API contract, compatibility rules, PSU margin, or category limits.
- Firebase enablement/provider, cloud reconciliation policy, or Firebase security boundaries.
- Native project files under `ios/` or `android/` when using Continuous Native Generation; use Expo config/plugins instead.
- Project name, repository metadata, or deployment targets unrelated to the task.

### Generated Files

- Do not hand-edit `.expo/**`, generated route types, build/export output, coverage output, or generated declarations.
- Do not hand-edit the pnpm lockfile; update it through pnpm after an approved manifest change.
- Preserve generated files already present unless a task explicitly concerns them.

### Secrets

- Never commit private keys, service-account files, tokens, passwords, or production credentials.
- Keep example environment/configuration files limited to safe placeholders.
- Firebase client configuration does not replace Firestore security rules. Never embed service-account credentials in the app bundle.
- Do not print secrets in logs, errors, screenshots, or documentation.

---

## 9. Communication Rules

- Communicate with the user in Spanish unless asked otherwise.
- Write code identifiers and technical documentation in English.
- Report progress before substantial edits and identify checks that cannot run because scripts/tests are not configured.
- Ask when a request would resolve an open product/domain decision or expand the approved stack; do not ask about decisions already documented.

---

## 10. Scope Rules

Agents must not:

- add unrequested features or change approved requirements silently
- replace React Native, Expo, TypeScript, Expo Router, StyleSheet, Zustand, AsyncStorage, Fetch, or pnpm without approval
- make Firebase, cloud synchronization, or authentication mandatory
- invent component specifications, compatibility rules before OpenDB inspection, or per-board/per-case quantity limits unsupported by the snapshot
- change the fixed 30% PSU margin or safer commercial capacity rule without explicit approval
- invent local/cloud conflict-resolution behavior before a synchronization policy is approved
- weaken error handling, local persistence, or Firestore security controls for convenience
- remove tests to make a suite pass or claim checks that were not run
- use EAS/deployment commands unless deployment is explicitly approved

---

## 11. Verification and Definition of Done

Before considering a code task complete:

- [ ] `pnpm lint` passes.
- [ ] `pnpm exec tsc --noEmit` passes.
- [ ] Relevant Jest tests pass when tests are present/configured.
- [ ] Android development checks pass when affected and an emulator/device is available.
- [ ] Expo Doctor is run with `pnpm dlx expo-doctor` when dependency/configuration changes warrant it.
- [ ] Firebase remains absent from core verification unless the task explicitly implements that optional integration.
- [ ] Changed behavior matches `docs/SPEC.md`, `docs/REQUIREMENTS.md`, `docs/USERJOURNEY.md`, and `docs/NAVIGATIONMAP.md`/`docs/DESIGNSYSTEM.md` where applicable.
- [ ] No unrelated changes, embedded credentials, or unapproved dependencies were introduced.
- [ ] Documentation and acceptance criteria were updated when behavior changed.

### Required Verification Command

```bash
pnpm lint && pnpm exec tsc --noEmit
```

Run the relevant Jest command separately when tests are present. This repository currently has no configured test script or test files.

### If Verification Fails

Do not declare the task complete. Report the command, failure, affected area, whether it appears related to the change, checks that could not run, and the next required action.

---

## 12. Agent Workflow

1. Read the required documentation and identify unresolved product/domain decisions.
2. Inspect the relevant source, package scripts, and existing tests.
3. For Expo/React Native APIs, verify the installed SDK and consult its official versioned documentation.
4. Map the change to requirement IDs and user-flow acceptance criteria.
5. Implement the smallest compliant change within approved feature/service boundaries.
6. Run applicable pnpm checks and report any unavailable test/build coverage.
7. Review the diff for state ownership, API boundaries, persistence behavior, secrets, and unrelated edits.
8. Update documentation when product behavior, routes, data shape, or operations change.
9. Report the result and verification status.
