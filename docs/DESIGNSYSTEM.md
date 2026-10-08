# Design System

## 1. Purpose

The PCForge Mobile Design System establishes a coherent, accessible, and modern visual language for the PCForge React Native application. It unifies UI tokens, typography, component hierarchies, spacing, rounded shapes, subtle elevations, and dark/light mode themes to ensure a premium hardware planning experience for PC builders and learners.

This specification serves as the single source of truth for all visual presentation across mobile platforms (Android, iOS) and web previews, adhering to the non-negotiable principles defined in [CONSTITUTION.md](CONSTITUTION.md) and the user journeys in [USERJOURNEY.md](USERJOURNEY.md).

## 2. Design Principles

### 2.1 Clarity First

Hardware specifications, compatibility warnings, and power metrics must be immediately legible. Information density is carefully balanced with generous whitespace, crisp contrast, and unmistakable status signifiers so users can evaluate complex component constraints without cognitive fatigue.

### 2.2 Visual Hierarchy

Critical build signals—such as system wattage and compatibility errors—take visual precedence. Clear typographical scales, high-contrast badges, distinct card elevations, and deliberate accent colors direct the user's attention from high-level summaries down to granular technical specifications.

### 2.3 Progressive Disclosure

Initial card views display only high-impact component specs (e.g., socket, core count, memory capacity, TDP). Comprehensive technical sheets, interface listings, and physical dimension charts are nested within expandable sections and dedicated detail screens, preventing visual clutter while keeping complete data accessible.

### 2.4 Additional Principles

* **Modern Tactile Aesthetics:** Soft rounded contours, subtle layered shadows, and translucent backdrop blurs evoke a sleek, modern desktop and mobile computing hardware feel.
* **Dark Theme Centric:** Designed dark-mode first to match enthusiast PC culture, reduced eye strain in low-light environments, and vivid contrast for status indicators.
* **Honest Feedback:** Warning and incomplete-analysis states are visually distinct from both verified compatibility and critical errors. The UI never masks uncertainty.

## 3. Design System Structure

### 3.1 Platform

* **Primary Runtime:** React Native 0.86+ via Expo SDK 57.
* **Platforms Supported:** Android (Material 3 influenced, hardware back navigation), iOS (Cupertino gestures, fluid springs), Web (responsive container capped at 800px max width).
* **Styling Technology:** Native React Native `StyleSheet.create` utilizing centralized design tokens from `src/constants/theme.ts`.

### 3.2 Directory Structure

```text
src/
├── constants/
│   ├── theme.ts                 # Primitive color tokens, semantic mappings, spacing, shadows
│   └── categories.ts            # Hardware category metadata and visual badges
├── components/
│   ├── atoms/                   # Indivisible primitive components
│   │   ├── themed-text.tsx      # Typography wrapper with tokenized variants
│   │   ├── themed-view.tsx      # Container primitive responding to active theme
│   │   └── loading-skeleton.tsx # Shimmering skeleton loader
│   ├── molecules/               # Composed UI units with focused single roles
│   │   ├── spec-row.tsx         # Tabular spec key-value row with units
│   │   ├── hint-row.tsx         # Contextual hint row with badge
│   │   ├── error-view.tsx       # Standardized error presentation with retry
│   │   └── empty-view.tsx       # Zero-state illustration and action trigger
│   ├── organisms/               # Complex domain-aware UI compositions
│   │   ├── component-card.tsx   # Catalog item card with spec chips and favorite toggle
│   │   ├── compatibility-banner.tsx # Dynamic status banner (Valid / Warning / Error)
│   │   ├── power-summary.tsx    # Interactive wattage gauge and PSU recommendation
│   │   └── slot-item.tsx        # Hardware slot row with add/replace/remove actions
│   ├── ui/
│   │   └── collapsible.tsx      # Expandable accordion view
│   └── app-tabs.tsx             # Custom bottom navigation bar with translucent blur
```

### 3.3 Ownership Rules

* Design tokens in `src/constants/theme.ts` are foundational and must never import React components.
* Atoms in `src/components/atoms/` depend only on tokens and React Native core; they do not access application state or network services.
* Molecules in `src/components/molecules/` compose atoms for reusable UI interactions without direct store coupling.
* Organisms in `src/components/organisms/` consume domain types and dispatch store actions or accept callbacks through typed component props.

## 4. Color System

The palette features a signature cyber-tech aesthetic anchored by primary sky blue (`#91CFFF`), secondary soft violet (`#8786E8`), tertiary neon blush (`#FF98BB`), and a deep twilight navy background (`#0F2940`).

### 4.1 Light Theme

| Category | Token | Hex | Usage |
|---|---|---|---|
| Brand Primary | `primary` | `#0284C7` | Key interactive buttons, active tab indicators, links |
| Brand Primary Light | `primaryLight` | `#E0F2FE` | Selected chip backgrounds, subtle primary badges |
| Brand Secondary | `secondary` | `#6366F1` | Secondary actions, category pills, accent highlights |
| Brand Tertiary | `tertiary` | `#EC4899` | Favorited state, heart icons, special callouts |
| Surface Canvas | `background` | `#F8FAFC` | Primary app screen background |
| Surface Elevated | `surface` | `#FFFFFF` | Component cards, modal sheets, bottom navigation |
| Surface Subdued | `surfaceSubdued` | `#F1F5F9` | Inner spec table rows, search input containers |
| Border Default | `border` | `#E2E8F0` | Card dividing lines, input outlines |
| Text Primary | `text` | `#0F2940` | Main headings, component titles, spec values |
| Text Secondary | `textSecondary` | `#475569` | Spec labels, manufacturer tags, metadata |
| Text Muted | `textMuted` | `#94A3B8` | Placeholder text, disabled labels |
| Status Success | `success` | `#16A34A` | Compatible status badges, power within limits |
| Status Warning | `warning` | `#D97706` | Incomplete data warnings, advisory notes |
| Status Error | `error` | `#DC2626` | Incompatible socket/dimension alerts, errors |
| Status Info | `info` | `#0284C7` | Informational tooltips, guidance notes |

### 4.2 Dark Theme

| Category | Token | Hex | Usage |
|---|---|---|---|
| Brand Primary | `primary` | `#91CFFF` | Active buttons, primary focus rings, key accents |
| Brand Primary Light | `primaryLight` | `#163854` | Primary chip fills, selection background tints |
| Brand Secondary | `secondary` | `#8786E8` | Secondary action buttons, tags, category accents |
| Brand Tertiary | `tertiary` | `#FF98BB` | Active favorite heart icons, highlight badges |
| Surface Canvas | `background` | `#0F2940` | Root background across screens and navigation |
| Surface Elevated | `surface` | `#163854` | Component cards, slot containers, modal panels |
| Surface Subdued | `surfaceSubdued` | `#1D4666` | Search bar fill, inner table rows, inactive chips |
| Border Default | `border` | `#235377` | Subtle card borders, divider lines |
| Text Primary | `text` | `#F8FAFC` | High-emphasis headings, component names, values |
| Text Secondary | `textSecondary` | `#94A3B8` | Spec parameter labels, subtle helper strings |
| Text Muted | `textMuted` | `#64748B` | Search placeholders, inactive icons, timestamps |
| Status Success | `success` | `#4ADE80` | High-contrast compatible indicators |
| Status Warning | `warning` | `#FBBF24` | Incomplete specification warnings, cautions |
| Status Error | `error` | `#F87171` | Socket mismatch badges, physical collision alerts |
| Status Info | `info` | `#91CFFF` | Analysis notes, general tips |

### 4.3 Color Rules

* **Contrast Ratios:** All body text and critical labels maintain a minimum 4.5:1 contrast ratio against their respective surface backgrounds.
* **Never Color Alone:** Status alerts (Success, Warning, Error) always combine color fills with iconography and descriptive text.
* **Surface Elevation:** Depth is communicated by brightening dark surfaces from `#0F2940` (canvas) to `#163854` (card) to `#1D4666` (inner control), rather than harsh outlines.

## 5. Typography

The system utilizes clean system sans-serif typography for native clarity and zero bundle overhead.

| Font | Use | Weight | Size | Line Height |
|---|---|---|---:|---:|
| Display | App branding, large empty state titles | Bold (`700`) | 28px | 34px |
| Title 1 | Screen headers, build detail hero | Bold (`700`) | 22px | 28px |
| Title 2 | Section headers, card titles | Semi-Bold (`600`) | 18px | 24px |
| Title 3 | Metric headings, modal titles | Semi-Bold (`600`) | 16px | 22px |
| Body | Component descriptions, spec values | Regular (`400`) | 14px | 20px |
| Body Medium | Interactive button text, filter chips | Medium (`500`) | 14px | 20px |
| Caption | Spec labels, timestamps, secondary tags | Regular (`400`) | 12px | 16px |
| Caption Bold | Status badges, category labels | Bold (`700`) | 11px | 14px |
| Code / Monospace | Model numbers, part IDs, wattage figures | Medium (`500`) | 13px | 18px |

### Typography Rules

* Long component titles must wrap naturally up to 2 lines before truncating with an ellipsis.
* Numerical metrics (wattage, socket pins, clock speeds) use monospace or tabular numbers to prevent layout jitter during live calculations.

## 6. Spacing

Spacing is calculated on a standard 4px / 8px scale.

| Token | Value | Typical Usage |
|---|---:|---|
| xxs | 2px | Micro badge padding, hairline separators |
| xs | 4px | Chip internal padding, spec label-value gap |
| sm | 8px | Grid item spacing, card internal elements gap |
| md | 16px | Standard card padding, list item gaps |
| lg | 24px | Screen edge margins, section breaks |
| xl | 32px | Major screen segment spacing, modal headers |
| xxl | 48px | Empty view vertical offsets, hero banners |

### Layout Tokens

* **Screen Margin:** 16px on mobile portrait; 24px on tablets.
* **Card Padding:** 16px internal padding.
* **Bottom Bar Inset:** 80px on Android; 50px on iOS (to clear gesture pill).
* **Max Container Width:** 800px (centered on web and tablet landscape).

### Touch Targets

* All tappable elements (buttons, filter chips, list rows, favorite icons) enforce a minimum touch area of **44 × 44 dp** on iOS and **48 × 48 dp** on Android to meet mobile accessibility standards.

## 7. Shapes

Soft, friendly rounded geometries are applied consistently across surfaces.

| Token | Value | Usage |
|---|---:|---|
| none | 0px | Full-bleed screen backgrounds, raw dividers |
| sm | 6px | Small tags, micro badges, spec table cells |
| md | 10px | Input fields, category filter chips, secondary buttons |
| lg | 16px | Component cards, modal sheets, banner widgets |
| xl | 24px | Floating action containers, bottom sheet headers |
| full | 9999px | Circular icon buttons, pill buttons, avatar containers |

### Component Shape Rules

* Nested elements must follow concentric radius rules: an inner element's radius should equal the outer container's radius minus the padding (e.g., card radius 16px with 8px padding gives child button radius 8px).
* Badges and category selector chips always use `full` (pill shape) to distinguish them from rectangular cards.

### Elevation and Shadows

Subtle, diffused shadows provide depth without visual noise:

* **Level 1 (Subtle Cards):**
  * Android: `elevation: 2`
  * iOS/Web: `shadowColor: '#000'`, `shadowOffset: { width: 0, height: 2 }`, `shadowOpacity: 0.15`, `shadowRadius: 6`
* **Level 2 (Floating Action / Modals):**
  * Android: `elevation: 6`
  * iOS/Web: `shadowColor: '#000'`, `shadowOffset: { width: 0, height: 4 }`, `shadowOpacity: 0.25`, `shadowRadius: 12`

## 8. Icons

### Icon Family

* Standard vector icons provided by `@expo/vector-icons` (`Ionicons` and `MaterialCommunityIcons`).
* Interactive animated icons provided by `src/components/animated-icon.tsx`.

### Icon Sizes

| Token | Size | Usage |
|---|---:|---|
| icon-xs | 14px | Inline spec indicators (e.g., fan count, slot icons) |
| icon-sm | 18px | Chip prefix icons, secondary button icons |
| icon-md | 24px | Tab bar items, card action buttons, search icon |
| icon-lg | 32px | Modal close buttons, status banners |
| icon-xl | 48px | Empty state illustrations, error view headers |

### Icon Rules

* Icons must always maintain semantic tint matching their context (`primary`, `tertiary` for favorites, status colors for alerts).
* Interactive icon buttons without text must specify an `accessibilityLabel`.

## 9. Component Catalog

### Structure

```text
src/components/
├── common/
│   ├── ThemedText
│   ├── ThemedView
│   ├── LoadingSkeleton
│   ├── ErrorView
│   └── EmptyView
├── catalog/
│   ├── ComponentCard
│   ├── SpecRow
│   └── CategoryPill
└── build/
    ├── CompatibilityBanner
    ├── PowerSummary
    └── SlotItem
```

### Naming

PascalCase for React components, kebab-case for component file names (e.g., `component-card.tsx` exports `ComponentCard`).

### Catalog

| Component | Category | Purpose | Variants | States |
|---|---|---|---|---|
| `ThemedText` | Typography | Themed text rendering | display, title1, title2, body, caption, code | default, muted, accent |
| `ThemedView` | Container | Surface container with background | default, surface, elevated, subdued | default |
| `ComponentCard` | Catalog | Displays hardware component in list | compact, detailed | idle, pressed, favorited |
| `SpecRow` | Catalog | Displays formatted spec attribute | default, striped | default |
| `CategoryPill` | Catalog | Category selector button | default | inactive, active |
| `CompatibilityBanner` | Build | Summarizes compatibility health | valid, warning, error | expanded, collapsed |
| `PowerSummary` | Build | Shows wattage gauge and PSU tier | default, compact | normal, incomplete-data |
| `SlotItem` | Build | Represents component slot in build | empty, populated | idle, pressed |
| `LoadingSkeleton` | Feedback | Shimmering card placeholder | card, detail, text | animating |
| `ErrorView` | Feedback | Displays error with retry option | fullscreen, inline | idle, retrying |
| `EmptyView` | Feedback | Visual placeholder for zero items | default | idle |

## 10. Component Specifications

### Buttons

| Property | Specification |
|---|---|
| Name | PrimaryButton, SecondaryButton, IconButton |
| Height | 48px (Primary/Secondary), 44px (Compact) |
| Radius | 10px (`md`) or 9999px (`full` for pill buttons) |
| Variants | `primary` (Filled `#91CFFF`), `secondary` (Filled `#1D4666`), `outline` (Bordered `#235377`), `ghost` (Transparent) |
| States | Default, Pressed (`opacity: 0.75`), Disabled (`opacity: 0.4`), Loading (ActivityIndicator) |

#### Rules

* Primary buttons use `#0F2940` text on `#91CFFF` background for maximum contrast.
* Secondary buttons use `#F8FAFC` text on `#163854` background.

### Inputs

| Property | Specification |
|---|---|
| Name | SearchInput, FormInput |
| Height | 44px (Search), 48px (Form input) |
| Radius | 10px (`md`) |
| Surface | `#163854` in dark mode, `#FFFFFF` in light mode |
| Border | 1px solid `#235377` (Dark), `#E2E8F0` (Light); 2px `#91CFFF` on focus |

#### Rules

* Search input includes a clear button (`icon-sm`) when text is present.
* Input borders transition smoothly to brand primary `#91CFFF` when focused.

### Cards

| Property | Specification |
|---|---|
| Name | ComponentCard, BuildCard |
| Surface | `#163854` (Dark), `#FFFFFF` (Light) |
| Radius | 16px (`lg`) |
| Padding | 16px (`md`) |
| Border | 1px solid `#235377` (Dark), `#E2E8F0` (Light) |
| Shadow | Elevation 2, subtle blur radius 6px |

#### Rules

* Cards feature subtle press feedback via `opacity: 0.9` or micro-scale transition.
* High-priority information is positioned in top-left (title) and top-right (status/favorite badge).

### Navigation

| Property | Specification |
|---|---|
| Name | AppTabs (Bottom Navigation Bar) |
| Height | 64px + device bottom safe area inset |
| Surface | Translucent glass blur (`#0F2940CC` dark, `#FFFFFFAA` light) |
| Border | Top border 1px solid `#235377` |
| Active Color | `#91CFFF` with glowing accent pill |
| Inactive Color | `#64748B` |

### Feedback

| Property | Specification |
|---|---|
| Name | CompatibilityBanner |
| Radius | 12px (`md`) |
| Padding | 14px (`md`) |
| Compatible | Background `#16A34A20`, Border `#16A34A60`, Text `#4ADE80` |
| Warning | Background `#D9770620`, Border `#D9770660`, Text `#FBBF24` |
| Error | Background `#DC262620`, Border `#DC262660`, Text `#F87171` |

## 11. Responsive Layout

| Breakpoint / Size Class | Range | Behavior |
|---|---|---|
| Compact (Phone Portrait) | < 600px | Single-column list, full-width cards, bottom tab navigation |
| Medium (Phone Landscape / Small Tablet) | 600px - 840px | Two-column catalog grid, expanded spec rows |
| Expanded (Tablet / Web Preview) | > 840px | Two-column layout (slots on left, live analysis on right), max content width 800px centered |

### Layout Rules

* Use Flexbox with `flexGrow: 1` and responsive percentage/aspect-ratio images.
* Never use hardcoded pixel widths for full-width cards; rely on container margins.

## 12. Accessibility

* **Screen Readers:** All interactive icons include `accessibilityLabel` and `accessibilityRole="button"`.
* **Dynamic Type:** All text components respect system font scaling without breaking card layouts or overlapping sibling elements.
* **Color Blindness Support:** Status indicators always pair color with distinctive iconography:
  * Compatible: Checkmark circle (`checkmark-circle`)
  * Warning: Alert triangle (`alert-circle`)
  * Error: Ban / close circle (`close-circle`)
* **Touch Target Sizing:** Minimum 44 × 44 dp touch targets across all interactive controls.

## 13. Component Naming Convention

* **Files:** kebab-case matching the component name (e.g., `power-summary.tsx`).
* **Components:** PascalCase (e.g., `PowerSummary`).
* **Props Interfaces:** ComponentName + `Props` (e.g., `PowerSummaryProps`).
* **Style Objects:** `styles` defined via `StyleSheet.create` at the bottom of the file.

## 14. Design-to-Code Rules

* Never write raw hex color literals in component files. Always import `Colors` from `@/constants/theme`.
* Never write arbitrary pixel padding/margin literals. Always use `Spacing` tokens (`xs`, `sm`, `md`, `lg`).
* Use `BorderRadius` tokens from `theme.ts` for all corner radii.
* Reusable components must support dynamic light/dark theming via the `useTheme()` hook.

## 15. Component Definition of Done

* [x] Purpose and ownership are clear.
* [x] Existing tokens and components were considered.
* [x] Approved design tokens (`#91CFFF`, `#8786E8`, `#FF98BB`, `#0F2940`) are strictly utilized.
* [x] Component variants and interaction states (idle, pressed, disabled) are defined.
* [x] Responsive layout and safe area handling are specified.
* [x] Accessibility touch targets (44dp+) and labels are implemented.
* [x] Naming follows kebab-case files and PascalCase components.
* [x] Visual verification in light and dark mode is complete.
* [x] Documentation in `DESIGNSYSTEM.md` is complete and synchronized.

## 16. Design System Scope

### In Scope

* Complete color system with light and dark mode palettes.
* Typography scale, monospace metric conventions, and spacing tokens.
* Rounded corner shape tokens (`6px` to `9999px`) and elevation shadow styles.
* Touch target rules and responsive container specifications.
* Component specifications for cards, buttons, inputs, tabs, and analysis widgets.
* Accessibility standards for screen readers and high contrast.

### Out of Scope

* Custom third-party styling frameworks (NativeWind, Tailwind, styled-components).
* Ecommerce elements (shopping cart badges, price tags, checkout buttons).
* Complex multi-step animation timelines.

### Future

* Tablet dual-pane master-detail optimization.
* Custom PC component wireframe illustrations.
* Sound feedback on slot component snap-in.

## 17. References

* [Android Accessibility Guidelines](https://developer.android.com/guide/topics/ui/accessibility)
* [Material Design 3 Specifications](https://m3.material.io/)
* [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
* [MDN Responsive Mobile Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
