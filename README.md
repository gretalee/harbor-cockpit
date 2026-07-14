# Hafen-Cockpit 🌊

A small, widget-based operations dashboard for keeping an eye on Hamburg's harbor: live weather, tide levels, and official severe-weather warnings, side by side, arranged however you like.

This coding challenge was handed to me as part of a job application. What genuinely won me over was its connection to Hamburg's harbor — that gave me something real to build around instead of yet another generic todo app. So: a cockpit for the harbor. The scope turned out to be fairly ambitious for the given timeframe, but that's really the point: working closely with AI today lets a single applicant realistically deliver something this complete, and I wanted this project to show that just as much as it shows the app itself — how capably I can direct and collaborate with AI to get there. Every widget talks to a real, public, live API (Deutscher Wetterdienst, Pegelonline, Bright Sky) — there's no mock data anywhere in production, which occasionally meant chasing down genuinely weird real-world API behavior (more on that below).

## What it does

- **Wetter** — current conditions and a 5-day-forward / open-ended-backward day picker, backed by [Bright Sky](https://brightsky.dev/).
- **Gezeiten** — recent water levels and the next high/low tide for a chosen gauge, backed by the [Pegelonline](https://www.pegelonline.wsv.de/) API, with the official interactive chart embedded live.
- **Unwetterwarnungen** — official DWD severe-weather warnings for a given location, plotted on a small map with a real download-progress bar and a genuinely-timed "next report" estimate (see below).

Widgets can be added via a "+" picker, dragged to reorder, dropped at any position, resized by column span, and removed again. The layout persists to `localStorage`.

## Architecture

The app is an Angular 22 standalone-component app, running **zoneless** (no `zone.js`) — change detection is driven entirely by signals, `computed()`, and the new `resource()` API for async data.

```
src/app/
├── layout/                     shell chrome (header, footer)
├── shared/ui, shared/utils     generic, widget-agnostic building blocks
│                                (Flyout, ProgressBar, the cn() class helper)
└── features/dashboard/
    ├── data/                   WidgetDefinition/WidgetInstance models,
    │                           the WIDGET_CATALOG injection token, and the
    │                           localStorage-backed WidgetInstancesStore
    ├── components/             dashboard-level plumbing (WidgetLoader,
    │                           WidgetShell, WidgetPicker, skeleton/error states)
    └── widgets/<name>/         one self-contained folder per widget:
                                component + template + its own API service
                                + its own spec file
```

**The widget catalog is the whole trick.** Each widget registers itself into a multi-provided `WIDGET_CATALOG` `InjectionToken` via its own `provide<Name>Widget()` function (see `weather-widget.provider.ts`) — the dashboard never imports a concrete widget class. `app.routes.ts` just lists which providers are active for the route. This means:

- **Widgets are lazy-loaded.** `WidgetDefinition.loadComponent()` is a `() => import('./widget')`, resolved on demand by `WidgetLoader` through a `resource()`. The build output shows each widget as its own chunk (`weather-widget`, `tide-widget`, `severe-weather-widget`) — a widget you never add to your dashboard never ships to your browser.
- **The dashboard is generic.** It renders whatever's in the catalog and whatever's in the instance store; adding a widget never means touching dashboard code (see below).
- **Drag-and-drop is CDK, not custom.** The picker flyout and the dashboard grid are two connected `cdkDropList`s; dropping a picker item onto the grid at any position both adds the instance _and_ inserts it at that index in one gesture.

## Adding a new widget

This is deliberately the only interesting part of wiring up a new widget — everything else (loading, rendering, drag-and-drop, persistence, remove) is handled generically.

1. Create `src/app/features/dashboard/widgets/<name>/`, with a standalone component (`<name>-widget.ts` + `.html`), and its own API service if it talks to an external source.
2. Add `<name>-widget.provider.ts`:
   ```ts
   const myWidgetDefinition: WidgetDefinition = {
     id: 'my-widget',
     title: 'My Widget',
     icon: '<inline SVG data URI>',
     defaultConfig: {/* whatever the component's `config` input expects */},
     loadComponent: () => import('./my-widget').then((m) => m.MyWidget),
   };

   export function provideMyWidget() {
     return makeEnvironmentProviders([
       { provide: WIDGET_CATALOG, multi: true, useValue: myWidgetDefinition },
     ]);
   }
   ```
3. Register it in `app.routes.ts`'s route `providers: [...]` array.

That's it — it now shows up in the picker, can be dragged onto the dashboard, persists, and lazy-loads on its own.

## A few decisions worth calling out

- **Real progress over fake progress, where it's honestly possible.** The severe-weather widget's progress bar reflects actual `DownloadProgress` HTTP events against `Content-Length`, not a timer. The weather widget's progress bar _is_ a timer estimate — Bright Sky's payload doesn't make a real one meaningful — and that's a deliberate, not an accidental, difference.
- **Prefer the server's own cache hints over guessing — carefully.** The severe-weather widget schedules its next refetch from the feed's `Expires` header rather than assuming an hourly cadence. That header turned out to sometimes already be stale by the time a response arrives (confirmed by hand via `curl`), which caused a real reload-storm bug during development. The fix — a hard floor on how often a reload can fire, regardless of what the hint says — is now locked in by a regression test that fails without it.
- **A partial config falls back completely, not field-by-field.** If a persisted widget config is missing coordinates (e.g. from an older shape), the whole config falls back to the default rather than mixing a saved label with default coordinates — better a consistent default than a silently mismatched one.
- **History depth is discovered, not hardcoded.** Weather's "go back further" boundary isn't a fixed number of days; it's detected live from the API (station history depth genuinely varies by location) and the UI disables itself right at that discovered boundary.

## Honest trade-offs

Things I'd tackle next with more time: widget configuration (location, gauge, coordinates) is fixed per widget definition and isn't user-editable through the UI yet; there's no dedicated e2e suite wired into CI (verification during development leaned on Playwright driven ad hoc against the real APIs); and there's no offline/degraded-network story beyond the existing per-widget error states.

## Built together with Claude Code

I paired with **[Claude Code](https://claude.com/claude-code)**, Anthropic's AI coding agent, throughout the entire development process; fittingly, this README file is also a collaborative effort. The cooperation was hands-on rather than a "describe it once and walk away" arrangement: I reviewed every code diff, requested adjustments, flagged UX issues using screenshots (such as a distorted map or a flickering widget), and sought out **root causes** instead of settling for quick fixes. This ensured that bug fixes addressed underlying issues rather than merely treating the symptoms. Claude Code conducted extensive troubleshooting using **[Playwright](https://playwright.dev/)** and `curl`, and wrote **regression tests** for trickier bugs. That saved me a great deal of work. It felt less like delegating tasks and more like collaborating with a fast, skilled colleague who delivers excellent results when given clear instructions and honest feedback.

---

_Built with Angular 22, signals, `resource()`, Angular CDK drag-and-drop, and Tailwind CSS — and a fair amount of `curl`-ing real APIs to find out how they actually behave before writing the code that assumes it._
