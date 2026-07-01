# Product

## Register

product

## Users

**Admin (مدير النظام):** The system orchestrator. Manages campus infrastructure (halls, labs), oversees user accounts, generates conflict-free academic schedules via the AI Auto-Scheduler, and monitors attendance and swap requests. Needs absolute control and visibility across all operations.

**Doctor (عضو هيئة تدريس):** Professors and teaching staff. Need a frictionless, focused view of their specific teaching schedule, assigned halls, and student attendance metrics. Quick-access actions for swap requests and real-time schedule updates.

**Student (طالب):** The primary end-user. Needs a reliable, mobile-responsive portal to check academic schedules, lecture locations, and real-time updates on the go. Low friction, high clarity.

## Product Purpose

QNU is a comprehensive University Resource Management System for South Valley National University (SVNU / QNU) in Egypt. Its mission is to completely digitize and optimize campus operations — replacing legacy, error-prone manual scheduling with a smart, automated, conflict-free system powered by a custom AI Auto-Scheduler. Success means every admin, professor, and student can manage, view, and trust their academic schedules without friction.

## Brand Personality

- **Premium** — Every pixel signals quality and care, from generous whitespace to precise alignment.
- **Smart** — Complex operations (scheduling, conflict resolution) feel effortless through intelligent defaults and progressive disclosure.
- **Spacious** — Breathing room in layout reduces cognitive load and conveys confidence.

Voice is professional, clear, and Arabic-first — confident but never bureaucratic.

## Anti-references

This system must **not** resemble legacy academic portals:

- No cramped data tables with harsh zebra striping or 3D bevel effects
- No default Bootstrap-era styling (overly round pills, glaring `#007bff` primary, heavy shadows)
- No "widget soup" — grids of disconnected icon cards with no hierarchy
- No full-bleed stretching on ultra-wide monitors — content stays centered at `max-w-[1400px]`
- No Moodle-like cluttered interfaces or outdated government-dashboard aesthetic

## Design Principles

1. **Breathing Room (Spaciousness):** Leverage generous whitespace (p-6 card padding, wide margins) to create a premium, uncrowded feel that reduces cognitive load.

2. **Clarity over Clutter:** Handle complex data (scheduling conflicts, hall allocations, analytics) with elegance. Use progressive disclosure instead of cramming all data into one view.

3. **Frictionless Workflows:** Complex tasks must feel simple. Use multi-step wizards with real-time feedback (AI Auto-Scheduler) and quick-access actions to save user time.

4. **Trust Through Polish:** The UI must reflect stability and accuracy. Smooth transitions, immediate state updates (optimistic UI), and pixel-perfect alignment build trust in the system's underlying logic.

## Accessibility & Inclusion

- **Target level:** WCAG AA
- **RTL-first:** Arabic-first platform for an Egyptian university — RTL layout must feel native, not a forced LTR flip
- **Contrast & readability:** High contrast text against backgrounds, suitable for older monitors and projectors common in university settings
- **Responsive scaling:** Must remain highly usable on mobile devices for students checking schedules on the go
- **Foundation:** Built on Radix UI primitives (via shadcn/ui) for strong keyboard navigation, focus management, and ARIA support