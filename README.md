# SakhiSign

AI-based sign-language **learning and evaluation** platform.

SakhiSign is **not** a sign classifier. The user always selects the sign first;
the system only answers: *"How closely did you perform the sign you selected?"*
It teaches a small set of safety/health signs (Pain, Help, Emergency, Doctor,
Medicine, Water) through learn → practice → evaluate → feedback.

```
selected sign ─▶ load reference ─▶ extract features ─▶ DTW similarity ─▶ score ─▶ feedback
```

---

## Architecture

The evaluation logic is a single **sign-agnostic engine**. Adding a new sign
means adding one config entry + recording a reference — **no new code**.

```
engine/
  landmarks.py   geometry: angles, per-hand normalization, palm size
  features.py    raw frame -> 18-dim feature vector (shape + relationship)
  config.py      SIGNS registry: per-sign metadata, weights, calibration
  dtw.py         time-warped weighted distance, with mirror/hand-swap
  scoring.py     normalized distance -> 0..100 score + verdict
  feedback.py    targeted, per-finger / per-hand feedback
  pipeline.py    build & load reference feature sequences
  evaluate.py    evaluate(sign, frames) -> score + feedback   <-- entry point

service/app.py   FastAPI wrapper (GET /signs, POST /evaluate, ...)
record_sign.py   generic webcam recorder (reference OR --user attempt)
evaluate_cli.py  evaluate a recorded attempt from the terminal
data/references/ generated reference feature sequences (per sign)
recordings/      raw reference recordings (per sign)
legacy/          the original per-sign prototype scripts (superseded)
```

The core engine (`engine/`) has **no third-party dependencies** — pure Python,
so it runs anywhere, including inside the FastAPI service.

### The HELP fix (inter-hand relationship)

Two-handed signs like **Help** are defined largely by the *relationship between
the hands*. The original pipeline computed that relationship from
**normalized** landmarks, but normalization centers every wrist to the origin —
so `right_wrist - left_wrist` was `[0,0,0]` on every frame and the most
important feature was dead.

The engine keeps **two views** of each hand:

| Feature group | Computed from | Why |
|---|---|---|
| Shape (finger bends, openness) | **normalized** landmarks (wrist-centered, palm-scaled) | invariant to hand position & camera distance |
| Relationship (inter-hand distance & direction) | **raw** landmarks, scaled by palm size | preserves real inter-hand geometry, still camera-distance invariant |

Verified: HELP inter-hand distance now ranges **1.50 → 3.21** across the
outward motion (previously a constant `0.000`).

### Feature vector (18 dims, stable layout)

```
0..5    left  hand shape  [thumb, index, middle, ring, pinky, openness]
6..11   right hand shape  [thumb, index, middle, ring, pinky, openness]
12      inter-hand distance        (palm-scaled)
13..15  inter-hand vector dx,dy,dz (palm-scaled)
16,17   left/right hand present (1/0)
```

### Why DTW + left/right-hand support

DTW aligns the reference and user in time, so faster/slower/paused performances
still match. `mirror=True` also evaluates the hand-swapped user sequence, so a
**left-handed** performance of a right-handed reference scores correctly — the
engine returns whichever orientation matches better.

---

## Running it

```bash
pip install -r requirements.txt

# 1. Record a reference for a sign (rebuilds its feature file automatically)
python record_sign.py help

# 2. Record a user attempt and score it
python record_sign.py help --user
python evaluate_cli.py help

# 3. Run the AI service
uvicorn service.app:app --reload --port 8000
#   GET  /signs
#   POST /evaluate   { "sign": "help", "frames": [ {left_hand, right_hand}, ... ] }
```

### Adding a new sign

1. Add a `SignConfig` entry to `engine/config.py` (display name, `hands`,
   description, instructions, optional weight emphasis).
2. `python record_sign.py <sign>` to capture and build its reference.

That's it — the rest of the pipeline is shared.

---

## Roadmap status

| Priority | Item | Status |
|---|---|---|
| 1 | Analyze repo, fix HELP evaluation | ✅ done |
| 2 | Reusable sign-agnostic engine | ✅ done |
| 3 | Backend API (AI service) | ✅ FastAPI service (`service/app.py`) |
| 4 | MongoDB schemas (users / signs / attempts) | ⬜ next |
| 5 | Next.js frontend (homepage → tutorial → practice → results) | ⬜ next |
| 6 | Node/Express backend + AI service integration | ⬜ next |
| 7 | Auth, dashboard, analytics, skeleton overlay | ⬜ later |

### Recordings needed to extend the dataset

To onboard the remaining signs I need **one clean reference recording each**
(performed as instructed, ~3s, both hands visible for two-handed signs):

- **Emergency**, **Doctor**, **Medicine**, **Water**

For each, run `python record_sign.py <sign>` after I add its config entry, or
send the raw `recordings/<sign>.json`. A couple of *user* attempts per sign
(`--user`) are also useful for calibrating the score thresholds (`tau`) per
sign.
