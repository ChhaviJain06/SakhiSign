import json
import math

# --------------------------
# LOAD FEATURE FILES
# --------------------------

with open("pain_features.json", "r") as f:
    reference = json.load(f)

with open("user_features.json", "r") as f:
    user = json.load(f)

ref_seq = reference["features"]
user_seq = user["features"]

# --------------------------
# FEATURE DISTANCE
# --------------------------

def euclidean_distance(a, b):

    total = 0

    for x, y in zip(a, b):

        total += (x - y) ** 2

    return math.sqrt(total)


def feature_distance(v1, v2):

    # Normal comparison
    normal = euclidean_distance(
        v1,
        v2
    )

    # Swap hands

    v2_swapped = (
        v2[6:] +
        v2[:6]
    )

    swapped = euclidean_distance(
        v1,
        v2_swapped
    )

    return min(
        normal,
        swapped
    )

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

        cost = feature_distance(
            ref_seq[i - 1],
            user_seq[j - 1]
        )

        dtw[i][j] = cost + min(
            dtw[i - 1][j],
            dtw[i][j - 1],
            dtw[i - 1][j - 1]
        )

# --------------------------
# SCORE
# --------------------------

distance = dtw[n][m]

normalized_distance = distance / (n + m)

# Initial calibration
score = max(
    0,
    100 - normalized_distance
)

print("\n===================")
print("Feature DTW Result")
print("===================")

print(f"Reference Frames : {n}")
print(f"User Frames      : {m}")

print(f"DTW Distance     : {distance:.2f}")
print(f"Normalized Dist  : {normalized_distance:.2f}")

print(f"Similarity Score : {score:.2f}%")

if score >= 70:
    print("\nCorrect Sign")
else:
    print("\nTry Again")