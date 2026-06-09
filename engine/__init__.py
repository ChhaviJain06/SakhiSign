"""
SakhiSign evaluation engine.

A sign-agnostic pipeline that evaluates how closely a user's performance
matches a *pre-selected* reference sign. This is NOT a classifier - the sign
is always known in advance; we only score similarity to its reference motion.

Pipeline (identical for every sign):

    raw landmark frames
        -> per-hand normalization (shape, scale/translation invariant)
        -> palm-scaled relationship features (inter-hand geometry, preserved)
        -> per-frame feature vector
        -> Dynamic Time Warping vs reference (with mirror/hand-swap)
        -> similarity score
        -> targeted feedback

Public API:
    from engine import evaluate, build_reference_features, list_signs, get_sign
"""

from engine.evaluate import evaluate
from engine.pipeline import build_reference_features, extract_feature_sequence
from engine.config import list_signs, get_sign, SIGNS

__all__ = [
    "evaluate",
    "build_reference_features",
    "extract_feature_sequence",
    "list_signs",
    "get_sign",
    "SIGNS",
]
