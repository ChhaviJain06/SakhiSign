"""
Evaluate a recorded user attempt against a selected sign's reference.

Usage:
    python evaluate_cli.py <sign> [attempt.json]

Defaults to user_attempt.json (produced by `record_sign.py --user`).
"""

import json
import sys

from engine.evaluate import evaluate


def main():
    if len(sys.argv) < 2:
        print("Usage: python evaluate_cli.py <sign> [attempt.json]")
        sys.exit(1)

    sign = sys.argv[1]
    path = sys.argv[2] if len(sys.argv) > 2 else "user_attempt.json"

    frames = json.load(open(path))["frames"]
    result = evaluate(sign, frames)

    print("\n=====================================")
    print(f"  {result['display']} sign evaluation")
    print("=====================================")
    print(f"Score        : {result['score']}%  ({result['verdict']})")
    print(f"Performed as : {'opposite hand (mirrored)' if result['mirrored'] else 'same orientation'}")
    print(f"Frames       : ref={result['frames']['reference']}  user={result['frames']['user']}")

    fb = result["feedback"]
    print(f"\n{fb['summary']}\n")
    if fb["positives"]:
        print("What you did well:")
        for p in fb["positives"]:
            print(f"  + {p}")
    if fb["improvements"]:
        print("\nTo improve:")
        for imp in fb["improvements"]:
            print(f"  - {imp}")
    print()


if __name__ == "__main__":
    main()
