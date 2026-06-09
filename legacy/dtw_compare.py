import json
import math

# --------------------------
# LOAD FILES
# --------------------------

with open("recordings/pain_normalized.json", "r") as f:
    reference = json.load(f)

with open("user_recording.json", "r") as f:
    user = json.load(f)

# --------------------------
# CONVERT FRAME TO VECTOR
# --------------------------

def frame_to_vector(frame):

    vector = []

    # LEFT HAND
    if frame["left_hand"] is not None:

        for point in frame["left_hand"]:
            vector.extend(point)

    else:
        vector.extend([0] * 63)

    # RIGHT HAND
    if frame["right_hand"] is not None:

        for point in frame["right_hand"]:
            vector.extend(point)

    else:
        vector.extend([0] * 63)

    return vector

# --------------------------
# SEQUENCE
# --------------------------

ref_seq = [
    frame_to_vector(frame)
    for frame in reference["frames"]
]

user_seq = [
    frame_to_vector(frame)
    for frame in user["frames"]
]

# --------------------------
# DISTANCE BETWEEN FRAMES
# --------------------------

def frame_distance(v1, v2):

    total = 0

    for a, b in zip(v1, v2):

        total += (a - b) ** 2

    return math.sqrt(total)

# --------------------------
# DTW
# --------------------------

n = len(ref_seq)
m = len(user_seq)

dtw = [
    [float("inf")] * (m + 1)
    for _ in range(n + 1)
]

dtw[0][0] = 0

for i in range(1, n + 1):

    for j in range(1, m + 1):

        cost = frame_distance(
            ref_seq[i - 1],
            user_seq[j - 1]
        )

        dtw[i][j] = cost + min(
            dtw[i - 1][j],
            dtw[i][j - 1],
            dtw[i - 1][j - 1]
        )

# --------------------------
# FINAL SCORE
# --------------------------

distance = dtw[n][m]

normalized_distance = distance / (n + m)

score = max(
    0,
    100 - normalized_distance * 60
)

print("\n===================")
print("Dynamic Sign Result")
print("===================")

print(f"Reference Frames : {n}")
print(f"User Frames      : {m}")

print(f"DTW Distance     : {distance:.2f}")

print(f"Normalized Distance : {normalized_distance:.4f}")

print(f"Similarity Score : {score:.2f}%")

if score >= 80:

    print("\nCorrect Sign")

else:

    print("\nTry Again")