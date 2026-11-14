# AOSI MEASUREMENT LAYER — v0

**Built:** 2026-11-13 · **Files:** `measure.js` (tracker) + `verify_measurement.py` (proof harness)
**Status:** INSTRUMENTED AND PROVEN · **SINK: UNCONFIGURED** (nothing is transmitted yet, on purpose)

---

## WHY THIS EXISTS

"scientifically intentional on every part of it" is a **claim** until the page can tell us what
happened. This layer is what turns the site from decoration into an instrument. It is also the
ecosystem's **transducer** — the first surface that can return the world's actual answer instead of
our model of it.

---

## THE GUARANTEES (each one is machine-checked, not promised)

| Guarantee | How it is enforced | Verified |
|---|---|---|
| No cookies | nothing is ever written to `document.cookie` | `no cookies set` → 0 |
| No local storage | nothing persisted at all | `no localStorage written` → 0 |
| No third-party script | `measure.js` is first-party, one file | refs audit, 0 external |
| No raw referrer | reduced to `direct` / `internal` / `external` | asserted in harness |
| No fingerprinting | no canvas, no fonts, no device list | code review |
| **No fake transmission** | `sink: null` → records locally, sends **nothing**, and reports `UNCONFIGURED` | `sent=0` asserted |

**The last one is the important one.** A tracker that silently drops events while appearing to work
is the same disease as a green test that never ran. `window.aosi.status()` must return `LIVE` before
anyone may claim the site is measuring anything.

---

## THE EVENTS

| Event | Fires | Carries | Question it answers |
|---|---|---|---|
| `page_view` | once, on load | path, brand, viewport bucket, referrer bucket | are people arriving, and from where (roughly) |
| `scroll_depth` | once each at 25/50/75/100 | `pct` | did they read past the hero — i.e. did the first screen earn the second |
| `dwell` | at 15s and 60s | `seconds` | did they stay long enough to be deciding rather than glancing |
| `cta_click` | on any `[data-track]` element | `label`, `href` | which ask is actually being taken |
| `exit` | on tab hide, once | `ms` | total engaged time, and where it ended |

**Tagging:** add `data-track="some_label"` to any link or button. No code change needed.
**Brand:** `<body data-brand="willwired">` — every event inherits it, so one collector can hold all
four businesses and still tell them apart.

---

## WHAT THIS LAYER CANNOT TELL YOU (stated plainly, not discovered later)

1. **No cross-visit identity.** Without cookies or storage there is no returning-visitor measure.
   Retention by person is **not measurable here** — only per-visit behaviour. If retention is the
   question, the answer needs a list (email), not a tracker.
2. **No conversion attribution.** We see the click on the load sheet. We do not see whether a mail
   arrived, whether it became a quote, or whether it became a sale. **Those are manual records until
   a real funnel store exists.**
3. **No revenue.** The tracker never touches money. Revenue lives in `kernel.commerce`, verified
   separately. A click is not a naira.
4. **No bot filtering.** Static-site beacons attract noise. Treat absolute numbers as soft; treat
   *ratios between pages and between CTAs* as the signal.

---

## THE ONE DECISION LEFT: THE COLLECTOR

The instrumentation is finished. The events have nowhere to land. Options, honestly weighed:

| Option | Cost | Privacy | Verdict |
|---|---|---|---|
| **Cloudflare Web Analytics** | free | cookieless, no PII, no cross-site | **RECOMMENDED.** One script or one beacon, no cookie banner needed, fits the no-tracking posture. |
| GoatCounter | free (non-commercial) | cookieless | Good, but a smaller operation to depend on. |
| Plausible / Fathom | paid | cookieless | Clean, but ₦0 budget. Later. |
| Our own collector | free | full control | Needs a server we do not have. Correct long-term, wrong this week. |
| Do nothing | free | perfect | The site stays a guess. Not acceptable given the order. |

**Blocker, named:** Cloudflare Web Analytics needs an account and the domain added — that is
EBVKA's action, not mine. Until it exists, `sink` stays `null` and the layer stays honestly
`UNCONFIGURED`.

---

## HOW IT WAS PROVEN

`python D:\temp\opencode\verify_measurement.py` → real headless Chrome, real local server,
**16/16 PASS**:

```
PASS  sink reported UNCONFIGURED (no fake transmission)
PASS  page_view fired once · brand is willwired · viewport bucketed · referrer reduced
PASS  scroll depth reached 100 [25, 50, 75, 100] · no duplicate depth events
PASS  cta_click fired · label captured "load_sheet" · mailto href captured
PASS  no cookies set · no localStorage written
PASS  nothing was sent while unconfigured (sent=0)
```

Page gate re-run after the theme change: **48/48 PASS, 0 FAIL.**

---

## NEXT PROOF (one, not a list)

Wire `sink` to a live collector and show the first real event arriving **in the collector's own
dashboard** — not in our console. That is the moment the site stops guessing.
