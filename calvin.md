# Calvin's Notes

This file contains a short set of reminders, setup steps, and developer notes for the `postage-finder` app. Treat this as your personal project scratchpad for architecture notes, TODOs, and quick commands.

## Purpose
- Keep high-level context and short-living notes related to local development, debugging tips, and next tasks.
- Store quick references to important files and commands so you don't have to open the full README to find them.

## Quick Start (local)
- Install dependencies: `npm ci`
- Run dev server: `npm run dev`
- Build: `npm run build`
- Preview production build: `npm run start`

Note: These commands run from the `postage-finder` directory.

## Important paths
- Project root (app): `postage-finder/`
- App entry: `postage-finder/src/app/page.tsx`
- Layout/global styles: `postage-finder/src/app/layout.tsx`, `postage-finder/src/app/globals.css`
- Calculator components: `postage-finder/src/components/calculator/*`
- Data: `postage-finder/src/data/`
- Lib: `postage-finder/src/lib/` (calculator logic, Mongo utils)

## Development notes & reminders
- Keep business logic (pricing rules) inside `src/lib/calculator.ts` and keep UI components thin.
- `destinations.ts`, `pricing.ts`, and `services.ts` are the canonical data sources for options shown in the UI. If you need to tweak pricing or add a service, update those files and add tests.
- Prefer TypeScript types for any shape used across UI and calculator logic. Check `src/lib/models/Pricing.ts` for current types.
- When adding a new route or API, follow existing Next.js app-router conventions used in `src/app/api`.

## Debugging tips
- Reproduce the bug in dev mode (`npm run dev`) and use React DevTools to inspect component props/state.
- Add small unit tests for the `src/lib/calculator.ts` functions when fixing pricing issues.
- When changing data files, watch for places that import them directly in components — those will trigger rebuilds.

## TODO (short-term)
- [ ] Add unit tests for weight/size pricing tiers in `src/lib/calculator.ts`
- [ ] Add E2E smoke test to ensure calculator form submits and displays results
- [ ] Add a CONTRIBUTING note for how to add new destinations/services

## Ideas / Enhancements
- Consider caching pricing lookups if we see performance problems on the calculation path.
- Add an admin UI to manage `services` and `pricing` data instead of editing source files.
- Add CI checks for linting and type-safety on every PR.

## Personal reminders
- When working with external APIs or keys, do not commit secrets. Use environment variables and document them in `README` (or a local `.env.example`).
- Keep commits small and focused. Add unit tests with each behavioral change.

---

If you want, I can:
- Populate this file with more specific checklists (e.g., for a release),
- Add a small developer checklist for PR reviews,
- Or convert certain notes into TODO issues and link them here.

Tell me which and I'll update this file.