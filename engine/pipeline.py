"""
Reference & sequence building.

`extract_feature_sequence` turns raw landmark frames into the feature sequence
used everywhere. `build_reference_features` runs that over a recorded reference
sign and persists it, so evaluation never re-derives the reference at runtime.
"""

import json
import os

from engine.features import extract_frame_features

# Repo-root-relative data locations
ENGINE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(ENGINE_DIR)
RECORDINGS_DIR = os.path.join(ROOT, "recordings")
REFERENCES_DIR = os.path.join(ROOT, "data", "references")


def extract_feature_sequence(frames):
    """Raw frames (list of {left_hand,right_hand}) -> list of feature vectors."""
    return [extract_frame_features(f) for f in frames]


def reference_path(sign_name):
    return os.path.join(REFERENCES_DIR, f"{sign_name}.json")


def load_reference_features(sign_name):
    with open(reference_path(sign_name), "r") as f:
        return json.load(f)["features"]


def build_reference_features(sign_name, raw_recording_path=None):
    """
    Build and persist reference feature sequence for `sign_name` from its raw
    recording (defaults to recordings/<sign>.json). Returns the feature list.
    """
    if raw_recording_path is None:
        raw_recording_path = os.path.join(RECORDINGS_DIR, f"{sign_name}.json")

    with open(raw_recording_path, "r") as f:
        data = json.load(f)

    features = extract_feature_sequence(data["frames"])

    os.makedirs(REFERENCES_DIR, exist_ok=True)
    out = {"sign": sign_name, "features": features}
    with open(reference_path(sign_name), "w") as f:
        json.dump(out, f)

    return features
