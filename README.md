# Plate — food photography and visual restaurant menus

Plate’s main service is a focused **10 hero dishes** shoot and menu setup for Dubai restaurants, producing agreed assets for a QR menu, Instagram and delivery listings. Photography is quoted after confirming wholesale atelier cost, deliverables and usage rights. There is no one-time menu tier. Core is AED129/month (AED1,290/year); Pro is AED249/month (AED2,490/year). Hosting is included during an active subscription. Sales are agreed through the public enquiry page / WhatsApp; online checkout and paid entitlement enforcement are not implemented.

## Public experience

- `/` photography-led owner landing page, real licensed photo examples and public enquiry CTA.
- `/demo` The Terrace, a fictional sample: “A little Mediterranean. A little unexpected.” All eight example dishes have real photos. Prices, portions and events are illustrative, not verified restaurant offers.
- `/studio/sample` the same editable studio, no signup needed. Sample edits live only in the open page; it does not save account data, publish, upload files, invoke paid AI or report invented analytics. A persistent create-your-own prompt links to `/login`.
- `/enquire` builds an editable WhatsApp enquiry. Nothing is sent or booked automatically.
- `/photo-credits` sources and licences. Real sample photographs are not represented as Plate client work. Generated steak imagery was removed.

The homepage embeds the actual `/demo` page, sharing the production menu layout and interactions instead of a separate illustration. The top offer carousel supports swipe, arrows, dots, pause and 20-second rotation. It pauses for focus, hover, hidden pages, open details and reduced-motion preferences. Offers link to actual menu dishes; zero offer price shows Free. The sample Whispering Angel glass is AED30 normally and Free only in the Wednesday ladies’ offer. Tuna dishes retain their menu prices.

## Accounts

`/login` uses Supabase Auth, not ChatGPT. Email/password accounts and PKCE callback handling are implemented using `@supabase/ssr` and server cookies. `/studio` requires a verified Supabase user. Google and Apple OAuth paths are implemented, but their buttons are only enabled when `/auth/v1/settings` confirms the provider is configured. Both providers were disabled at verification: they still require the owner’s Google OAuth client / Apple Services ID and signing credentials. Never advertise them as active until configured and tested.

Legacy trusted Sites/ChatGPT identity is accepted only by backend compatibility access to old menu records. It is not the new studio’s login flow. Old owner IDs are preserved during database migration, not silently mapped to newly created Supabase accounts. A verified ownership-transfer process is needed if an owner wants their old draft assigned to a new account.

## Working menu tools

Owner-scoped drafts and separate published snapshots; stable URLs and downloadable QR; prices, portions, preparation, chef-provided allergens; JPEG/PNG/WebP uploads with rights attestation; three layouts; specialties; photo offers with included dishes and prices; weekly, last-weekday-of-month and dated events; availability-only updates without publishing other drafts; guest search and shortlist; aggregate activity; JSON and bounded HTML data backups.

AI tools use an encrypted server-only OpenAI key:

- Translation drafts for Core (2 total languages) and Pro (up to7), including original English. AI cannot edit prices/photos/nutrition. Owner can review/edit each string. Original wording changes invalidate approval; unreviewed/stale translations are excluded from public menu responses. Limits are prototype plan settings, not purchased billing entitlements. A fluent restaurant reviewer must check ingredients, allergens and offer restrictions.
- Uploaded voice notes or text briefs become disabled event drafts. Owner checks schedule, selects images and included dishes, then enables and publishes. Voice audio is processed, not stored by Plate.
- Photo enhancement accepts only an owner’s uploaded photo. It stores a separate AI-enhanced draft, preserves the original and requires visual approval in the editor. AI may alter food details; reject a changed portion or ingredients.
- Recipe-based nutrition estimates use supplied quantities/servings and require review/visibility approval. Private recipes and estimation notes are excluded from guest API/export. Values are approximate, not laboratory results or allergy/medical advice.

Defaults: `OPENAI_MODEL=gpt-4.1-mini`, `OPENAI_TRANSCRIBE_MODEL=gpt-transcribe`, `OPENAI_IMAGE_MODEL=gpt-image-2.5-flare`. Pilot atomic daily attempt limits: nutrition20/account,100global; translation15/100; voice10/60; photos5/30. Failures consume quota. These are cost caps, not paid credits. No automatic publishing or unattended agent actions.

## Data and migration

`DATABASE_PROVIDER=supabase` selects the HTTPS backend through `@supabase/server/core` and requires the encrypted `SUPABASE_SECRET_KEY`. It never silently falls back after a Supabase error. Namespaced tables: `plate_menus`, `plate_uploads`, `plate_menu_metrics`, `plate_ai_usage`. All have RLS enabled and no anonymous/authenticated grants. Backend checks verified user identity and owner ID. Service-role-only SECURITY INVOKER RPCs implement quotas, activity increments, conditional availability updates and atomic legacy import. No public SECURITY DEFINER functions.

Schema was applied through Supabase migrations `plate_menu_backend` and `plate_legacy_import`; SQL files in `database/` are source snapshots. The intentional backend-only model can show an informational “RLS enabled, no policy” advisory; anonymous access is denied by design.

Legacy D1 records are imported once on first owner or published-slug access. Before importing, the backend writes a private R2 recovery snapshot. A transaction preserves owner ID, slug, drafts, published snapshot, upload object keys and counters. Existing Supabase menu rows are not overwritten. Original D1 records remain as recovery copies. R2 still stores photo files; metadata is in Supabase. Source Git/GitHub stores neither customer records, uploads nor secrets.

Metrics contain daily menu/dish IDs, kind and count, not guest names, IPs or search terms. DNT/GPC skip optional counters. Retention pruning is activity-triggered. Counters are approximate, not unique visitors or sales. See `/privacy`.

## Development / verification

Node>=22.13. Install via the Sites dependency helper, then `npm run dev` or `npm run build`. `.env.local` is ignored with permissions0600. Local Sites sign-in simulation exists for compatibility API tests; the new login uses Supabase. Do not expose secrets in logs, bundles, exports or Git.

Verified: TypeScript, build; private owner/origin safeguards; actual OpenAI translation, event draft, photo enhancement; Supabase insert/read, atomic quota, compare-and-swap conflict handling and anonymous table denial. Additional auth/voice/publication checks are recorded in the task’s delivery notes. These checks are not a production security audit. Team roles, paid entitlements, rollback, deletion workflows, delivery integration and real restaurant ROI case studies remain commercial launch work.

Sites is the deployment source. `https://github.com/AngelinaN8/Plate-digital-menu` is a source backup; GitHub pushes alone do not redeploy Sites. Repository audience remains public.

## Photography credits

Steak Rossini — kennejima, https://commons.wikimedia.org/wiki/File:Tournedos_Rossini_with_Truffle_Madeira_Sauce.jpg, CC BY2.0 https://creativecommons.org/licenses/by/2.0/.

Sesame-seared tuna — Steven Depolo, https://commons.wikimedia.org/wiki/File:Pan_Seared_Tuna_8-4-09_--_IMG_4347.jpg, CC BY2.0.

Tuna sashimi — sunday driver, https://commons.wikimedia.org/wiki/File:Tuna_sashimi_by_sunday_driver_at_a_hotel_in_Kyoto.jpg, CC BY2.0.

Tuna cutting — ウィ貴公子, https://commons.wikimedia.org/wiki/File:202408031137_DSCN1854.jpg, CC BY-SA4.0 https://creativecommons.org/licenses/by-sa/4.0/. Source photo retained; responsive display crops labelled. Real demonstration, not an event at the fictional restaurant.

Other real sample photography via Unsplash. Rosé — Harrison Chang, https://unsplash.com/photos/a-glass-of-rose-on-a-white-table-5V_qyT4Jv5k. All source photos are illustrative; restaurants must upload actual dish photos with suitable rights.
