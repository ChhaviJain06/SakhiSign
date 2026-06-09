"""
Sign registry + per-dimension feature weighting.

Adding a new sign = adding one entry here + recording a reference. No new code,
no per-sign extraction modules. The engine reads everything it needs from the
SignConfig.
"""

from engine.features import (
    FEATURE_DIM,
    L_SHAPE,
    R_SHAPE,
    REL_DIST,
    REL_VEC,
    SHAPE_OPENNESS,
)

# --- Base per-dimension weights ---------------------------------------------
# Different feature groups live on different numeric scales (finger angles are
# 0..180 degrees, openness ~0..2, palm-scaled distances ~0..4). These weights
# bring each group onto a comparable footing for the DTW distance metric.
ANGLE_W = 1.0 / 90.0   # ~1.0 contribution per 90 degrees of error
OPENNESS_W = 1.0
DIST_W = 1.0
VEC_W = 0.5


def _base_weights():
    w = [0.0] * FEATURE_DIM
    for block in (L_SHAPE, R_SHAPE):
        for i in range(block.start, block.stop):
            w[i] = ANGLE_W
        w[block.start + SHAPE_OPENNESS] = OPENNESS_W
    w[REL_DIST] = DIST_W
    for i in range(REL_VEC.start, REL_VEC.stop):
        w[i] = VEC_W
    return w


def _weighted(group_multipliers):
    """Apply {shape, openness, relation} multipliers to the base weights."""
    w = _base_weights()
    sm = group_multipliers.get("shape", 1.0)
    om = group_multipliers.get("openness", 1.0)
    rm = group_multipliers.get("relation", 1.0)
    for block in (L_SHAPE, R_SHAPE):
        for i in range(block.start, block.stop):
            w[i] *= sm
        w[block.start + SHAPE_OPENNESS] *= om
    w[REL_DIST] *= rm
    for i in range(REL_VEC.start, REL_VEC.stop):
        w[i] *= rm
    return w


class SignConfig:
    def __init__(self, name, display, hands, description, instructions,
                 group_multipliers=None, tau=0.9, mirror=True, media=None):
        self.name = name                      # canonical id, e.g. "help"
        self.display = display                # "Help"
        self.hands = hands                    # 1 or 2
        self.description = description
        self.instructions = instructions      # list[str]
        self.weights = _weighted(group_multipliers or {})
        self.tau = tau                        # score calibration (see scoring)
        self.mirror = mirror                  # allow opposite-hand performance
        self.media = media or {}              # gif/video/animation asset paths

    def to_public_dict(self):
        return {
            "name": self.name,
            "display": self.display,
            "hands": self.hands,
            "description": self.description,
            "instructions": self.instructions,
            "media": self.media,
        }


SIGNS = {
    "pain": SignConfig(
        name="pain",
        display="Pain",
        hands=1,
        description=(
            "A one-handed dynamic sign: open the hand, close it into a fist, "
            "then open it again over the area that hurts."
        ),
        instructions=[
            "Hold your hand open in front of you.",
            "Close your fingers into a fist.",
            "Open your hand again.",
        ],
        # Pain lives entirely in finger motion / openness; no second hand.
        group_multipliers={"shape": 1.0, "openness": 1.2, "relation": 0.0},
        tau=1.125,
        mirror=True,
        media={"gif": "/media/pain.gif", "video": "/media/pain.mp4"},
    ),
    "help": SignConfig(
        name="help",
        display="Help",
        hands=2,
        description=(
            "A two-handed dynamic sign: a flat open palm underneath, a fist "
            "with the thumb extended resting on top, both hands moving outward "
            "together while keeping their relative structure."
        ),
        instructions=[
            "Hold your lower hand flat, palm up.",
            "Make a fist with your other hand, thumb pointing up, and rest it on the open palm.",
            "Move both hands outward together, keeping the fist on the palm.",
        ],
        # Help's identity is the inter-hand relationship + correct hand shapes.
        group_multipliers={"shape": 1.0, "openness": 0.8, "relation": 1.5},
        tau=1.375,
        mirror=True,
        media={"gif": "/media/help.gif", "video": "/media/help.mp4"},
    ),

    # ------------------------------------------------------------------ #
    # SIGNS BELOW HAVE NO REFERENCE RECORDING YET.                        #
    # Record one with:  python record_sign.py <name>                     #
    #                                                                    #
    # `hands` (1 or 2) is my best guess - change it to match the actual  #
    # sign you teach. `description` / `instructions` show on the tutorial #
    # page, so edit them to describe the exact sign. The recording itself #
    # is the ground truth the engine scores against; `tau` is the score  #
    # forgiveness and can be calibrated later with a few user attempts.   #
    # ------------------------------------------------------------------ #
    "doctor": SignConfig(
        name="doctor",
        display="Doctor",
        hands=2,  # you recorded this two-handed
        description="A two-handed sign for 'doctor' (e.g. checking the pulse on the other wrist).",
        instructions=[
            "Hold both hands as shown in the tutorial video.",
            "Perform the motion clearly and at a steady pace.",
            "Keep both hands within the camera frame.",
        ],
        group_multipliers={"shape": 1.0, "openness": 1.0, "relation": 1.3},
        tau=1.25,
        mirror=True,
        media={"gif": "/media/doctor.gif", "video": "/media/doctor.mp4"},
    ),
    "medicine": SignConfig(
        name="medicine",
        display="Medicine",
        hands=2,
        description="A two-handed sign for 'medicine' (e.g. one fingertip circling in the open palm).",
        instructions=[
            "Hold one palm open and use the other hand as shown in the tutorial video.",
            "Perform the motion clearly and at a steady pace.",
            "Keep both hands within the camera frame.",
        ],
        group_multipliers={"shape": 1.0, "openness": 0.9, "relation": 1.4},
        tau=1.4,
        mirror=True,
        media={"gif": "/media/medicine.gif", "video": "/media/medicine.mp4"},
    ),
    "water": SignConfig(
        name="water",
        display="Water",
        hands=1,
        description="A one-handed sign for 'water' (e.g. a 'W' handshape tapped at the chin).",
        instructions=[
            "Form the handshape shown in the tutorial video.",
            "Perform the motion clearly and at a steady pace.",
            "Keep your hand within the camera frame.",
        ],
        group_multipliers={"shape": 1.1, "openness": 1.0, "relation": 0.0},
        tau=1.125,
        mirror=True,
        media={"gif": "/media/water.gif", "video": "/media/water.mp4"},
    ),
}


def list_signs():
    return [s.to_public_dict() for s in SIGNS.values()]


def get_sign(name):
    cfg = SIGNS.get(name)
    if cfg is None:
        raise KeyError(f"Unknown sign '{name}'. Known signs: {list(SIGNS)}")
    return cfg
