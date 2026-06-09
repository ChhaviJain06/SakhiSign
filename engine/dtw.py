"""
Dynamic Time Warping over feature sequences.

DTW aligns the reference and user motions in time, so a user who performs the
same sign faster, slower, or with a pause still matches well. The per-frame
cost is a weighted Euclidean distance (weights come from the SignConfig), and
we optionally also try the mirrored user sequence so a left-handed performance
of a right-handed reference still scores correctly.
"""

import math

from engine.features import swap_hands


def weighted_distance(a, b, weights):
    total = 0.0
    for x, y, w in zip(a, b, weights):
        d = (x - y) * w
        total += d * d
    return math.sqrt(total)


def _dtw(ref_seq, user_seq, weights):
    n, m = len(ref_seq), len(user_seq)
    if n == 0 or m == 0:
        return float("inf")

    prev = [float("inf")] * (m + 1)
    prev[0] = 0.0
    # Standard DTW with a single rolling row to keep memory at O(m).
    for i in range(1, n + 1):
        cur = [float("inf")] * (m + 1)
        ref_v = ref_seq[i - 1]
        for j in range(1, m + 1):
            cost = weighted_distance(ref_v, user_seq[j - 1], weights)
            cur[j] = cost + min(prev[j], cur[j - 1], prev[j - 1])
        prev = cur
    return prev[m]


def dtw_distance(ref_seq, user_seq, weights, mirror=True):
    """
    Path-length-normalized DTW distance between two feature sequences.

    When mirror=True we also evaluate the user sequence with hands swapped and
    return whichever orientation matches better, along with which one won.

    Returns (normalized_distance, mirrored: bool).
    """
    n, m = len(ref_seq), len(user_seq)
    direct = _dtw(ref_seq, user_seq, weights)
    best, mirrored = direct, False

    if mirror:
        swapped_seq = [swap_hands(v) for v in user_seq]
        flipped = _dtw(ref_seq, swapped_seq, weights)
        if flipped < best:
            best, mirrored = flipped, True

    norm = best / (n + m) if (n + m) else best
    return norm, mirrored
