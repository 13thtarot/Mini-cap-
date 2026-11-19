# Fairytale Nails Salon — Supabase backend (Phases 1–5) + shared JS modules

Status: database, security, booking engine, PayMongo integration, staff/owner operations and the
shared frontend modules are built and tested. **The three HTML portals are not yet rewired** (Phase 6, below).

## Layout
```
supabase/migrations/   001 schema · 002 RLS/Storage/Realtime · 003 booking engine · 004 payments/sales/refunds/reports · 005 seed + hardening
supabase/functions/    create-checkout · paymongo-webhook · process-refund · admin-create-staff (+ _shared)
supabase/tests/        behaviour.sql (78 assertions) · race.sh (parallel double-booking test)
web/js/                config · client · auth · catalog · booking · payments · realtime · staff · owner  (ES modules, no secrets)
```

## Deploy
1. Create a Supabase project. Enable extensions **pg_cron** (Database → Extensions) *before* running migration 003
   (otherwise run the `cron.schedule(...)` line printed by that migration afterwards).
2. `supabase link --project-ref <ref>` then `supabase db push` (runs the 5 migrations in order).
3. Create the owner user in Dashboard → Authentication, then run the bootstrap SQL at the bottom of migration 005.
4. Secrets (server-side only):
   ```
   supabase secrets set PAYMONGO_SECRET_KEY=sk_test_... PAYMONGO_WEBHOOK_SECRET=whsk_... \
       SITE_URL=https://your-site.example ALLOWED_ORIGINS=https://your-site.example
   supabase functions deploy create-checkout paymongo-webhook process-refund admin-create-staff
   ```
   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.
5. Register the webhook in PayMongo (Dashboard → Developers → Webhooks):
   URL `https://<ref>.functions.supabase.co/paymongo-webhook`, event **`checkout_session.payment.paid`**.
   Copy its signing secret into `PAYMONGO_WEBHOOK_SECRET`. Confirm GCash/Maya/etc. are activated on your PayMongo account.
6. Put the project URL and **anon** key in `web/js/config.js` (the only keys that may appear in the browser).
7. Auth settings: enable email confirmations as you prefer; set Site URL / redirect URLs to your domain.

## How the guarantees are enforced
| Requirement | Mechanism |
|---|---|
| No double booking | `create_booking_hold` takes a per-day advisory lock and re-validates inside the transaction; GiST **exclusion constraints** on (technician, time) and (station, time) are the final backstop; salon capacity = min(working techs, active stations) |
| Temporary hold | booking row is `held` with `hold_expires_at`; extended once at checkout creation; `expire_holds()` runs every minute (pg_cron) and on every availability/payment call |
| Payment is only real via webhook | only `process_payment_event()` (service role) sets `paid`; the Edge Function verifies the HMAC signature **and** re-fetches the checkout from PayMongo's API; return URL changes nothing (`waitForConfirmation` watches the DB) |
| Duplicate submissions / repeated webhooks | idempotency keys on bookings and payments; unique `provider_event_id`; paid payments are no-ops on replay; one pending checkout per booking |
| Wrong amount | `amount_mismatch` → never confirmed |
| Paid after hold expired | re-confirmed if the slot is still free, otherwise a full refund is queued automatically for owner approval |
| Preserved history | `appointment_items` / `sale_items` snapshot name, price, duration, technician, commission rate |
| Receipts | unique `FN-YYYYMMDD-#####` assigned only when the balance reaches zero; deposits and balances are separate `payments` rows |
| Refunds | staff request → owner approves → cash refunds finish instantly, online ones execute at PayMongo via `process-refund`; payment/sale/appointment statuses update |
| Access control | RLS on every table; all writes to appointments/money go through role-checked SECURITY DEFINER functions; customers see only their rows; owner-only config, audit log and dashboard |
| Secrets | service-role key, PayMongo secret and webhook secret exist only as Edge Function secrets |

## Tests
```
createdb scratch && psql scratch -f <your supabase stubs or run on a Supabase branch DB>
psql scratch -f supabase/migrations/*.sql   # in order
psql scratch -f supabase/tests/behaviour.sql   # expect every line PASS
bash supabase/tests/race.sh scratch 12         # expect: same_tech => exactly 1 success; any_tech => capacity successes
```
Last run: 78/78 assertions pass; 12 parallel sessions on one technician/slot → exactly 1 booking; 12 on "any tech"
with capacity 6 → exactly 6. Not covered locally (needs a live project): Supabase Auth, Storage, Realtime delivery,
the Edge Functions against PayMongo's sandbox. Test those in PayMongo **test mode** before going live.

## Behaviour changes vs. the current demo (deliberate)
- Deposit is paid through PayMongo checkout; the screenshot-upload + "Verify deposit / Reject" staff step is replaced by automatic confirmation.
- Starting a service requires an assigned technician.
- Refunds need owner approval; staff can only void **unpaid** invoices.
- Customers must register to book (guest booking removed, since holds/payments are tied to an account).
- Tax stays 12% added on top of the subtotal, like your current billing screen (configurable in business_settings.tax_rate).

## Phase 6 — wiring the HTML portals (next)
Replace each portal's `seed()/DB/localStorage/save()` block with the modules in `web/js`, keeping all markup/CSS:
`loadCatalog()` already returns data in your existing `SV / TE / hours / openDays / off` shapes; `free()` becomes
`getSlots()`; `submitB()` becomes `createHold()` → `uploadReference()` → `payDeposit()`; staff `verify/reject` are removed,
`pay()` becomes `createInvoice()` + `recordCounterPayment()`; realtime subscriptions re-render on change.

## Loading screen
`web/js/loader.js` (classic script, loaded first in both portals) shows a full-screen loading screen whenever the page is
waiting on the database, and only reveals the result after the data has arrived and the screen has been re-rendered.
- Every async function in `window.FN` is wrapped by `Loader.wrap(...)`, so **any** current or future data call is covered automatically.
- Start-up: the screen is visible from the first paint and released by `Loader.endInitial()` after the first render.
- Background realtime refreshes use `FN.raw.*` (same calls, no loading screen) so they never interrupt someone who is typing.
- Tuning constants (`MIN_VISIBLE_MS`, `HIDE_GRACE_MS`) and per-call messages (`LABELS`) are at the top of the file.

## Staff portal
`web/staff-ui-enhanced.html` (same look as the owner portal, same `Loader` screen) uses `js/staff.js` + `realtime.js`:
- **Dashboard** – bookings, waiting/in-service, walk-ins waiting, collected today, still owed, up next.
- **Appointments & Queue** – pick a day; check in / start / no-show / cancel; assign technician & station; walk-in queue (add, check in, remove).
- **Customer Records** – search customers, view their appointment history.
- **Billing & Payment** – create/edit invoices (appointment or walk-in sale), record counter payments, void unpaid invoices, view/print receipts, request a refund (the owner approves it in the owner portal).
Sign in with an account that has the `staff` role (owners can also open it). The owner adds staff by email in the owner portal.

## Web folder layout (HTML / CSS / JS split)
```
web/
  customer-ui-enhanced.html  owner-ui-enhanced.html  staff-ui-enhanced.html   markup only (~750 bytes each)
  css/       customer.css · owner.css · staff.css                              one stylesheet per portal
  img/       florals · dark · lace · emerald · blue · fruit · star (.jpg)      gallery photos (were base64 inside the page)
  js/        config · client · auth · catalog · booking · payments · realtime · staff · owner · loader   shared ES modules (data layer)
  js/pages/  <portal>.js          the portal's screens + handlers (classic script)
             <portal>.boot.js     ES module that wires js/*.js into window.FN
             <portal>.init.js     tiny start-up script (FNready promise)
```
Script order in each page: `loader.js` → `<portal>.init.js` → `<portal>.boot.js` (module) → `<portal>.js`.
Note `js/owner.js` / `js/staff.js` are the **data layer**; `js/pages/owner.js` / `js/pages/staff.js` are the **screens**.

## Gallery photos (owner-managed)
Owner portal → **Gallery & Photos**: add, replace, rename, reorder, hide/show and delete photos. Customers see exactly this list on the Gallery page.
- Any photo size works: uploads are resized (max 1600px JPEG) and every tile crops to fit; **Focus** (top / center / bottom) chooses what stays visible.
- **One-time setup:** run `database_gallery.sql` (same as `supabase/migrations/20260101000008_gallery.sql`) in the Supabase SQL Editor. It creates the `gallery_images` table, a public `salon-gallery` storage bucket (owner-only writes) and seeds the 7 current photos. Safe to re-run.
- Until that is run, the customer site keeps showing the 7 bundled photos in `web/img/`, and the owner page shows a setup hint.
- Code: `loadGallery` in `js/catalog.js` (public), owner functions at the end of `js/owner.js`, screen `ogal()` in `js/pages/owner.js`, display in `js/pages/customer.js`.
