"""
Sign-agnostic feedback generation.

Feedback is derived from the same feature vectors used for scoring. We compare
the reference and user at their most *expressive* moments (the frame where the
active hand is most closed, which is the climax of dynamic signs like Pain and
Help) and from sequence-level statistics (range of the closing motion, range of
the outward inter-hand motion). The SignConfig tells us whether to talk about
one hand or two.
"""

from engine.features import (
    L_SHAPE, R_SHAPE, REL_DIST, L_PRESENT, R_PRESENT,
    SHAPE_OPENNESS,
)
from engine.landmarks import FINGER_ORDER

ANGLE_TOL = 18.0       # degrees: per-finger "close enough"
OPENNESS_TOL = 0.18
DIST_TOL = 0.35        # palm-scaled units for inter-hand distance


def _block(vec, hand):
    return vec[L_SHAPE] if hand == "left" else vec[R_SHAPE]


def _active_hands(seq, cfg):
    """Which hand blocks actually carry signal, given the sign's hand count."""
    if cfg.hands == 2:
        return ["left", "right"]
    # one-handed: pick whichever hand is present in the reference
    present_right = sum(v[R_PRESENT] for v in seq)
    present_left = sum(v[L_PRESENT] for v in seq)
    return ["right"] if present_right >= present_left else ["left"]


def _most_closed_frame(seq, hand):
    """Frame where the given hand is most closed (min openness)."""
    idx_open = (L_SHAPE.start if hand == "left" else R_SHAPE.start) + SHAPE_OPENNESS
    best, best_val = seq[0], float("inf")
    for v in seq:
        if v[idx_open] < best_val:
            best_val, best = v[idx_open], v
    return best


def _openness_range(seq, hand):
    idx_open = (L_SHAPE.start if hand == "left" else R_SHAPE.start) + SHAPE_OPENNESS
    vals = [v[idx_open] for v in seq]
    return max(vals) - min(vals)


def _dist_range(seq):
    vals = [v[REL_DIST] for v in seq]
    return max(vals) - min(vals)


def _avg_dist(seq):
    vals = [v[REL_DIST] for v in seq if v[REL_DIST] > 0]
    return sum(vals) / len(vals) if vals else 0.0


def generate_feedback(ref_seq, user_seq, cfg, mirrored=False):
    """Return {'positives': [...], 'improvements': [...], 'summary': str}."""
    # If the user mirrored the sign, align the comparison by swapping their
    # hands so left/right talk about the same fingers.
    from engine.features import swap_hands
    user = [swap_hands(v) for v in user_seq] if mirrored else user_seq

    positives, improvements = [], []
    hands = _active_hands(ref_seq, cfg)
    correct_fingers = 0
    total_fingers = 0

    for hand in hands:
        ref_frame = _most_closed_frame(ref_seq, hand)
        user_frame = _most_closed_frame(user, hand)
        ref_shape = _block(ref_frame, hand)
        user_shape = _block(user_frame, hand)
        prefix = "" if len(hands) == 1 else f"{hand} hand "
        hand_label = "hand" if len(hands) == 1 else f"{hand} hand"

        for i, finger in enumerate(FINGER_ORDER):
            total_fingers += 1
            diff = abs(ref_shape[i] - user_shape[i])
            if diff < ANGLE_TOL:
                correct_fingers += 1
                positives.append(f"{prefix}{finger} bend looks correct".capitalize())
            elif user_shape[i] > ref_shape[i]:
                improvements.append(
                    f"Bend your {prefix}{finger} more during the closing phase".strip())
            else:
                improvements.append(
                    f"Keep your {prefix}{finger} a little straighter".strip())

        # Closing-motion amplitude for this hand
        ref_swing = _openness_range(ref_seq, hand)
        user_swing = _openness_range(user, hand)
        if abs(ref_swing - user_swing) < OPENNESS_TOL:
            positives.append(f"{prefix}opening/closing motion is the right size".capitalize())
        elif user_swing < ref_swing:
            improvements.append(f"Make the {hand_label}'s open-close motion bigger")
        else:
            improvements.append(f"Make the {hand_label}'s motion a little smaller")

    # Two-handed relationship checks (the heart of signs like Help) ----------
    if cfg.hands == 2:
        ref_avg = _avg_dist(ref_seq)
        user_avg = _avg_dist(user)
        if ref_avg > 0 and user_avg > 0:
            if abs(ref_avg - user_avg) < DIST_TOL:
                positives.append("Your hands are correctly positioned relative to each other")
            elif user_avg > ref_avg:
                improvements.append("Keep your two hands closer together")
            else:
                improvements.append("Your hands are too close - give them a bit more separation")

        ref_travel = _dist_range(ref_seq)
        user_travel = _dist_range(user)
        if abs(ref_travel - user_travel) < DIST_TOL:
            positives.append("The outward movement of both hands matches well")
        elif user_travel < ref_travel:
            improvements.append("Move both hands further outward together")
        else:
            improvements.append("Tone down how far the hands travel outward")

    ratio = correct_fingers / total_fingers if total_fingers else 0
    if ratio >= 0.8:
        summary = f"Your {cfg.display} sign is very close to the reference."
    elif ratio >= 0.5:
        summary = f"Your {cfg.display} sign is partially correct but needs refinement."
    else:
        summary = f"Review the {cfg.display} sign and try again."

    if mirrored:
        positives.append("Detected you performed with the opposite hand - that's fine.")

    return {
        "positives": positives,
        "improvements": improvements,
        "summary": summary,
    }
