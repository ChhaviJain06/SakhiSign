import json
import math

# --------------------------
# ANGLE CALCULATION
# --------------------------

def calculate_angle(a, b, c):

    ba = [
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2]
    ]

    bc = [
        c[0] - b[0],
        c[1] - b[1],
        c[2] - b[2]
    ]

    dot = (
        ba[0]*bc[0] +
        ba[1]*bc[1] +
        ba[2]*bc[2]
    )

    mag_ba = math.sqrt(
        ba[0]**2 +
        ba[1]**2 +
        ba[2]**2
    )

    mag_bc = math.sqrt(
        bc[0]**2 +
        bc[1]**2 +
        bc[2]**2
    )

    if mag_ba == 0 or mag_bc == 0:
        return 0

    cosine = dot / (mag_ba * mag_bc)

    cosine = max(-1, min(1, cosine))

    return math.degrees(
        math.acos(cosine)
    )

# --------------------------
# HAND FEATURES
# --------------------------

def extract_hand_features(hand):

    if hand is None:
        return [0,0,0,0,0,0]

    thumb = calculate_angle(
        hand[1], hand[2], hand[4]
    )

    index = calculate_angle(
        hand[5], hand[6], hand[8]
    )

    middle = calculate_angle(
        hand[9], hand[10], hand[12]
    )

    ring = calculate_angle(
        hand[13], hand[14], hand[16]
    )

    pinky = calculate_angle(
        hand[17], hand[18], hand[20]
    )

    wrist = hand[0]

    tips = [4,8,12,16,20]

    total = 0

    for tip in tips:

        dx = hand[tip][0] - wrist[0]
        dy = hand[tip][1] - wrist[1]
        dz = hand[tip][2] - wrist[2]

        total += math.sqrt(
            dx*dx +
            dy*dy +
            dz*dz
        )

    openness = total / 5

    return [
        thumb,
        index,
        middle,
        ring,
        pinky,
        openness
    ]

# --------------------------
# HAND RELATION FEATURES
# --------------------------

def relation_features(left, right):

    if left is None or right is None:
        return [0,0,0,0]

    left_wrist = left[0]
    right_wrist = right[0]

    dx = (
        right_wrist[0] -
        left_wrist[0]
    )

    dy = (
        right_wrist[1] -
        left_wrist[1]
    )

    dz = (
        right_wrist[2] -
        left_wrist[2]
    )

    distance = math.sqrt(
        dx*dx +
        dy*dy +
        dz*dz
    )

    return [
        distance,
        dx,
        dy,
        dz
    ]

# --------------------------
# LOAD HELP SIGN
# --------------------------

with open(
    "recordings/help_normalized.json",
    "r"
) as f:

    data = json.load(f)

# --------------------------
# EXTRACT FEATURES
# --------------------------

feature_frames = []

for frame in data["frames"]:

    left = extract_hand_features(
        frame["left_hand"]
    )

    right = extract_hand_features(
        frame["right_hand"]
    )

    relation = relation_features(
        frame["left_hand"],
        frame["right_hand"]
    )

    feature_frames.append(
        left +
        right +
        relation
    )

# --------------------------
# SAVE
# --------------------------

output = {
    "sign": "help",
    "features": feature_frames
}

with open(
    "help_features.json",
    "w"
) as f:

    json.dump(
        output,
        f,
        indent=4
    )

print(
    f"Created {len(feature_frames)} feature frames"
)

print(
    f"Feature Length = {len(feature_frames[0])}"
)