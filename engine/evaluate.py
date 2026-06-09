"""
Top-level evaluation orchestrator - the single entry point for every sign.

    evaluate(sign_name, user_frames) -> {
        sign, score, verdict, normalized_distance, mirrored,
        feedback: {positives, improvements, summary},
        frames: {reference, user}
    }

This is what the AI service (and CLI) call. It is completely sign-agnostic: the
only thing that varies between signs is the SignConfig and the stored reference.
"""

from engine.config import get_sign
from engine.pipeline import extract_feature_sequence, load_reference_features
from engine.dtw import dtw_distance
from engine.scoring import distance_to_score, verdict
from engine.feedback import generate_feedback
from engine.components import compute_component_scores


def evaluate(sign_name, user_frames):
    """
    Args:
        sign_name:   canonical sign id (e.g. "help"); the sign is ALREADY chosen.
        user_frames: list of raw frame dicts {"left_hand","right_hand"}.

    Raises KeyError for an unknown sign, ValueError for empty/invalid input.
    """
    cfg = get_sign(sign_name)

    if not user_frames:
        raise ValueError("No user frames provided.")

    user_seq = extract_feature_sequence(user_frames)
    ref_seq = load_reference_features(sign_name)

    norm_dist, mirrored = dtw_distance(
        ref_seq, user_seq, cfg.weights, mirror=cfg.mirror
    )
    score = distance_to_score(norm_dist, cfg.tau)
    fb = generate_feedback(ref_seq, user_seq, cfg, mirrored=mirrored)
    components = compute_component_scores(ref_seq, user_seq, cfg, mirrored=mirrored)

    # feedbackMessages: a flat, UI-friendly list (improvements first, then a
    # couple of positives) for the results panel.
    messages = list(fb["improvements"][:4]) + list(fb["positives"][:2])

    return {
        "sign": sign_name,
        "display": cfg.display,
        "score": score,                       # 0..100 overall
        "overallAccuracy": score,             # product-contract alias
        "verdict": verdict(score),
        "componentScores": components,        # handshape/position/movement/timing
        "normalized_distance": round(norm_dist, 4),
        "mirrored": mirrored,
        "feedback": fb,                       # {positives, improvements, summary}
        "feedbackMessages": messages,         # product-contract flat list
        "frames": {"reference": len(ref_seq), "user": len(user_seq)},
    }
