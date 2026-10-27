# Plate — visual restaurant menu prototype

A public pilot with an account-protected restaurant workspace and full-stack functionality for a Dubai visual-menu business. The restaurant and dishes shown initially are illustrative. Replace sample content before guest use.

## Working features

- Marketing site and example guest menu.
- Account-owned menu drafts in Cloudflare D1; publishing stores a separate snapshot at a stable menu URL.
- Menu editor with prices, categories, descriptions, portions, preparation and restaurant-supplied allergen notes.
- JPEG/PNG/WebP uploads to R2, max 8 MiB, with recorded rights attestation.
- Editorial, Gallery and Classic guest layouts; brand colour and currency.
- Featured specialties, an editable announcement banner and weekly, last-weekday-of-month or one-off event cards with the next three venue-local occurrence dates.
- Live availability endpoint updates only availability in the guest snapshot, without publishing other draft edits.
- Dish deep links, searchable menu, session shortlist and downloadable QR PNG.
- Downloadable photography planning brief; no submission or booking.
- Recipe-based OpenAI nutrition estimation, restaurant-supplied values and a mandatory review/visibility step. Public responses exclude recipes and private estimation notes.
- Photo promotion and event banners placed after a chosen menu category. Banner uploads use the same ownership and R2 safeguards as dish photos.
- Account-only 30-day dashboard of daily menu-open, dish-view and shortlist-save totals. No guest IPs, identities or searches in analytics storage.
- Current-menu JSON backup, static HTML export (up to 40 dishes / 20 MiB of embedded uploads) and QR artwork for a restaurant’s own hosting URL.

## Deliberate prototype boundaries

The Site audience is public. Sites handles ChatGPT sign-in for restaurant management; data is scoped to the signed-in account. Public menu APIs expose only published guest fields. Restaurant team/branch membership and account deletion remain commercial-launch work.

Voice-driven import, AI photo enhancement, AI translation, push/reminder scheduling, custom domains, multi-branch roles, rollback, paid plans and Deliveroo integration remain planned. Prices are proposed pilot prices, not an active checkout: Core AED 129/month or 1,290/year; Pro AED 249/month or 2,490/year; one-time static menu setup AED 1,490 (up to 40 dishes, one revision, hosting/ongoing changes separate); photography from AED 3,490. Legacy promotion days are labels: that announcement remains visible while enabled. Recurring event cards use venue-local calendar dates and omit expired one-off events.

The current local authentication simulator supports one identity; two-account production isolation testing remains required. Whole-menu saves are last-write-wins. The live availability endpoint uses conditional updates and retries to avoid overwriting competing server changes, but team editing needs a fuller version/conflict protocol.

## Local development

Node >=22.13 and npm are needed. Install with the Sites install-dependencies helper. Then:

1. `npm run db:generate` only after changing the schema (initial migration is included).
2. `npm run build` creates the local Worker configuration.
3. Apply pending SQL locally with the documented Wrangler D1 local command from the starter/Sites skill; use `.wrangler/state` and do not replay already applied migrations.
4. `npm run dev -- --hostname 127.0.0.1 --port 5173`.
5. Use the local `/signin-with-chatgpt?return_to=/studio` sign-in simulator.

Production publication should use the Sites workflow, which applies the committed schema migrations and provisions declared D1/R2 bindings. Do not put credentials into source or client code.

## API

- `GET /api/menu`: current owner's draft.
- `PUT /api/menu`: `{menu}` save, authenticated and same-origin, <=500 KiB.
- `POST /api/publish`: publish current saved draft.
- `POST /api/availability`: `{dishId, available}` live availability.
- `POST /api/upload`: multipart `file` + `rightsConfirmed=true`.
- `GET /api/images/:id`: owner or published-reference access.
- `GET /api/public/:slug`: published menu snapshot, excluding recipes and private nutrition notes.
- `GET /api/nutrition`: authenticated readiness check; `POST`: recipe and servings to a structured AI estimate, not automatically saved or published.
- `POST /api/metrics`: bounded aggregate activity for a real published menu; `GET`: account-owned activity and storage summary.
- `GET /api/export`: authenticated static HTML download, embedding uploaded photos and excluding recipes.

All mutations check identity, ownership and origin. Image file types are checked by MIME and signatures; production should add decoding/normalization, quotas and image variants. No ordering, payments or delivery marketplace is implemented.

## Verification

TypeScript check and production build pass. Local backend checks cover 39 assertions across authentication, rejected spoofed headers, origin, input limits, validation, persistence, draft/published separation, image rights/upload/access, template and promotion fields, legacy defaults and availability-only publication. Browser QA covers menu/shortlist, editing, publishing/QR, template preview and live availability. Screenshots were checked at desktop and narrow panel sizes. These checks are not a production security audit.

Illustrative photographs are loaded from Unsplash, alongside one explicitly labelled generated steak Rossini concept image. Production restaurants should upload authentic images with suitable usage rights.

## AI configuration and usage

`OPENAI_API_KEY` is an ignored local `.env.local` value and an encrypted Sites runtime secret. It must never enter Git, client bundles or exports. `OPENAI_MODEL` optionally overrides the server default `gpt-4.1-mini`. Recipes are sent only on an explicit estimate request, with `store:false`; provider retention policies still apply. Model output is schema-constrained, range-checked and returned as unreviewed, hidden nutrition. No laboratory or allergen certification is implied. Changes to recipe/servings invalidate review in the editor.

AI calls have persistent atomic daily quotas: 20 attempts per account and 100 across the pilot, based on UTC dates. Failed attempts consume quota. These are pilot cost controls, not billed entitlements. Paid plan enforcement and billing webhooks are not implemented. Nutrition inference uses only the submitted quantities, never a photograph.

`menu_metrics` holds bounded daily counters indexed by menu/date; no guest identifier is stored. Session storage reduces repeats and DNT/GPC skip counting. Counts are approximate and can include automated traffic; they do not measure unique guests, conversions or revenue. Rows older than 90 days are pruned on new menu opens; `ai_usage` is pruned on new AI requests. Retention is activity-triggered, not a guaranteed scheduled deletion deadline. See `/privacy`.

## GitHub copy

The selected repository is `https://github.com/AngelinaN8/Plate-digital-menu`. Sites remains the deployment source. GitHub is a source copy; pushing to GitHub alone does not redeploy Sites. Customer menus remain in D1 and uploads in R2, not GitHub. The repository’s selected audience is public, so ignored local env files, local databases and service credentials must remain excluded.

Rosé banner photograph: Harrison Chang / Unsplash, https://unsplash.com/photos/a-glass-of-rose-on-a-white-table-5V_qyT4Jv5k. Illustrative event imagery, not a photographed restaurant offer.
