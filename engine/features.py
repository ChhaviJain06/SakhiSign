"""
Per-frame feature extraction (sign-agnostic).

Every frame becomes a fixed-length vector with a stable layout so that DTW,
scoring and feedback can all index into it the same way regardless of sign:

    idx  0..5    LEFT  hand shape  [thumb, index, middle, ring, pinky, openness]
    idx  6..11   RIGHT hand shape  [thumb, index, middle, ring, pinky, openness]
    idx 12       inter-hand distance        (palm-scaled, 0 if a hand missing)
    idx 13..15   inter-hand vector dx,dy,dz (palm-scaled, 0 if a hand missing)
    idx 16       left  hand present (1/0)
    idx 17       right hand present (1/0)

THE HELP FIX
------------
Shape features come from per-hand *normalized* landmarks (wrist-centered), so
they are invariant to position and camera distance. But that same normalization
destroys inter-hand geometry (both wrists collapse to the origin). So the
relationship block (idx 12..15) is computed from RAW landmarks instead, scaled
by palm size so it stays invariant to how far the user is from the camera while
preserving the actual distance and direction between the two hands - which is
the single most important feature of two-handed signs like HELP.
"""

from engine.landmarks import (
    calculate_angle,
    normalize_hand,
    palm_size,
    FINGER_TRIPLETS,
    FINGER_ORDER,
    FINGERTIPS,
    WRIST,
)

# Feature vector layout -------------------------------------------------------
FEATURE_DIM = 18

L_SHAPE = slice(0, 6)
R_SHAPE = slice(6, 12)
REL_DIST = 12
REL_VEC = slice(13, 16)   # dx, dy, dz
L_PRESENT = 16
R_PRESENT = 17

# Per-hand shape sub-layout (relative to the hand's 6-slot block)
SHAPE_FINGERS = slice(0, 5)   # thumb..pinky bend angles
SHAPE_OPENNESS = 5


def hand_shape_features(norm_hand):
    """6 shape features from a *normalized* hand: 5 finger bends + openness."""
    if norm_hand is None:
        return [0.0] * 6

    angles = [
        calculate_angle(norm_hand[a], norm_hand[b], norm_hand[c])
        for (a, b, c) in (FINGER_TRIPLETS[f] for f in FINGER_ORDER)
    ]

    wrist = norm_hand[WRIST]
    spread = 0.0
    for tip in FINGERTIPS:
        dx = norm_hand[tip][0] - wrist[0]
        dy = norm_hand[tip][1] - wrist[1]
        dz = norm_hand[tip][2] - wrist[2]
        spread += (dx * dx + dy * dy + dz * dz) ** 0.5
    openness = spread / len(FINGERTIPS)

    return angles + [openness]


def relationship_features(raw_left, raw_right):
    """
    Inter-hand geometry from RAW landmarks, scaled by palm size.

    Returns [distance, dx, dy, dz]. Zeros when either hand is missing (so
    one-handed signs naturally carry no relationship signal).
    """
    if raw_left is None or raw_right is None:
        return [0.0, 0.0, 0.0, 0.0]

    lw = raw_left[WRIST]
    rw = raw_right[WRIST]

    # Scale by the average palm size of the two hands -> camera-distance
    # invariant, but preserves the genuine separation between the hands.
    scale = (palm_size(raw_left) + palm_size(raw_right)) / 2.0
    if scale == 0:
        scale = 1.0

    dx = (rw[0] - lw[0]) / scale
    dy = (rw[1] - lw[1]) / scale
    dz = (rw[2] - lw[2]) / scale
    distance = (dx * dx + dy * dy + dz * dz) ** 0.5

    return [distance, dx, dy, dz]


def extract_frame_features(frame):
    """Raw frame dict -> 18-dim feature vector."""
    raw_left = frame.get("left_hand")
    raw_right = frame.get("right_hand")

    left_shape = hand_shape_features(normalize_hand(raw_left))
    right_shape = hand_shape_features(normalize_hand(raw_right))
    relation = relationship_features(raw_left, raw_right)

    return (
        left_shape
        + right_shape
        + relation
        + [1.0 if raw_left is not None else 0.0,
           1.0 if raw_right is not None else 0.0]
    )


def swap_hands(vec):
    """
    Mirror a feature vector (user performed with the opposite hand).

    Swaps the two shape blocks and mirrors the inter-hand vector on x, so a
    right-hand reference can be matched against a left-hand attempt of either a
    one- or two-handed sign.
    """
    swapped = list(vec)
    swapped[L_SHAPE], swapped[R_SHAPE] = vec[R_SHAPE], vec[L_SHAPE]
    swapped[REL_DIST] = vec[REL_DIST]
    swapped[13] = -vec[13]      # mirror dx
    swapped[14] = vec[14]
    swapped[15] = vec[15]
    swapped[L_PRESENT] = vec[R_PRESENT]
    swapped[R_PRESENT] = vec[L_PRESENT]
    return swapped
