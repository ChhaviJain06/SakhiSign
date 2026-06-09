import json

# --------------------------
# LOAD FILES
# --------------------------

with open("pain_features.json", "r") as f:
    reference = json.load(f)

with open("user_features.json", "r") as f:
    user = json.load(f)

# --------------------------
# FIND MOST CLOSED FRAME
# --------------------------

def get_most_closed_frame(features):

    min_openness = float("inf")
    best_frame = None

    for frame in features:

        # Right hand openness
        openness = frame[11]

        if openness < min_openness:

            min_openness = openness
            best_frame = frame

    return best_frame


ref_frame = get_most_closed_frame(
    reference["features"]
)

user_frame = get_most_closed_frame(
    user["features"]
)

# --------------------------
# FEEDBACK
# --------------------------

finger_names = [
    "Thumb",
    "Index",
    "Middle",
    "Ring",
    "Pinky"
]

print("\n===================")
print("Pain Sign Feedback")
print("===================\n")

for i in range(5):

    ref_angle = ref_frame[i + 6]
    user_angle = user_frame[i + 6]

    difference = abs(
        ref_angle - user_angle
    )

    if difference < 15:

        print(
         f"✓ {finger_names[i]} finger bend correct"
        )

else:

    if user_angle > ref_angle:

        print(
            f"✗ Bend your {finger_names[i].lower()} finger more during the closing phase"
        )

    else:

        print(
            f"✗ Keep your {finger_names[i].lower()} finger slightly straighter"
        )

# --------------------------
# OPENNESS CHECK
# --------------------------

ref_open = ref_frame[11]
user_open = user_frame[11]

if abs(ref_open - user_open) < 0.15:

    print(
        "\n✓ Hand closing motion correct"
    )

elif user_open > ref_open:

    print(
        "\n✗ Try closing your hand more tightly"
    )

else:

    print(
        "\n✗ Hand was over-closed during the gesture"
    )

correct_count = 0

for i in range(5):

    ref_angle = ref_frame[i + 6]
    user_angle = user_frame[i + 6]

    difference = abs(
        ref_angle - user_angle
    )

    if difference < 15:
        correct_count += 1

print("\n-------------------")

if correct_count >= 4:

    print(
        "Overall: Your Pain sign is very close to the reference sign."
    )

elif correct_count >= 2:

    print(
        "Overall: The sign is partially correct but needs refinement."
    )

else:

    print(
        "Overall: Please review the sign and try again."
    )