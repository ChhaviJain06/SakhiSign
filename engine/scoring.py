"""Map a normalized DTW distance to a 0-100 similarity score."""

import math


def distance_to_score(normalized_distance, tau):
    """
    Smooth exponential falloff: a perfect match (distance 0) scores 100, and
    the score decays as the motions diverge. `tau` (from the SignConfig) sets
    how forgiving the sign is - larger tau = gentler penalty.
    """
    score = 100.0 * math.exp(-normalized_distance / tau)
    return round(max(0.0, min(100.0, score)), 1)


def verdict(score):
    if score >= 80:
        return "excellent"
    if score >= 65:
        return "good"
    if score >= 45:
        return "needs_work"
    return "try_again"
