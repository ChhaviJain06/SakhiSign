"""
Generic sign recorder (reference OR user attempt) for any sign.

Replaces the old hardcoded sign_recorder.py / record_user_sign.py. It records
*raw* MediaPipe landmarks (the engine does all normalization internally), so a
single recorder works for every sign and for both reference and user captures.

Usage:
    python record_sign.py <sign> [--user] [--seconds N] [--no-build]

Examples:
    python record_sign.py help                 # record reference, rebuild features
    python record_sign.py help --user          # record a user attempt -> user_attempt.json
    python record_sign.py doctor --seconds 4   # record a new sign's reference

Controls:  R = start (with countdown)   ESC = quit
"""

import argparse
import json
import os
import time

import cv2
import mediapipe as mp

from engine.config import get_sign
from engine.pipeline import build_reference_features


def parse_args():
    p = argparse.ArgumentParser(description="Record a sign (reference or user attempt).")
    p.add_argument("sign", help="canonical sign id, e.g. 'help' or 'pain'")
    p.add_argument("--user", action="store_true",
                   help="record a user attempt (saved to user_attempt.json) instead of a reference")
    p.add_argument("--seconds", type=float, default=3.0, help="recording duration")
    p.add_argument("--countdown", type=float, default=3.0, help="countdown before recording")
    p.add_argument("--no-build", action="store_true",
                   help="do not rebuild reference features after recording")
    return p.parse_args()


def main():
    args = parse_args()
    cfg = get_sign(args.sign)            # validates the sign exists
    require_two = cfg.hands == 2

    mp_hands = mp.solutions.hands
    mp_draw = mp.solutions.drawing_utils
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=2,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.7,
    )

    # Open the webcam. On Windows the DirectShow backend is the most reliable;
    # fall back to the default and to camera index 1 if needed.
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("\nERROR: Could not open the webcam.")
        print("  - Close any other app using the camera (your browser's Practice page,")
        print("    Zoom, Meet, Teams, the Windows Camera app), then run this again.")
        print("  - Make sure no other record_sign.py window is still open.")
        return

    recording = counting = False
    frames = []
    start_t = count_t = None

    print(f"Recording {'USER attempt' if args.user else 'REFERENCE'} for "
          f"'{cfg.display}' ({cfg.hands}-handed). Press R to start, ESC to quit.")

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frame = cv2.flip(frame, 1)
        results = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

        cur = {"left_hand": None, "right_hand": None}
        if results.multi_hand_landmarks and results.multi_handedness:
            for lm, handed in zip(results.multi_hand_landmarks, results.multi_handedness):
                mp_draw.draw_landmarks(frame, lm, mp_hands.HAND_CONNECTIONS)
                pts = [[p.x, p.y, p.z] for p in lm.landmark]
                if handed.classification[0].label == "Left":
                    cur["left_hand"] = pts
                else:
                    cur["right_hand"] = pts

        hands_ok = (cur["left_hand"] is not None and cur["right_hand"] is not None) \
            if require_two else \
            (cur["left_hand"] is not None or cur["right_hand"] is not None)

        status = "HANDS OK" if hands_ok else ("SHOW BOTH HANDS" if require_two else "SHOW YOUR HAND")
        cv2.putText(frame, status, (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8,
                    (0, 255, 0) if hands_ok else (0, 0, 255), 2)

        if counting:
            elapsed = time.time() - count_t
            cv2.putText(frame, f"Starting in {args.countdown - int(elapsed):.0f}",
                        (150, 150), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 255), 3)
            if elapsed >= args.countdown:
                counting, recording = False, True
                start_t, frames = time.time(), []
                print("Recording...")

        if recording:
            if hands_ok:
                frames.append(cur)
            elapsed = time.time() - start_t
            cv2.putText(frame, f"REC {elapsed:.1f}s", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
            if elapsed >= args.seconds:
                recording = False
                save(args, cfg, frames)
        elif not counting:
            cv2.putText(frame, "Press R to Record", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

        cv2.imshow("SakhiSign Recorder", frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord("r") and not recording and not counting:
            counting, count_t = True, time.time()
            print("Get ready...")
        elif key == 27:
            break

    cap.release()
    cv2.destroyAllWindows()


def save(args, cfg, frames):
    if not frames:
        print("No valid frames captured - try again.")
        return
    payload = {"sign": cfg.name, "frames": frames}
    if args.user:
        path = "user_attempt.json"
        with open(path, "w") as f:
            json.dump(payload, f)
        print(f"Saved {len(frames)} frames -> {path}")
        print(f"Evaluate with:  python evaluate_cli.py {cfg.name}")
    else:
        os.makedirs("recordings", exist_ok=True)
        path = os.path.join("recordings", f"{cfg.name}.json")
        with open(path, "w") as f:
            json.dump(payload, f)
        print(f"Saved {len(frames)} reference frames -> {path}")
        if not args.no_build:
            feats = build_reference_features(cfg.name)
            print(f"Rebuilt reference features ({len(feats)} frames).")


if __name__ == "__main__":
    main()
