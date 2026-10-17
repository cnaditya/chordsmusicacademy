# CRM Changelog

Dated log of changes to the CRM (`crm.html`, `netlify/functions/pay-admin-student.js`, `receipt.html`, `class-mark.html`, `fee-setup.html`, and the Supabase `crm_*` tables). Every change — code or data — gets a dated entry here, newest first. Written so any Claude session (or Aaditya) can see what changed and why without digging through git log or chat history.

---

## 2026-10-17

**Fixed `fee-reminders.js` sending reminders to paused/dropped students (commit `6624271`)**
- Rakesh Boppana (CMA-2026-070, `status: paused`) got a `fee_overdue` WhatsApp this morning — the function only ever checked `is_active`, never `status`. Same root-cause bug that hit Shaik Aayat and Hameed earlier (worked around then by soft-deleting those two individually).
- Fixed properly this time: the function now skips any student with `status: "paused"` or `"dropped"` before deciding which reminder to send, logged in its `skipped` list with the reason. No more manual `is_active` cleanup needed when someone is paused — just set their status.

---

## 2026-10-15 (lead attribution + ads cleanup)

**Registration form: added "How did you hear about us?" (commit `83a18d5`)**
- `registration.html` step 4 now has a required single-select (Google, YouTube, Instagram, Friend/Reference, Walk-in), stored as "Source: X" prefixed into the existing `notes` field — no schema change. Flows through to Firestore, the CRM lead, `crm_public_trial`, and the owner's WhatsApp alert.
- Why: auditing Google Ads performance found the site had zero way to attribute a lead/enrollment to its actual source — couldn't tell if a student came from a paid ad, organic search, Instagram, or a referral. This closes that gap going forward (doesn't retroactively fix past data).

**Fixed `ads-report.js` silently ignoring non-standard `days=` values (commit `767075a`)**
- Only accepted an exact allowlist of `[7, 30, 90]`; any other value (e.g. `days=60`, `days=1`) silently fell back to 30 days with no error. This is the same issue flagged much earlier in the project as "`days=1` being ignored" and never actually fixed.
- Real impact found: comparing dashboard output against a direct Google Ads API query, Piano's true Sep 1–Oct 15 spend was ₹9,655 with 8 conversions (₹1,207/conversion) — the dashboard, silently capped to the last 30 days, had only been showing ₹5,790 and underselling Piano's real performance.
- Now clamps any requested integer to [1, 365] instead of rejecting it.

**Google Ads: paused Guitar, Violin, Drums campaigns** (via direct API mutation, not this repo)
- Reasoning: ₹3,831 combined spend Sep 1–Oct 15 across the three, zero real conversions (verified via Google's own conversion-action tracking, not just page views — checked each action's `include_in_conversions_metric`). 15 real Guitar/Violin/Drums students joined offline in the same window with no matching ad-tracked lead at all, meaning they came from referral/walk-in, not these ads — reinforces the pause rather than contradicting it.
- Piano and Vocal kept running (₹1,207 and ₹500 per conversion respectively — healthy).
- Open item: Piano's campaign excludes "WhatsApp Click" from its primary conversion count while Vocal's includes it (3 real WhatsApp leads on Piano aren't informing its Smart Bidding). Checked `campaign.selective_optimization` via the API — it's empty on all 5 campaigns, so that's not the mechanism. Needs checking directly in Ads UI → Piano campaign → Settings → Goals; not yet fixed.

---

## 2026-10-15

**Net Profit on the dashboard (commits `3bd5472`, `1fdeb45`)**
- Dashboard now shows **Expenses** and **Net Profit** stat cards next to Collected This Month. Net Profit = this month's offline collected revenue − total monthly expenses.
- Expenses are tracked in a new Supabase table, `crm_expenses` (`name`, `amount`, `is_active`) — **requires a one-time SQL migration**, see below. Until that table exists/has rows, expenses show as ₹0 and net profit = collected (no error, just nothing to subtract).
- Seeded with the three salaries Aaditya gave: Guitar Teacher ₹20,000, Violin Teacher ₹15,000, Vocal Teacher ₹12,000/month. Piano/Keyboard and Drums teachers aren't in the list yet — add them via the UI whenever their salary is confirmed.
- **Fully editable from the CRM UI**, no code change needed for future changes: click the Expenses card on the dashboard → add, edit, or remove any line (new backend actions `crm_expenses_list`/`crm_expense_add`/`crm_expense_update`/`crm_expense_delete`, soft-delete via `is_active`).
- SQL run by Aaditya in Supabase SQL Editor:
  ```sql
  create table if not exists crm_expenses (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    amount numeric not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
  );
  insert into crm_expenses (name, amount) values
    ('Guitar Teacher', 20000), ('Violin Teacher', 15000), ('Vocal Teacher', 12000);
  ```
- **Checked after Aaditya ran the SQL**: the insert had run twice, leaving 6 rows (duplicated Guitar/Violin/Vocal) and doubling expenses to ₹94,000, which pushed Net Profit negative. Removed the 3 duplicate rows — back to the correct 3. Also smoke-tested add/update/delete end-to-end (temporary "TEST Drums Teacher" row, confirmed dashboard total changed and reverted correctly, then deleted).

---

## 2026-10-13

**Receipt download, WhatsApp, and Payment History (commits `ff917cf`, `35cac8d`)**
- `downloadReceiptFromNote` in `crm.html` now generates a full A4 PDF matching the standard template (dark navy header, gold "CHORDS MUSIC ACADEMY", BILLED TO, items table, gold TOTAL PAID band, Payment Details with next due date, Amount in Words, 10-item T&C, footer) — generated directly from any ₹ note, not a separate receipts table.
- "Payments This Month" dashboard table and a student's **Payment History tab** (new — shows all months, not just current) both got 📄 Download Receipt and 📱 WhatsApp buttons per row.
- WhatsApp receipt message now includes the next due date.
- **Auto-date-correction added** to `crm_dashboard`: on every load, for each offline ₹ note dated this month, the backend tries subtracting 1/2/3/5/6/12 months from the student's `due_date` — whichever lands in the current month becomes the note's "corrected" `created_at`, silently PATCHed. Self-heals notes added with the wrong date. **Caveat:** a correction/explanatory note that itself contains a ₹ amount gets treated as a second real payment and double-counts — delete bad notes outright (no API action for this, use Supabase directly) or use the new `crm_update_note` action instead of annotating.
- **New action `crm_update_note`** — `{note_id, created_at}`, manually sets a note's payment date.
- **Auto-receipt on enrollment** — creating a student with `amount_due > 0` now auto-generates a receipt note immediately.
- Rakesh Boppana (CMA-2026-070) marked `status: paused`.

**`crm_mark_paid` now auto-issues a receipt (commit `aa2be78`)**
- Previously wrote a plain note using "Rs." (not ₹), which made the payment invisible to the dashboard's "fees collected this month" stat (that stat only regex-matches ₹).
- Fixed: now assigns the next receipt number and writes the note in the same `Receipt #NNNN issued — ₹X · ...` convention the Receipt tool uses, so Mark Paid (UI button or via chat) is correctly tracked automatically. Toast in `crm.html` now shows the receipt number.

**Data corrections (this session, via direct note edits)**
- Nayan Krishna (CMA-2026-015): Oct payment note used "Rs." — corrected to ₹7,500, now counted.
- Kanak S (CMA-2026-104): Receipt #1026 note used "Rs." — corrected to ₹8,397.
- Gaganasri (CMA-2026-114, online): note used "Rs." — corrected to ₹15,000 for consistency (online isn't counted in the dashboard stat regardless).
- Hamza (CMA-2026-129), Sahasra Srimahathi (CMA-2026-130): had due dates but were never actually billed — issued Receipt #1037/#1038, ₹8,397 each.
- Tarishi Nayak (CMA-2026-109): billed a duplicate Receipt #1039 (₹21,588) before discovering she already had a real receipt (#1034, issued 04-Oct via a local-only script that never wrote to Supabase — see below). Net effect: one ₹21,588 note stands (#1039's content), correctly represents the real payment once.
- Sai Vignesh Puchakayala (CMA-2026-124), Kushagra Garg (CMA-2026-128): briefly billed ₹8,397 each as "Offline Group Class" joins — **reverted**. Both are still `status: trial` (registration-form leads, not confirmed enrollments); Sai Vignesh's address is Halifax, Canada — cannot attend an offline Manikonda class. Mode/plan/due_date reverted to original; do not bill either until they actually confirm enrollment.
- "naga" (CMA-2026-068): dummy test student using the owner's own phone (7702031818) — soft-deleted (`is_active: false`).
- Found 2 receipts (Kanak #1026, Tarishi #1034) that were generated by a local one-off script (`/Users/aaditya/chords-ads-automation/generate_receipt.py`) which produces a polished PDF but never writes back to Supabase — both since reconciled into `crm_notes`. If a receipt number doesn't show up in a student's notes, check that folder before assuming the payment was never recorded.

---

## Earlier (context, not exhaustively dated)
- `crm_mark_class` (class-mark.html) built: marks a class taken, auto-sends WhatsApp via the `cma_update` template.
- Leave approval logic: max 2 approved leaves/month, due date never shrinks, `cycle_start` stored explicitly on the student record.
- Joining form duplicate-detection fixed to compare phone **digits only** (so +91/spacing differences don't create duplicate records).
- Fee-reminder WhatsApp templates (`fee_reminder_advance/tomorrow`, `fee_due_today`, `fee_overdue`, `winback_offer`) got a "This is a system generated message" line added.

---

*Format for new entries: `## YYYY-MM-DD` heading, then what changed and why in a few bullets. Keep entries factual and specific enough that a reader six months later understands the change without needing the original conversation.*
