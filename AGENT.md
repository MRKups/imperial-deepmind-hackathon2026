# AGENT.md — Anticipatory Health Agent

**Project:** `imperial-deepmind-hackathon2026`
**Purpose:** This file is the single source of truth for how the agent thinks. Code reads the data; this file defines what counts as a signal, how it is ranked, what the models are each allowed to see, and what the user finally reads.

---

## 0. How to use this file

The system is **not** "put the data in an LLM and ask for insights." It is a four-stage loop where deterministic code does the arithmetic and the models do only what models are good at.

```
[ JSON files ]
      |
      v
(1) TRIGGER ENGINE  — deterministic JavaScript. No LLM.
      |  emits: candidate triggers, already scored
      v
(2) PASS A — GEMMA (local, sees PII)
      |  picks ONE trigger, decides if external facts are needed,
      |  writes a de-identified research question
      v
(3) RESEARCH — GEMINI (cloud, sees NO PII)
      |  answers the question, returns facts + sources
      v
(4) PASS B — GEMMA (local, sees PII)
      |  merges facts with personal context
      v
[ 60-word message to the user ]
```

**Non-negotiable design rules:**

1. **Code computes, models phrase.** Every number in the final message is calculated in stage 1. Gemma never does arithmetic. Gemma is a small model — treat it as a writer with judgement, not a reasoner.
2. **Both Gemma passes return strict JSON.** No free-form prose from Gemma except inside a named string field with a word cap.
3. **Gemini never receives PII.** Not name, not DOB, not email, not location beyond destination country, not medication names for rare drugs. Stage 2 constructs a generic query; stage 3 answers it in the abstract; stage 4 re-personalises locally.
4. **Exactly one hero insight per run.** Plus at most two one-line secondaries. Ranked lists kill anticipation — they read like a dashboard.
5. **Every output ends in an action that can be done or booked this week.** No exceptions.

---

## 1. Mission

> Surface the one thing the user has not yet thought to ask about, early enough that they can still act on it, and tell them exactly what to do.

The agent is judged on **lead time**, not on insight quality. "You've been sleeping badly" is worthless — they know. "Your metformin runs out two days after you land in Bogotá" is the product.

**Run cadence:** once daily, 07:00 local. Morning run only. The message covers *yesterday's data and the coming weeks' obligations*.

---

## 2. Data contract

All data lives as JSON, one file per source, in `/data/`. **MVP window: the trailing 30 days.** Production would use 12–24 months for baselines and lifetime for medical history; every window below is a named constant in §9 so it can be widened without touching the logic.

### 2.1 `profile.json` — authoritative, static, from onboarding
```json
{
  "name": "string",
  "dob": "YYYY-MM-DD",
  "height_cm": 0,
  "weight_kg": 0,
  "conditions": ["type_2_diabetes"],
  "allergies": ["penicillin"],
  "vaccinations": [{ "name": "yellow_fever", "date": "YYYY-MM-DD" }],
  "last_dental": "YYYY-MM-DD",
  "last_gp": "YYYY-MM-DD",
  "pharmacy_platform": "nhs_app | boots | pharmacy2u | local",
  "onboarding_complete": true
}
```
Reliability: **authoritative**. Never contradict it. If a behavioural signal conflicts with a stated condition, the condition wins.

### 2.2 `medications.json` — authoritative, drives the highest-priority trigger
```json
[{
  "name": "metformin",
  "dose_mg": 500,
  "doses_per_day": 2,
  "qty_dispensed": 56,
  "date_dispensed": "YYYY-MM-DD",
  "repeat_available": true,
  "class": "common | sensitive"
}]
```
`class: "sensitive"` (HIV, mental health, contraception, oncology, fertility) means **the drug name never leaves the device**, even to Gemini. Query by category instead.

### 2.3 `wearables.json` — high confidence, daily records
```json
[{
  "date": "YYYY-MM-DD",
  "resting_hr": 0,
  "sleep_hours": 0.0,
  "sleep_onset": "HH:MM",
  "sleep_quality": 0,
  "steps": 0,
  "stand_hours": 0,
  "active_minutes": 0
}]
```
Reliability: **high** for HR/steps, **medium** for sleep quality.

### 2.4 `spending.json` — high confidence, timestamped (required)
```json
[{
  "timestamp": "YYYY-MM-DDTHH:MM:SS",
  "merchant": "string",
  "category": "coffee | fast_food | groceries | alcohol | pharmacy | gym | transport | other",
  "amount_gbp": 0.00
}]
```
Timestamps are **required** — the behavioural coupling rules in §7 depend on time of day, not daily totals.

### 2.5 `screentime.json` — low confidence, use only as corroboration
```json
[{ "date": "YYYY-MM-DD", "total_minutes": 0, "after_2200_minutes": 0, "pickups": 0 }]
```
Never the sole basis for a hero insight. It supports a sleep finding; it does not make one.

### 2.6 `location.json` — medium confidence
```json
[{ "date": "YYYY-MM-DD", "gym_visit": true, "gym_minutes": 0, "commute_minutes": 0 }]
```

### 2.7 `events.json` — extracted from Gmail at the start of each run
```json
[{ "event_type": "flight | dental | gp | pharmacy | hotel | other",
   "date": "YYYY-MM-DD", "location": "string", "source_subject": "string" }]
```

**Gmail scan spec** — the mailbox is read locally, every run, and reduced to the above *before anything else touches it*:

- **Window:** messages received in the last 30 days, referencing dates in the next 60 days.
- **Sender/subject filters:** airlines and OTAs (`booking`, `itinerary`, `e-ticket`, `boarding`), dental practices (`dental`, `hygienist`, `recall`), GP surgeries and NHS (`appointment`, `nhs.net`, `surgery`), pharmacies (`prescription`, `repeat`, `ready to collect`), hotels, vaccination clinics.
- **Extraction only.** Pull `{event_type, date, location}`. Discard subject bodies, sender addresses, booking references, seat numbers, and prices immediately. `source_subject` is kept truncated to 60 chars *for local display only* and is never forwarded to stage 3.
- **No email content is ever sent to Gemini.** Ever. This is the claim the whole privacy story rests on.

---

## 3. Cold start — first run only

If `profile.onboarding_complete` is false, do not attempt analysis. Ask for the six fields below, in this order, one screen each. Behavioural data alone produces a generic wellness app; the medical history is what makes the agent *anticipatory*, because it introduces obligations that have deadlines.

| # | Field | Why it is worth asking for |
|---|---|---|
| 1 | Conditions | Drives the risk amplification table (§6). Without it, five McDonald's a week scores the same for everyone. |
| 2 | Medications (name, dose, frequency, qty dispensed, date dispensed) | Drives the prescription clock — the single highest-value trigger in the system. |
| 3 | Allergies | Safety gate on any recommendation involving medication or vaccination. |
| 4 | Last dental / last GP visit | Enables the overdue-appointment trigger from day one, before any behavioural history exists. |
| 5 | Height / weight / DOB | Calorie and risk baselines; age gates screening recommendations. |
| 6 | Vaccination record | Enables the travel trigger to say what you *need*, not what exists. |

**Partial answers are acceptable.** Each missing field disables its dependent triggers and lowers `confidence` on the rest (§8). Never block the first run — a degraded first message beats no first message. Record which fields are missing and re-prompt for **one** of them, at most, on any subsequent run.

---

## 4. Trigger engine — deterministic, no LLM

Stage 1 walks the JSON and emits candidate triggers as plain sentences with pre-computed numbers. Seven classes, in priority order.

### 4.1 Prescription run-out — **priority 1**

```
days_supply     = qty_dispensed / doses_per_day
days_elapsed    = today - date_dispensed
days_remaining  = days_supply - days_elapsed
```

| Condition | Severity | Action to recommend |
|---|---|---|
| `days_remaining <= 10` | warn | Order the repeat now — NHS repeats typically take **5 working days** from request to collection. |
| `days_remaining <= 3` | urgent | Order today; name the same-day route (pharmacy counter, or urgent supply via NHS 111). |
| `days_remaining < 0` | escalate | Flag as overdue. If the drug class should not be stopped abruptly, say so (Gemini supplies this, by class not by name). |

Emit one candidate per medication. `actionability = 1.0` — reordering is unambiguously doable.

### 4.2 Upcoming travel — **priority 2**

Fires on any `event_type: "flight"` within `TRAVEL_LOOKAHEAD` (60 days). Compute `days_until_departure`. Sub-checks:

- **Vaccination gap** — compare destination requirements (Gemini) against `profile.vaccinations`. Many vaccines need **4–6 weeks** to take effect, so a trip at 45 days is *already* time-critical. This is the trigger most likely to be genuinely news to the user.
- **Medication supply across the trip** — does `days_remaining` (§4.1) cover `departure + trip_length`? If not, this becomes a **compound trigger** and jumps to the top of the ranking regardless of individual scores.
- **Destination-specific risk** — altitude (Bogotá is 2,640 m), heat, air quality, water. Cross-reference against `profile.conditions`: altitude matters far more for a cardiac or respiratory history than for a healthy 22-year-old.

### 4.3 Appointment due or overdue — priority 3

- Dental: `today - last_dental > DENTAL_INTERVAL` (default 365 days; NICE recall for low-risk adults extends to 24 months, so word this as "worth booking", never "overdue" unless > 24 months).
- GP: no visit in `GP_INTERVAL` (default 730 days) **and** at least one chronic condition present — a healthy person with no GP visit in two years is not a finding.
- Booked-appointment prep: an `event_type` of `dental` or `gp` within 7 days fires a "what to bring / what to ask" candidate.

### 4.4 Risk-amplified behaviour — priority 4

A behavioural frequency crossed with `profile.conditions` via the amplification table (§6). This is the class that turns a spending tracker into a health agent.

```
raw_score        = frequency_over_baseline
amplified_score  = raw_score * multiplier_from_table
```

Fires when `amplified_score` clears `AMPLIFIED_THRESHOLD`. Five fast-food purchases in seven days is unremarkable at ×1 and a hero insight at ×3.

### 4.5 Behavioural coupling — priority 5

Timestamped cross-source rules. See §7. These are lookups, not inferences — Gemma is never asked to discover a correlation.

### 4.6 Trend inflection — priority 6

Compare the trailing `W_RECENT` (7 days) against the preceding `W_BASELINE - W_RECENT` (23 days), normalised per-day. Fires at `±TREND_THRESHOLD` (25%).

> **MVP note:** 30 days of history is a thin baseline — a single holiday week distorts it. Report trends as "up 40% on your last three weeks", never "up 40%" unqualified. In production this becomes 7d vs trailing 90d and the qualifier is dropped.

### 4.7 Absence — priority 7

Nothing happened, and that is the signal. Dashboards never catch these because there is no data point to plot.

- No gym visit in `ABSENCE_GYM_DAYS` (12) when the 30-day baseline shows a habit.
- No day with `steps > 5000` in 7 days.
- Medication marked `repeat_available` with no pharmacy transaction in `spending.json` in 35 days.

---

## 5. Compound triggers

When two candidates share a date window, merge them. Compound triggers **always outrank their components** and are the strongest demonstration of the architecture, because no single-source app can produce them.

Defined compounds:

| A | B | Merged output |
|---|---|---|
| Prescription run-out | Upcoming travel | Order before you fly; carry in hand luggage with the dispensing label. |
| Upcoming travel | Vaccination gap | Book the travel clinic now — the vaccine needs N weeks to take effect. |
| Risk-amplified diet | Upcoming GP appointment | Raise it at the appointment; here is what to ask. |
| Late caffeine | Sleep decline | Name the specific transaction times, not the daily total. |

---

## 6. Risk amplification table

Gemma does not need to *know* clinical risk. This table tells it. Look up every condition in `profile.conditions`, take the **highest** applicable multiplier per behaviour, and never stack above ×4.

| Condition | Behaviour amplified | × |
|---|---|---|
| Type 2 diabetes | fast_food frequency, sugary drink spend, sedentary hours, missed medication | 3 |
| Type 1 diabetes | irregular meal timing, alcohol spend, exercise without carb data | 3 |
| Hypertension | takeaway frequency (sodium proxy), alcohol spend, sleep < 6h, resting HR rise | 3 |
| Cardiovascular disease | sedentary hours, resting HR rise, altitude travel, alcohol | 4 |
| Asthma / COPD | destination air quality, cold-weather travel, gym absence | 2 |
| Anxiety / depression | screentime after 22:00, sleep irregularity, alcohol spend, gym absence | 2 |
| High cholesterol | fast_food frequency, low active minutes | 2 |
| Pregnancy | alcohol spend, caffeine total, travel destination risk, medication safety | 4 |
| Immunocompromised | travel destination risk, vaccination gaps | 4 |
| None recorded | — | 1 |

**Worked example.** Five `fast_food` transactions in 7 days against a 30-day baseline of two per week.
`raw_score = 2.5`. No conditions → `2.5 × 1 = 2.5`, below threshold, does not fire.
Type 2 diabetes → `2.5 × 3 = 7.5`, well clear, becomes the hero insight.
Same data, different person, correct answer both times.

---

## 7. Behavioural coupling rules

Stated as `if X and Y then Z`. Code evaluates the condition; Gemma phrases the result. Do not add rules Gemma has to infer.

| Rule | Condition | What to say |
|---|---|---|
| **Late caffeine → sleep** | ≥ 2 `coffee` transactions after **14:00** in 7 days **and** mean `sleep_onset` on those nights ≥ 30 min later than on other nights | Name the actual purchase times and the actual onset delta. "Your 16:20 coffee on Tuesday" beats "caffeine affects sleep." |
| **Late training → sleep** | ≥ 2 `gym_visit` sessions starting after **20:00** **and** `sleep_hours` on those nights below the 30-day mean | Suggest shifting one session earlier, name which one. |
| **Late screentime → quality** | `after_2200_minutes` 7-day mean > 60 **and** `sleep_quality` below the 30-day mean | Corroborating evidence only — never the hero insight on its own (§2.5). |
| **Takeaway → next-day HR** | `fast_food` or `alcohol` transaction **and** next-day `resting_hr` ≥ 3 bpm above the 30-day mean, on ≥ 3 occasions | Report as an observed pattern in *their* data, with the count. Do not claim causation. |
| **Alcohol → sleep** | ≥ 3 `alcohol` transactions in 7 days **and** mean `sleep_quality` on those nights below baseline | As above — pattern, not mechanism. |
| **Commute collapse** | `commute_minutes` near zero for ≥ 5 days **and** `steps` down > 25% | Sedentary drift; suggest one concrete replacement. |

---

## 8. Scoring and selection

```
score = urgency × actionability × confidence × amplifier
```

**urgency** — from the deadline, if there is one:

| Days until deadline | urgency |
|---|---|
| Overdue | 1.0 |
| 0–3 | 1.0 |
| 4–10 | 0.8 |
| 11–30 | 0.6 |
| 31–60 | 0.4 |
| No deadline (trend/absence) | 0.25 |

**actionability** — fixed per class: prescription 1.0 · travel/vaccine 0.9 · appointment 0.8 · risk-amplified diet 0.5 · coupling 0.5 · trend 0.3 · absence 0.3.

**confidence** — data quality: all required fields present 1.0 · onboarding partial 0.7 · single-source and low-reliability (screentime alone) 0.4 · fewer than 14 days of history for a trend claim 0.5.

**amplifier** — from §6, else 1.

**Tie-breaks, in order:** (1) compound beats simple; (2) earlier deadline; (3) not shown in the last 7 days; (4) lower priority number from §4.

**Suppression.** Do not repeat the same `trigger_id` within 7 days unless its severity has escalated. Keep a `shown_log.json` of `{trigger_id, date, severity}`. An agent that says the same thing every morning gets muted by day three — this rule is the whole retention story.

---

## 9. Configuration constants

```js
const CONFIG = {
  W_RECENT:              7,      // days — the "now" window
  W_BASELINE:            30,     // days — MVP limit. Production: 90–365.
  TREND_THRESHOLD:       0.25,   // ±25% shift to call a trend
  AMPLIFIED_THRESHOLD:   4.0,    // amplified_score needed to fire §4.4
  PRESCRIPTION_WARN:     10,     // days remaining
  PRESCRIPTION_URGENT:   3,
  NHS_REPEAT_LEAD_DAYS:  5,      // working days, request → collection
  TRAVEL_LOOKAHEAD:      60,     // days
  VACCINE_LEAD_DAYS:     42,     // most travel vaccines need 4–6 weeks
  DENTAL_INTERVAL:       365,
  GP_INTERVAL:           730,
  ABSENCE_GYM_DAYS:      12,
  HR_DELTA_BPM:          3,
  MAX_OUTPUT_WORDS:      60,
  SUPPRESSION_DAYS:      7,
  RUN_TIME:              "07:00"
};
```

---

## 10. Pass A — Gemma, local, sees PII

**Job:** pick one trigger, decide whether external facts are needed, and write a research question containing no personal information.

**Input:** the scored candidate list from stage 1 (already ranked, numbers pre-computed), plus `profile.conditions` and today's date.

**System prompt:**

```
You are the local reasoning stage of a personal health agent. You run on the
user's device and you are the only component that sees their identity.

You will receive a ranked list of candidate triggers. Numbers have already
been calculated for you — do not recalculate anything, do not question the
arithmetic, and do not invent figures that are not in the input.

Your tasks, in order:
1. Select exactly ONE trigger as the hero. Prefer the highest score. Override
   only if the top trigger was shown in the last 7 days at the same severity.
2. Select at most TWO others as secondaries. They must be from different
   trigger classes than the hero.
3. Decide whether the hero needs external facts you do not have — medical
   guidance, country requirements, booking procedures, lead times.
4. If it does, write ONE research question that a stranger could read without
   learning anything about this user.

Rules for the research question:
- No name, age, date of birth, email, address, or city of residence.
- Destination country only. Never the user's home location.
- Never name a medication whose class is "sensitive" — describe the drug
  category instead.
- Ask a general question. "Which vaccinations are recommended for travel to
  Colombia from the UK?" — not "what vaccines does this diabetic need."
- If the trigger is pure arithmetic (a prescription running out) and no
  external procedure is involved, set needs_research to false.

Return ONLY this JSON. No prose, no markdown fence, no explanation.

{
  "hero_trigger_id": "string",
  "hero_reason": "string, max 20 words, why this one over the others",
  "secondary_trigger_ids": ["string"],
  "needs_research": true,
  "research_question": "string or null",
  "pii_check_passed": true
}
```

**Validation before stage 3 runs:** regex the `research_question` against the user's name, DOB, email, home city, and every medication marked `sensitive`. On any match, drop the question and re-run Pass A once. On a second failure, proceed with `needs_research: false`. **Fail closed** — a slightly worse message is always better than a leak.

---

## 11. Research — Gemini, cloud, sees no PII

**Input:** the `research_question` string. Nothing else. No JSON, no profile, no history.

**System prompt:**

```
You are a research assistant answering a general health or travel logistics
question. You have no information about who is asking and you must not ask
for any.

Answer using authoritative sources only. Preferred, in order:
  NHS (nhs.uk) · NICE · UKHSA / TravelHealthPro (fitfortravel.nhs.uk) ·
  WHO · CDC · MHRA · NHS App guidance pages

Return ONLY this JSON:

{
  "answer": "string, max 80 words, factual, no hedging padding",
  "key_facts": ["string, max 15 words each, max 4 items"],
  "lead_time_days": 0,
  "source_name": "string",
  "source_url": "string"
}

Constraints:
- If the answer depends on individual circumstances, say what it depends on
  and stop. Do not guess.
- lead_time_days is how far in advance the action must be taken. 0 if not
  applicable.
- If you cannot answer from the sources above, return answer: "insufficient
  source" and leave the rest null. Do not substitute general knowledge.
```

**Query hygiene checklist:**

- Home location never leaves the device. Destination country only.
- Drug names: common drugs (metformin, atorvastatin, salbutamol) may be sent. `class: "sensitive"` drugs are described by category — "a daily antiretroviral", "a long-acting contraceptive".
- Conditions may be sent **only** where they materially change the answer, and only in generic form: "traveller with a respiratory condition". Never combined with any other attribute, since condition + age + destination is quasi-identifying.
- No email content, ever.

---

## 12. Pass B — Gemma, local, sees PII

**Job:** merge the research facts with the personal numbers into the final message.

**Input:** the hero trigger with its computed values, the secondaries, the Gemini JSON (or null), and `profile.name`.

**System prompt:**

```
You are writing this morning's message. It will be read in about ten seconds,
on a phone, before the user does anything else.

Use exactly this structure. Four lines. No greeting, no sign-off, no emoji.

[Noticed]  What you found. Include the specific number from the data.
[Why now]  The deadline or the change. Why this matters TODAY, not in general.
[Do]       One action. Bookable or doable this week. Name the place or platform.
[Source]   Source name and URL. Omit this line entirely if there was no research.

Then, if there are secondaries, add up to two lines beginning "Also:" of at
most 12 words each.

Hard rules:
- The whole message, secondaries included, is at most 60 words.
- Every number you use must appear in the input. Never estimate, round for
  effect, or invent a figure.
- Be specific where the data allows it. "Your 16:20 coffee on Tuesday and
  15:50 on Thursday" beats "afternoon caffeine".
- The [Do] line must be a single concrete act. If you cannot name one, you
  have chosen the wrong trigger — say so by returning "action": null.
- You are not a doctor. You never diagnose, never name a condition the user
  has not already told you they have, and never advise starting, stopping, or
  changing a dose.

BANNED — never write these:
  "consider reducing"        "you may want to think about"
  "try to get more"          "it might be worth"
  "aim to improve"           "as always, listen to your body"
  "studies show"             "experts recommend"
  any sentence with no verb the user can perform this week

GOOD:
  "Order your metformin repeat on the NHS App today."
  "Book a travel clinic appointment this week — 020 XXXX XXXX."
  "Move Thursday's gym session to 18:00."

Return ONLY this JSON:

{
  "noticed": "string",
  "why_now": "string",
  "action": "string or null",
  "source_name": "string or null",
  "source_url": "string or null",
  "secondaries": ["string"],
  "word_count": 0
}
```

**Post-validation in code:** enforce the word cap, verify every digit in the output appears in the input, check no banned phrase survived, confirm `action` is non-null. On failure, re-run Pass B once with the failure reason appended. On a second failure, fall back to the template in §14.

---

## 13. Guardrails

1. **Never diagnose.** Frame everything as observation plus a suggestion to check with a professional. "Your resting heart rate is up 6 bpm on your 30-day average — worth mentioning at your GP appointment on the 14th." Never "you may have an infection."
2. **Never change medication.** The agent may say *reorder*, *don't run out*, *carry it in hand luggage*, *ask your pharmacist*. It may never say start, stop, skip, split, or adjust.
3. **Allergy gate.** Any recommendation touching a drug or vaccine is checked against `profile.allergies` first. On a match, the recommendation becomes "check with the clinic — your record lists a penicillin allergy."
4. **Red-flag escalation.** If the data shows resting HR up > 15 bpm sustained over 5 days, `sleep_hours` under 4 for 5 consecutive nights, or an overdue medication for a condition where interruption is dangerous, drop the normal format and output a single line directing the user to NHS 111 or their GP. No insight, no trend, no source. Just the direction.
5. **Cite or stay silent.** Any external fact carries its source URL. If Gemini returned `"insufficient source"`, the agent says what it does not know rather than filling the gap.
6. **Regulatory framing.** This is an information and logistics tool. Everything is phrased as *prompting the user to act with a professional*, never as clinical judgement. Booking a travel clinic is logistics; deciding which vaccine you need is medicine, and that belongs to the clinic.

---

## 14. Worked examples

### Example 1 — Compound: prescription × travel

*Input:* metformin, 56 tablets dispensed 2026-08-04, 2/day → 28 days' supply, 10 remaining. `events.json` has a flight to Bogotá on 2026-09-08 (17 days out), returning 09-22. `profile.conditions: ["type_2_diabetes"]`, no yellow fever vaccination on record.

*Pass A output:*
```json
{
  "hero_trigger_id": "compound_rx_travel_001",
  "hero_reason": "Supply runs out mid-trip; deadline is departure, not run-out date",
  "secondary_trigger_ids": ["vaccine_gap_colombia", "fastfood_amplified_7d"],
  "needs_research": true,
  "research_question": "What are the rules for carrying prescription medication into Colombia, and which vaccinations are recommended for travellers from the UK?",
  "pii_check_passed": true
}
```

*Final message (54 words):*
> **Noticed** — 10 days of metformin left; your Bogotá trip is 14 days long, departing the 8th.
> **Why now** — NHS repeats take 5 working days. Order after Wednesday and you fly without cover.
> **Do** — Request the repeat on the NHS App today, and book a travel clinic this week — yellow fever needs 10 days to take effect.
> **Source** — TravelHealthPro · fitfortravel.nhs.uk
>
> Also: Bogotá is 2,640 m — hydrate on day one.

### Example 2 — Risk-amplified behaviour

*Input:* 5 `fast_food` transactions in 7 days vs a 30-day baseline of 2/week. `raw = 2.5`, T2 diabetes → `× 3 = 7.5`. GP appointment on file for 2026-09-02.

*Final message (41 words):*
> **Noticed** — Five fast-food purchases this week, against two a week over the past month.
> **Why now** — Your GP appointment is on the 2nd — twelve days away, and this is the window they'll ask about.
> **Do** — Swap two of next week's for something you can eat at your desk, and mention the change on the 2nd.
>
> Also: no gym visit in 9 days.

No research call — this is entirely internal data plus the amplification table. `needs_research: false`.

### Example 3 — Behavioural coupling

*Input:* coffee transactions at 16:20 Tue and 15:50 Thu. `sleep_onset` on those nights 00:48 and 00:41 against a baseline of 23:55 — a 48-minute mean delay.

*Final message (38 words):*
> **Noticed** — Coffee at 16:20 Tuesday and 15:50 Thursday. You fell asleep 48 minutes later on both nights.
> **Why now** — It's happened twice this week, and your 7-day sleep average has dropped to 6.1 hours.
> **Do** — Make Friday's afternoon coffee a decaf and check whether Saturday's onset returns to normal.

Note the shape: it proposes a **test the user can run**, not a lecture. This is the tone to aim for throughout.

---

## 15. Failure modes and fallbacks

| Failure | Fallback |
|---|---|
| No trigger clears threshold | Output a single line: one thing that went well in the last 7 days, drawn from the data. Never fabricate a concern to have something to say. |
| Gemini unreachable or `"insufficient source"` | Proceed with `needs_research: false`. Emit the trigger with an internal-data-only action. Omit the `[Source]` line. |
| Pass A returns invalid JSON | Retry once with `"Return only valid JSON."` appended. On second failure, take the top-scored trigger by code and skip to Pass B. |
| Pass B fails validation twice | Emit the code-generated template: `"[trigger_sentence]. [computed_deadline]. [class_default_action]."` Ugly, correct, never blank. |
| Onboarding incomplete | Run on whatever exists. Append one line naming the single most valuable missing field. |
| Fewer than 14 days of data | Disable trend and absence classes entirely. Prescription, travel, and appointment triggers still work from day one — which is why the onboarding block earns its place. |
| PII check fails twice | Proceed without research. Log it. Never send the question anyway. |

---

## 16. What this file deliberately does not do

- **No causal claims.** Every coupling rule reports co-occurrence in the user's own data, with counts. "On three of the four nights after a takeaway, your resting heart rate was up" — not "takeaways raise your heart rate."
- **No population statistics.** The agent talks about this person's numbers. If a figure did not come from their files or from a cited source, it does not appear.
- **No engagement mechanics.** No streaks, no scores, no badges. The agent earns the next open by having been right and early on the last one — that is the entire retention model, and the suppression rule in §8 protects it.
