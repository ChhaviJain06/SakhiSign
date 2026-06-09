"""
Low-level landmark geometry.

A "hand" everywhere in the engine is a list of 21 [x, y, z] points in the
MediaPipe Hands ordering, or None when the hand was not detected in a frame.
A "frame" is a dict {"left_hand": hand|None, "right_hand": hand|None}.

We keep two views of every hand:
  * raw      - landmarks straight from MediaPipe (image-normalized coords).
               Used for inter-hand RELATIONSHIP features, because relative
               hand positions only survive in a shared coordinate space.
  * shape    - per-hand wrist-centered + palm-scaled landmarks.
               Used for SHAPE features (finger bends, openness), which must be
               invariant to where the hand is / how big it appears.
"""

import math

# MediaPipe Hands landmark indices
WRIST = 0
MIDDLE_MCP = 9

FINGER_TRIPLETS = {
    # finger: (mcp/base, pip/middle joint, tip) used for the bend angle
    "thumb":  (1, 2, 4),
    "index":  (5, 6, 8),
    "middle": (9, 10, 12),
    "ring":   (13, 14, 16),
    "pinky":  (17, 18, 20),
}
FINGER_ORDER = ["thumb", "index", "middle", "ring", "pinky"]
FINGERTIPS = [4, 8, 12, 16, 20]


def _sub(a, b):
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]


def _norm(v):
    return math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])


def calculate_angle(a, b, c):
    """Angle ABC in degrees (vertex at b). 0 if degenerate."""
    ba = _sub(a, b)
    bc = _sub(c, b)
    mag = _norm(ba) * _norm(bc)
    if mag == 0:
        return 0.0
    cosine = (ba[0] * bc[0] + ba[1] * bc[1] + ba[2] * bc[2]) / mag
    cosine = max(-1.0, min(1.0, cosine))
    return math.degrees(math.acos(cosine))


def palm_size(hand):
    """Raw wrist->middle-MCP distance: a camera-distance proxy for hand scale."""
    if hand is None:
        return 0.0
    return _norm(_sub(hand[MIDDLE_MCP], hand[WRIST]))


def normalize_hand(hand):
    """
    Wrist-centered, palm-scaled landmarks for shape comparison.

    Translation invariant (wrist -> origin) and scale invariant
    (divided by wrist->middle-MCP length). Returns None for a missing hand.
    """
    if hand is None:
        return None

    wrist = hand[WRIST]
    centered = [_sub(p, wrist) for p in hand]

    scale = _norm(centered[MIDDLE_MCP])
    if scale == 0:
        scale = 1.0

    return [[p[0] / scale, p[1] / scale, p[2] / scale] for p in centered]
