"""
Component sub-scores: handshape / position / movement / timing.

The product UI presents evaluation as a "boarding pass" with four component
bars. Rather than invent numbers, we derive each one from the same feature
representation used for the overall score, so every bar reflects something real:

  handshape - agreement of the finger-bend angles (is the hand SHAPE right?)
  position  - placement: inter-hand geometry for two-handed signs, or hand
              openness level for one-handed signs (is the hand WHERE it should be?)
  movement  - agreement of the frame-to-frame motion (is the MOTION right?)
  timing    - how much DTW had to warp time to align the two performances
              (is the RHYTHM/pace right?)

Each of the first three is a sub-DTW over a slice of the feature vector mapped
through the same exponential scoring. Timing comes from the warp path of the
full-feature alignment.
"""

import math

from engine.features import (
    swap_hands,
    L_SHAPE, R_SHAPE, REL_DIST, REL_VEC, SHAPE_OPENNESS,
)
from engine.dtw import weighted_distance
from engine.scoring import distance_to_score

# Feature-index groups -------------------------------------------------------
_ANGLE_IDX = (list(range(L_SHAPE.start, L_SHAPE.start + 5))
              + list(range(R_SHAPE.start, R_SHAPE.start + 5)))
_OPEN_IDX = [L_SHAPE.start + SHAPE_OPENNESS, R_SHAPE.start + SHAPE_OPENNESS]
_REL_IDX = [REL_DIST] + list(range(REL_VEC.start, REL_VEC.stop))


def _slice(seq, idxs):
    return [[v[i] for i in idxs] for v in seq]


def _velocity(seq, idxs):
    """Frame-to-frame change of the selected dims (captures motion dynamics)."""
    out = []
    for k in range(1, len(seq)):
        out.append([seq[k][i] - seq[k - 1][i] for i in idxs])
    return out or [[0.0] * len(idxs)]


def _sub_dtw(ref, user, weights):
    n, m = len(ref), len(user)
    if n == 0 or m == 0:
        return float("inf")
    prev = [float("inf")] * (m + 1)
    prev[0] = 0.0
    for i in range(1, n + 1):
        cur = [float("inf")] * (m + 1)
        for j in range(1, m + 1):
            cost = weighted_distance(ref[i - 1], user[j - 1], weights)
            cur[j] = cost + min(prev[j], cur[j - 1], prev[j - 1])
        prev = cur
    return prev[m] / (n + m)


def _sub_score(ref_seq, user_seq, idxs, base_weights, tau):
    w = [base_weights[i] for i in idxs]
    d = _sub_dtw(_slice(ref_seq, idxs), _slice(user_seq, idxs), w)
    return distance_to_score(d, tau)


def _timing_score(ref_seq, user_seq, weights):
    """
    Full-feature DTW with backtrace; timing quality = how close the optimal
    alignment path stays to the diagonal. Lots of warping -> low timing score.
    """
    n, m = len(ref_seq), len(user_seq)
    if n == 0 or m == 0:
        return 0.0
    INF = float("inf")
    D = [[INF] * (m + 1) for _ in range(n + 1)]
    D[0][0] = 0.0
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = weighted_distance(ref_seq[i - 1], user_seq[j - 1], weights)
            D[i][j] = cost + min(D[i - 1][j], D[i][j - 1], D[i - 1][j - 1])

    # Backtrace and accumulate normalized off-diagonal deviation.
    i, j, dev, steps = n, m, 0.0, 0
    while i > 0 and j > 0:
        dev += abs((i / n) - (j / m))
        steps += 1
        diag, up, left = D[i - 1][j - 1], D[i - 1][j], D[i][j - 1]
        m_ = min(diag, up, left)
        if m_ == diag:
            i, j = i - 1, j - 1
        elif m_ == up:
            i -= 1
        else:
            j -= 1
    warp = dev / steps if steps else 0.0
    return round(100.0 * math.exp(-warp / 0.18), 1)


def compute_component_scores(ref_seq, user_seq, cfg, mirrored=False):
    """Return {handshape, position, movement, timing} in 0..100."""
    user = [swap_hands(v) for v in user_seq] if mirrored else user_seq
    w = cfg.weights
    tau = cfg.tau

    handshape = _sub_score(ref_seq, user, _ANGLE_IDX, w, tau)

    # Position: inter-hand placement for two-handed signs, openness otherwise.
    pos_idx = _REL_IDX if cfg.hands == 2 else _OPEN_IDX
    position = _sub_score(ref_seq, user, pos_idx, w, tau)

    # Movement: dynamics of openness (+ inter-hand distance for two hands).
    move_idx = _OPEN_IDX + ([REL_DIST] if cfg.hands == 2 else [])
    move_w = [1.0] * len(move_idx)
    mv = _sub_dtw(_velocity(ref_seq, move_idx), _velocity(user, move_idx), move_w)
    movement = distance_to_score(mv, tau)

    timing = _timing_score(ref_seq, user, w)

    return {
        "handshape": handshape,
        "position": position,
        "movement": movement,
        "timing": timing,
    }
