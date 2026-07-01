---
name: QNU Client
description: University Resource Management System for South Valley National University
colors:
  primary: "#3b82f6"
  neutral-bg: "#f8fafc"
  neutral-surface: "#ffffff"
  neutral-text: "#0f172a"
  neutral-text-secondary: "#64748b"
  neutral-text-muted: "#94a3b8"
  neutral-border: "#e2e8f0"
  neutral-sidebar: "#09090b"
  neutral-sidebar-text: "#e2e8f0"
  neutral-sidebar-muted: "#94a3b8"
  success: "#22c55e"
  danger: "#ef4444"
  warning: "#f59e0b"
  info: "#0ea5e9"
  admin-accent: "#3b82f6"
  doctor-accent: "#10b981"
  student-accent: "#8b5cf6"
typography:
  body:
    fontFamily: "Tajawal, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontFamily: "Tajawal, system-ui, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
  headline:
    fontFamily: "Tajawal, system-ui, -apple-system, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.3
  display:
    fontFamily: "Tajawal, system-ui, -apple-system, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.2
  label:
    fontFamily: "Tajawal, system-ui, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.18em"
    textTransform: "uppercase"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  card-padding: "24px"
  section-padding: "32px"
  max-width: "1400px"
components:
  button-primary:
    backgroundColor: "#09090b"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "16px 32px"
  button-secondary:
    backgroundColor: "#f1f5f9"
    textColor: "#0f172a"
    rounded: "{rounded.md}"
    padding: "16px 32px"
  button-outline:
    backgroundColor: "#ffffff"
    textColor: "#475569"
    rounded: "{rounded.md}"
    padding: "16px 32px"
  card-default:
    backgroundColor: "{neutral-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.card-padding}"
  input-default:
    backgroundColor: "{neutral-surface}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  badge-default:
    backgroundColor: "#f1f5f9"
    textColor: "#334155"
    rounded: "{rounded.sm}"
---
# Design System: The Academic Cockpit

## 1. Overview

**Creative North Star: "The Academic Cockpit"**

This is a command center for university operations — a place where admins orchestrate schedules, professors monitor their classrooms, and students navigate their academic day with precision. Like an aircraft cockpit, every element serves a purpose: dense data is surfaced through progressive disclosure, primary actions are unmistakable, and the interface rewards familiarity with efficiency.

The system is defined by the stark tonal contrast between a deep, dark navigation shell (zinc-950) and a light, spacious content area (slate-50). This layered approach creates depth without shadows — the sidebar IS the frame, the content IS the canvas. Cards and surfaces are predominantly flat, lifting subtly on hover to signal interactivity. The result is a premium SaaS aesthetic that feels authoritative, not institutional.

**Key Characteristics:**

- **Command and precision:** Every screen has a clear hierarchy. Users never wonder where to look or what to click next.
- **Spacious by default:** Generous whitespace (p-6 card padding, wide gutters) reduces cognitive load. Content breathes.
- **Arabic-first RTL:** The layout is native to right-to-left reading, not a forced mirror of LTR conventions.
- **Interactive feedback:** Flat surfaces respond with gentle lifts, color shifts, and subtle transforms — never heavy shadows or 3D effects.
- **Role-adaptive identity:** Each user role carries a distinct accent color (blue for admin, emerald for doctor, violet for student) woven into navigation indicators and profile elements.

This system explicitly rejects the legacy academic portal aesthetic. No cramped data tables, no harsh zebra striping, no default Bootstrap-era controls, no widget-soup dashboards. It aims to feel like a next-generation B2B product — think Linear, Vercel, or Stripe — purpose-built for the university environment.

## 2. Colors

The palette uses a restrained architecture: a blue primary accent carries all single-action affordances, while a slate-based neutral system covers the vast majority of surface, text, and border roles. Role-specific green and violet accents are reserved for identity markers in navigation, not for general UI.

### Primary
- **Command Blue** (#3b82f6 / oklch(62.3% 0.214 259.8)): The sole action color. Used for primary buttons, active sidebar indicators, focus rings, and selection highlights. Limited to ≤10% of any given screen — its rarity gives it weight.

### Neutral
- **Cloud Surface** (#ffffff / oklch(100% 0 0)): The dominant surface for cards, modals, inputs, and content panels. Always pure white, never tinted warm or cool.
- **Content Canvas** (#f8fafc / oklch(96.8% 0.005 210)): The background for the main content area. A barely-there cool slate that provides separation from card surfaces without adding visual noise.
- **Ink** (#0f172a / oklch(21.7% 0.037 265)): Primary text color. High-contrast, near-black slate for body copy and headings.
- **Muted Ink** (#64748b / oklch(55% 0.04 265)): Secondary text for labels, metadata, and helper text. Verified ≥4.5:1 against Cloud Surface.
- **Ghost Ink** (#94a3b8 / oklch(66% 0.035 265)): Placeholder text and disabled states. At 4.5:1 against white — never lighter.
- **Cloud Border** (#e2e8f0 / oklch(92% 0.01 265)): Default border for cards, inputs, and dividers. A whisper of structure, never a frame.
- **Cockpit Dark** (#09090b / oklch(12% 0.0 0)): The sidebar and primary navigation surface. Near-black zinc, creates the tonal depth that replaces shadows.
- **Cockpit Text** (#e2e8f0 / oklch(92% 0.01 265)): Text on dark sidebar surfaces.
- **Cockpit Muted** (#94a3b8 / oklch(66% 0.035 265)): Secondary text and icons on dark sidebar.

### Semantic
- **Success Green** (#22c55e / oklch(72% 0.19 145)): Confirmation states, active indicators, attendance marked present.
- **Danger Red** (#ef4444 / oklch(56% 0.234 25)): Destructive actions, error states, alert badges.
- **Warning Amber** (#f59e0b / oklch(75% 0.19 79)): Pending states, caution signals.
- **Info Sky** (#0ea5e9 / oklch(62% 0.224 240)): Informational system messages.

### Role Accents
- **Admin Command** (#3b82f6): Admin navigation highlighting and identity badge.
- **Doctor Leaf** (#10b981): Doctor/teaching-staff navigation and identity badge.
- **Student Violet** (#8b5cf6): Student navigation and identity badge.

### Named Rules

**The One Voice Rule.** The Command Blue primary is used for a single purpose: actionable controls. It does not appear as decorative backgrounds, section headings, or icon fills. If a user sees Command Blue, they know to click.

**The Cockpit Contrast Rule.** All text on Cloud Surface backgrounds must meet WCAG AA (≥4.5:1). Ghost Ink (#94a3b8) passes at that ratio against white — it is the absolute floor. Never use a lighter gray for placeholder or body text.

## 3. Typography

**Body & Display Font:** Tajawal (with system-ui, -apple-system, sans-serif fallback)

**Character:** Tajawal is a geometric humanist Arabic typeface that brings warmth and clarity to the Latin-script SaaS conventions. Its open counters and balanced proportions maintain readability at small sizes while looking confident at display scales. The single-family approach eliminates pairing complexity: one face does everything, from dashboard labels to welcome-screen headlines.

### Hierarchy

- **Display** (700, clamp(1.5rem, 4vw, 1.875rem), 1.2): Welcome banners, hero dashboard sections. Use `text-wrap: balance` for even line breaks.
- **Headline** (700, clamp(1.25rem, 3vw, 1.5rem), 1.3): Section headers, page titles, modal titles.
- **Title** (600, 1rem / 16px, 1.4): Card titles, sidebar heading labels. Bold enough to anchor content.
- **Body** (400, 0.875rem / 14px, 1.6): Default text for tables, paragraphs, descriptions, list items. Cap line length at 65–75ch. Use `text-wrap: pretty` to reduce orphans.
- **Label** (600, 0.75rem / 12px, 1.5, 0.18em letter-spacing, uppercase): Navigation section headers ("القائمة"), table column headers, form field labels, badge text. The tracking gives these weight without size.

### Named Rules

**The One-Font Rule.** Tajawal is the only font family. No serif pairing, no mono face. Weight and size create hierarchy; font changes would add noise to an already information-dense product.

**The Balance Rule.** Display and headline text uses `text-wrap: balance`. Long-form body text uses `text-wrap: pretty`. Raw `text-wrap: normal` is permitted only inside data tables where balance would cause layout instability.

## 4. Elevation

This system does not use shadows to convey depth. Instead, it relies on **tonal layering** — the stark contrast between the dark Cockpit navigation and the light Content Canvas creates an unmistakable structural hierarchy. Depth is expressed as background color, not as drop shadow.

Cards and interactive surfaces are flat at rest with a single subtle border (Cloud Border). On hover or active states, cards may lift using a soft shadow (`0 10px 24px rgba(15,23,42,0.08)`) and a slightly darker border — but this is an interactive signal, not a structural one. The default state communicates: this surface is flat and trustworthy.

### Shadow Vocabulary

- **Resting card shadow** (`0 1px 2px rgba(15,23,42,0.04)`): Barely perceptible. Prevents cards from feeling completely detached from the canvas. Present on all card surfaces at rest.
- **Lifted card shadow** (`0 10px 24px rgba(15,23,42,0.08)`): Hover state only. Signals interactivity for clickable cards, dropdown menus, and modals.
- **Modal shadow** (`0 25px 50px rgba(15,23,42,0.25)`): The only elevation that steps above the tonal depth. Modals overlay both sidebar and content.

### Named Rules

**The Flat-By-Default Rule.** Every surface is flat at rest. Shadows appear only as a response to state changes (hover, focus, active). A surface that never needs interaction should never cast a shadow.

## 5. Components

### Buttons
- **Shape:** Rounded corners with a moderate radius (8px). Never pill-shaped except for tags and badges.
- **Primary:** Near-black background (zinc-950), white text, full-width padding (16px horizontal, 10-12px vertical depending on size). Hover shifts to zinc-800. Active translates down 1px. Includes a subtle inset shadow for depth.
- **Secondary:** Slate-100 background, slate-900 text. Hover shifts to slate-200. For paired actions alongside primary.
- **Outline:** White background, 1px slate-300 border, slate-700 text. Hover adds slate-50 background.
- **Ghost:** No background, slate-600 text, hover adds slate-100 fill. For toolbar actions and table row actions.
- **Destructive:** Red-600 background, white text, hover to red-700.
- **Loading state:** Inline spinning SVG spirograph, left-aligned before the label. Disables interaction.
- **Focus:** 2px solid zinc-900 outline with 2px offset. Visible on all variants.

### Cards
- **Corner Style:** Rounded (8px), matching button radius.
- **Background:** Pure white (Cloud Surface).
- **Shadow Strategy:** Resting card shadow at rest; lifted shadow on hover when `hover` prop is set.
- **Border:** 1px Cloud Border at rest, darkening to slate-300 on hover.
- **Internal Padding:** 24px (p-6). This is the canonical interior spacing. Card headers and footers use the same horizontal padding with appropriate vertical spacing.
- **CardHeader:** 24px padding, bottom border (slate-100) separating from content.
- **CardContent:** 24px padding all around.
- **CardFooter:** 24px horizontal, 24px bottom, 0 top (relies on content's bottom padding).

### Inputs & Fields
- **Shape:** Rounded (8px), matching buttons and cards.
- **Style:** 1px Cloud Border, white background, 10px 14px padding (3.5px top/bottom, 3.5px left/right). Placeholder at Ghost Ink.
- **Focus:** Border shifts to slate-500. A 4px slate-900/10 focus ring expands outward — visible, not reliant on outline alone. The focus ring is the primary affordance.
- **Hover:** Border darkens to slate-300. Gently signals interactivity without the user having to click.
- **Error:** Border switches to red-500, focus ring shifts to red-500/15. Error message appears below in danger red at 12px.
- **Icon support:** When an icon is present, the input field includes padding on the icon side. Icon is positioned absolutely, pointer-events-none, colored at gray-400.
- **Disabled:** 50% opacity. No hover effect.

### Badges
- **Shape:** Rounded (6px). The sm radius keeps them gentle but distinct from full-pill tokens.
- **Style:** Background + text color + 1px ring, all matched by variant. The ring replaces the need for a border or shadow.
- **Variants:** Default (slate-100/slate-700), primary (blue-50/blue-700), success (emerald-50/emerald-700), warning (amber-50/amber-700), danger (red-50/red-700), info (sky-50/sky-700), purple (violet-50/violet-700).
- **Sizes:** sm (8px horizontal, 4px vertical, 12px), md (10px horizontal, 4px vertical, 12px), lg (12px horizontal, 8px vertical, 14px), xl (16px horizontal, 12px vertical, 14px).
- **Dot variant:** Adds a 6px colored circle before the label for real-time status indicators.

### Navigation (Sidebar)
- **Style:** Full-height dark panel (Cockpit Dark, bg-zinc-950). Fixed width: 288px (72 rem-scale).
- **Typography:** Nav items at 14px, 600 weight. Section header ("القائمة") at 10px, 700 weight, 0.18em tracking, uppercase, Cockpit Muted.
- **Default state:** Cockpit Muted text, no background. Hover adds white/6% background overlay, text shifts toward Cockpit Text.
- **Active state:** White background, near-black text, 3px role-colored right border (Command Blue / Doctor Leaf / Student Violet). The border is the only role accent — not the background color.
- **Icons:** 20px, matching text color in each state.
- **Logout:** Grouped below a separator line. Default muted, hover shifts to red-300 text on red-500/10 background.
- **Mobile:** Overlay panel with backdrop blur. Black/30 backdrop covers the content area.

### Skeleton
- **Shape:** Rounded (6px).
- **Style:** Gradient shimmer — e2e8f0 → f1f5f9 → e2e8f0 at 200% width, animated 1.5s infinite. The gradient direction is horizontal. No opacity or pulsing — the shimmer is the signal.

## 6. Do's and Don'ts

### Do:
- **Do** use generous whitespace (p-6 card padding, wide gutters) to maintain the premium, uncrowded feel. Spaciousness IS the brand.
- **Do** use Command Blue sparingly — for actionable controls only. A blue accent that appears on every element is no longer an accent.
- **Do** enforce `max-w-[1400px]` on content containers to maintain readable line lengths on ultra-wide screens.
- **Do** use the tonal layering (dark sidebar + light canvas) for structural depth. Replace shadow-based depth with color-based depth.
- **Do** use `text-wrap: balance` on headings and `text-wrap: pretty` on body text for optimal line breaks.
- **Do** verify all text/background pairs against WCAG AA (≥4.5:1), especially Ghost Ink (#94a3b8) on Cloud Surface (#ffffff) — that is the contrast floor, not a recommendation.
- **Do** keep RTL layout native — the UI should feel like it was designed in Arabic, not translated into it.

### Don't:
- **Don't** use zebra-striped data tables. Use clean bottom borders (border-b, Cloud Border) and consistent row height.
- **Don't** use pill-shaped buttons (border-radius over 12px) for primary/secondary actions. Pill shapes are reserved for badges and tags.
- **Don't** use heavy drop shadows or 3D/bevel effects on surfaces. A card at rest has only a whisper shadow (0 1px 2px). If a shadow would be over 8px blur at rest, use tonal contrast instead.
- **Don't** create "widget soup" — grids of disconnected icon cards with no visual hierarchy. Every section must have a clear purpose and information priority.
- **Don't** stretch content full-bleed on monitors wider than 1400px. The max-width constraint is not optional.
- **Don't** use gradient text (background-clip: text + gradient). Use a single solid color for all text. Emphasis via weight or size.
- **Don't** use border-left or border-right greater than 1px as a decorative accent on cards, callouts, or list items. Use full borders, background tints, or nothing.
- **Don't** mix shadow-and-border on the same card or button. Use border OR shadow, not both (except the resting card shadow which is imperceptible by design).
- **Don't** add glassmorphism (blur + transparency) as a default surface treatment. The glass utility classes exist for edge cases only.
- **Don't** use Tiny Uppercase Tracked Eyebrow above every section. The "القائمة" label in the sidebar is a deliberate navigation section header — it is not a pattern to repeat above content sections.
- **Don't** render dropdowns inside overflow: hidden containers. Use portal/fixed positioning or the native popover API to avoid clipping.
- **Don't** use repeating-linear-gradient stripe backgrounds or sketchy SVG illustrations. These are the most common AI-slop tells and are explicitly prohibited.
- **Don't** animate CSS layout properties (width, height, top, left, margin, padding) — use transform and opacity only.