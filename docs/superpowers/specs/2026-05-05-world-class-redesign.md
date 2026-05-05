# AfyaCare Tanzania — World-Class Redesign Spec
**Date:** 2026-05-05  
**Status:** Approved for implementation  
**Scope:** Critical bug fixes + full patient-facing redesign + design system applied across all roles

---

## 1. Context & Goals

AfyaCare Tanzania is a React/TypeScript/Vite + Supabase health app for Tanzania and East Africa. It serves four roles: Patient, CHW (Community Health Worker), Clinician, and Admin. The codebase has 106+ components and is ~95% feature-complete but has critical infrastructure bugs that prevent production deployment, and the UI needs a world-class redesign to be the best accessible mobile health app in East Africa.

**Goals:**
1. Fix all critical and high bugs surfaced in the brute audit so the app actually works in production
2. Apply a unified True Fusion design system across all screens
3. Deliver world-class mobile UX with refined animations and full accessibility
4. Maintain TMDA/PDPA compliance, offline-first capability, and Kiswahili-first i18n

---

## 2. Design Language

### 2.1 Visual Direction — True Fusion (50% Clinical Serenity / 50% Vibrant Africa)

The app blends the trustworthy precision of clinical software with the energy and cultural resonance of East African design.

**Primary palette:**
```
Navy Deep:    #1e1b4b   (hero backgrounds, primary text)
Indigo:       #6366f1   (primary actions, badges, nav active)
Orange:       #f97316   (brand accent, CTAs, warnings)
Green:        #10b981   (success, medication taken, safe status)
Amber:        #f59e0b   (pending, caution states)
White:        #ffffff   (cards, surfaces)
Off-white:    #FFF9F5   (page backgrounds)
```

**Hero header pattern:** Deep navy-to-orange diagonal gradient (`#1e1b4b → #312e81 → #f97316`) with a 3px kanga-stripe accent bar (navy / amber / green repeating at 6px intervals) at the top and bottom edge.

**Cards:** White, `border-radius: 16px`, `box-shadow: 0 2px 12px rgba(0,0,0,0.06)`, left border accent in the relevant status color.

**Typography:**
- Display: `font-weight: 900`, `color: #1e1b4b`
- Body: `font-weight: 400-600`, `color: #374151`
- Caption: `font-weight: 600`, `color: #6b7280`, minimum `text-sm` (14px) — never `text-xs` on medical information
- All medical values (dosages, BP, weight, scores): `font-weight: 800`, `text-base` minimum

### 2.2 Animation System — Refined base + Expressive for celebrations

**Refined (default — every screen transition and card entrance):**
- Duration: 200–300ms
- Easing: `ease-out` / `cubic-bezier(0.2, 0, 0, 1)`
- Pattern: elements fade in + slide up 8px, staggered by 50ms per item
- Page transitions: fade + 12px vertical slide
- Implementation: Framer Motion `motion.div` with `initial={{ opacity: 0, y: 8 }}` and `animate={{ opacity: 1, y: 0 }}`

**Expressive (celebration moments only):**
- Triggers: medication taken ✓, appointment booked, health score improvement, streak milestone, onboarding complete
- Pattern: scale pop (`scale: 0 → 1.08 → 1`) + confetti burst (canvas-confetti) + shimmer gradient on score number
- Duration: 600ms spring (`stiffness: 400, damping: 25`)
- Never on error states, alerts, or clinical warnings

**Micro-interactions:**
- Button press: `scale: 0.97` on tap, release springs to `1.02` then `1.0`
- Card tap: `scale: 0.99`, `box-shadow` reduces
- Bottom nav icon: active icon scales to `1.15` with color transition
- Toggle/switch: spring physics (framer-motion)

**Reduced motion:** All animations respect `prefers-reduced-motion`. When set, replace with instant opacity transitions only.

### 2.3 Touch Targets & Spacing

- Minimum touch target: **48×48px** (all tappable elements)
- Bottom nav items: minimum `h-16` (64px) with `pb-safe` padding for iOS home indicator
- Form inputs: minimum `h-12` (48px)
- Spacing unit: 4px base grid

---

## 3. Critical Bug Fixes (Track A — must ship before or alongside redesign)

### 3.1 Broken production build
**File:** `package.json`  
**Fix:** Move `react` and `react-dom` from `peerDependencies` to `dependencies`. The build currently fails immediately with `cannot resolve react/jsx-runtime`.

### 3.2 Wrong Supabase env var pattern
**File:** `src/app/services/supabase.ts:18-19`  
**Fix:** Replace `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` with `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`. Create `.env.example` with placeholder keys and `.env` in `.gitignore`.

### 3.3 Missing .env setup
**Files:** `.env.example` (new), `.gitignore` (update)  
**Fix:** Create `.env.example`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SENTRY_DSN=
VITE_GA_MEASUREMENT_ID=
```

### 3.4 Hardcoded userId in live components
**Files:** `MedicationTracker.tsx:104`, `TestResultsViewer.tsx:50`  
**Fix:** Read userId from Supabase `auth.user.id` via the existing `useApp()` context. Fall back gracefully to empty state with a "Sign in to view your medications" prompt if unauthenticated.

### 3.5 Console logs leaking PHI
**Files:** 61 instances across components  
**Fix:** Remove all `console.log/warn/error` calls from production components. Keep only in `utils/monitoring.ts` behind `process.env.NODE_ENV === 'development'` guard.

### 3.6 index.html metadata
**File:** `index.html`  
**Fix:** Change `lang="en"` to `lang="sw"` (Kiswahili default). Change `<title>` from `Clinic AI` to `AfyaCare Tanzania`.

### 3.7 Vite security vulnerability
**Fix:** Upgrade Vite from `6.3.5` to latest stable (`6.x`).

### 3.8 translationGate.js broken
**File:** `scripts/translationGate.js`  
**Fix:** Rename to `translationGate.cjs` or convert to ES module syntax (`import` instead of `require`). Update `package.json` scripts accordingly.

### 3.9 PWA manifest + service worker
**Fix:** Install `vite-plugin-pwa`. Add `public/manifest.webmanifest` with AfyaCare branding. Register service worker with Workbox for offline caching of app shell and translation files. This delivers the "offline-first" promise stated in documentation.

---

## 4. Patient Experience Redesign (Track B)

### 4.1 Home Screen (`ModernHomeRedesigned.tsx` → redesigned)

**Layout:**
```
┌─────────────────────────────┐
│  [Kanga stripe top]          │
│  Navy→Orange gradient header │
│  Habari Asubuhi, Amina  ●   │  ← greeting + online dot
│  [Health Score circle: 87]   │
│  Vizuri sana — endelea ↑    │
│  [Kanga stripe bottom]       │
├─────────────────────────────┤
│  Quick Actions (pill row)    │  ← 💊 Dawa  📅 Miadi  🩺 Dalili  🏥 Kliniki
├─────────────────────────────┤
│  Today's cards (staggered)   │
│  ┌──────────┐  ┌──────────┐ │
│  │ Dawa Leo │  │ Miadi    │ │
│  │ ✓ Done   │  │ Ijumaa   │ │
│  └──────────┘  └──────────┘ │
│  ┌──────────────────────────┐│
│  │ AI Health Tip            ││
│  │ Kiswahili copy...        ││
│  └──────────────────────────┘│
├─────────────────────────────┤
│  [Bottom Nav — 64px height]  │
└─────────────────────────────┘
```

**Animations:** Header fades in first (150ms), health score counts up from 0 (500ms refined), quick-action pills stagger in left-to-right (50ms each), cards stagger in (60ms each). Health score milestone triggers Expressive celebration if improved since last visit.

**Accessibility:** `role="main"` on content area, health score has `aria-label="Alama ya afya: 87 kati ya 100"`, quick-action buttons are `<button>` with `aria-label` in Swahili, online indicator has `aria-live="polite"`.

### 4.2 Symptom Checker (`EnhancedSymptomChecker.tsx` → redesigned)

**Flow:** Conversational card-based steps (not a long form). Each step is a full-screen card that slides in from the right.

**Steps:**
1. Body area selector (illustrated body map, large touch targets)
2. Symptom chips (multiselect, 48px min height, color-coded by severity)
3. Duration + severity slider
4. AI analysis (animated loading state with Swahili copy)
5. Result card (risk level badge: 🟢 Kawaida / 🟡 Angalia / 🔴 Haraka) + recommended action

**Animations:** Step transitions use `x: 100% → 0` slide (Refined). AI analysis uses a pulsing skeleton loader. Risk badge pops in with scale animation. High-risk result triggers a distinct vibration pattern (if device supports it via Vibration API).

**Accessibility:** `aria-live="polite"` on AI result, risk level communicated via both color AND text AND icon (not color alone), step progress announced via `aria-label="Hatua 2 kati ya 5"`.

### 4.3 Medication Tracker (`MedicationTracker.tsx` → redesigned)

**Layout:** Daily view at top (today's medications in a horizontal scroll of cards), weekly streak grid below, full medication list at bottom.

**Medication card states:**
- Pending: white card, orange left border, countdown timer
- Taken: green card, check mark, Expressive celebration on first tap
- Missed: red-tinted card, "Umekosa dawa" label, guidance link
- Upcoming: muted card

**Streak system:** 7-day grid of dots. Completing a 7-day streak triggers confetti + "Hongera! Siku 7 mfululizo 🎉" toast.

**Fix:** Replace hardcoded `user_001` with `auth.user.id` from Supabase.

**Accessibility:** Each medication card has `aria-label` with full medication name, dose, and status. Streak grid uses `aria-label="Siku 5 kati ya 7 umefanikiwa"`.

### 4.4 Appointments Screen (`AppointmentsScreen.tsx` → redesigned)

**Layout:** Month calendar strip at top (horizontal scroll, today highlighted in indigo), upcoming appointment cards below, "Book New" floating action button.

**Appointment card:** White card, left border in appointment type color, doctor name + clinic + date/time + status badge. Tap expands to show directions link + cancel option.

**Booking flow:** 3-step bottom sheet (specialty → clinic → date/time). Each step slides up with spring physics. Confirmation triggers Expressive animation ("Miadi imefanywa! 📅").

**Accessibility:** Calendar dates are `<button>` elements with `aria-label="Mei 12, Jumatatu, miadi"`, appointment status communicated via text not color alone.

### 4.5 Profile Screen (`ProfileRedesigned.tsx` → redesigned)

**Layout:** Avatar + name hero (same True Fusion gradient), health stats row (BP, weight, blood type), quick links (Health Timeline, Accessibility Settings, Language Toggle, Privacy), sign out.

**Language toggle:** Prominent EN/SW switcher in profile. Language change triggers smooth full-app re-render (already implemented in i18n.ts).

**Fix:** Remove mock `accessLogs` array, replace with real Supabase query or empty state.

**Accessibility:** Profile picture has `alt` text, all tappable rows are `<button>` or `<a>`, section headings use `<h2>`/`<h3>`.

### 4.6 Bottom Navigation

**Implementation:** Replace current `BottomNavigation.tsx` with redesigned component.

**Specs:**
- Height: 64px + `env(safe-area-inset-bottom)` padding (iOS safe area)
- 4 tabs: 🏠 Nyumbani / 💊 Dawa / 📅 Miadi / 👤 Mimi
- Active tab: indigo icon + label, `scale(1.1)` with spring animation
- Inactive tab: gray icon, no label (icon only to save space)
- Background: white, `border-top: 1px solid #f1f5f9`, subtle shadow
- Touch target: full tab width × 64px (well above 48dp minimum)

### 4.7 CHW App (`CHWDashboard.tsx`, `CHWFieldApp.tsx` → redesigned)

Apply True Fusion design system. Key changes:
- Large touch targets (CHWs use the app outdoors, gloves possible)
- Offline indicator bar (green "Mtandao" / red "Nje ya Mtandao" banner)
- Patient visit cards with priority color coding
- Route optimizer: map-style card list with distance badges

### 4.8 Clinician App (`ClinicalDashboard.tsx`, `creova/` components → redesigned)

Apply True Fusion design system. Key changes:
- Patient queue with color-coded triage badges
- Quick-scan patient cards (vital signs visible without opening)
- Prescription interface: drug search with autocomplete, allergy warnings in red
- Pharmacy dispense: stock level bars (green/amber/red)

### 4.9 Admin / MoH Dashboard (`AdminMonitoringDashboard.tsx`, `MoHDashboard.tsx` → redesigned)

Apply True Fusion design system. Key changes:
- KPI cards with trend arrows (animated count-up on load)
- Recharts graphs styled with the True Fusion palette
- Data tables with accessible row highlighting

---

## 5. Design System Components

New shared components to be created in `src/app/components/ui/`:

| Component | Purpose |
|-----------|---------|
| `HeroHeader` | True Fusion gradient header with kanga stripe, reusable across all roles |
| `StatusBadge` | Color + icon + text badge (never color alone) |
| `HealthScoreRing` | Animated SVG ring with count-up |
| `MedCard` | Medication card with all states (pending/taken/missed) |
| `AppointmentCard` | Appointment card with expand/collapse |
| `StreakGrid` | 7-day medication streak dots |
| `AnimatedButton` | Button with tap scale micro-interaction |
| `StepTransition` | Framer Motion wrapper for step-based flows |
| `OfflineBanner` | Connectivity status bar |
| `ConfettiCelebration` | canvas-confetti wrapper for Expressive moments |
| `KangaStripe` | Decorative 3px pattern stripe component |

---

## 6. Accessibility Requirements (WCAG 2.1 AA)

- All interactive elements: `<button>` or `<a>` (no `div onClick` without `role="button"`)
- All images: `alt` attribute
- All form inputs: associated `<label>` via `htmlFor`
- Color is never the sole means of conveying information
- Minimum text size: `text-sm` (14px) — never `text-xs` for medical data
- Focus visible on all interactive elements (`focus-visible:ring-2`)
- `aria-live="polite"` on dynamic content regions (AI results, loading states, toasts)
- `aria-label` in Swahili on all icon-only buttons
- Screen reader tested for patient home, symptom checker, medication tracker
- `prefers-reduced-motion` respected globally

---

## 7. i18n Requirements

- All new UI strings added to both `en/` and `sw/` namespaces before shipping
- Swahili is the default (`lng: 'sw'`) — all new copy written in Swahili first
- No hardcoded strings in TSX files — all text via `t()` hook
- `CHWRouteOptimizer.tsx`: migrate hardcoded local labels object to i18n namespaces
- `scripts/translationGate.cjs`: fix CommonJS issue, run in CI before deploy

---

## 8. Performance Requirements

- First Contentful Paint: < 2s on 3G
- Bundle: maintain < 500KB initial chunk (current: 450KB)
- All route-level components remain lazy-loaded
- New design system components tree-shakeable
- Images: use `loading="lazy"` and `width`/`height` attributes
- Framer Motion: import only used components (`motion/react` selective imports)

---

## 9. PWA / Offline Requirements

- `vite-plugin-pwa` with Workbox `StaleWhileRevalidate` for app shell
- Precache: translation files, design system CSS, critical route chunks
- Offline fallback page in Swahili: "Hakuna mtandao — data yako ipo hapa chini"
- `manifest.webmanifest`: AfyaCare name, indigo `#6366f1` theme color, icons at 192px + 512px

---

## 10. Implementation Order

1. **Fix critical bugs** (Track A — unblocks everything)
   - React to dependencies, Supabase env vars, .env.example, index.html fixes, Vite upgrade
2. **Design system foundation**
   - Color tokens, `HeroHeader`, `AnimatedButton`, `StatusBadge`, `KangaStripe`, `StepTransition`
3. **Patient Home screen** (most visible, sets the tone)
4. **Bottom Navigation** (used on every patient screen)
5. **Medication Tracker** (replaces hardcoded userId, adds streak)
6. **Symptom Checker** (step-based redesign)
7. **Appointments** (calendar strip + booking flow)
8. **Profile** (language toggle, remove mock data)
9. **CHW App** redesign
10. **Clinician App** redesign
11. **Admin/MoH** redesign
12. **PWA manifest + service worker**
13. **Full accessibility pass** (ARIA, touch targets, focus rings)
14. **Remove console logs + fix translationGate**
15. **Production build verification**
