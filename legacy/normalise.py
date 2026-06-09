import json
import math

# --------------------------
# NORMALIZE ONE HAND
# --------------------------

def normalize_hand(hand_landmarks):

    if hand_landmarks is None:
        return None

    wrist = hand_landmarks[0]

    normalized = []

    # Move wrist to origin
    for point in hand_landmarks:

        x = point[0] - wrist[0]
        y = point[1] - wrist[1]
        z = point[2] - wrist[2]

        normalized.append([x, y, z])

    # Scale using wrist -> middle MCP
    middle_mcp = normalized[9]

    scale = math.sqrt(
        middle_mcp[0]**2 +
        middle_mcp[1]**2 +
        middle_mcp[2]**2
    )

    if scale == 0:
        scale = 1

    final_points = []

    for point in normalized:

        final_points.append([
            point[0] / scale,
            point[1] / scale,
            point[2] / scale
        ])

    return final_points

# --------------------------
# LOAD RECORDING
# --------------------------

with open("recordings/help.json", "r") as f:
    data = json.load(f)

# --------------------------
# NORMALIZE ALL FRAMES
# --------------------------

normalized_frames = []

for frame in data["frames"]:

    normalized_frames.append({
        "left_hand": normalize_hand(frame["left_hand"]),
        "right_hand": normalize_hand(frame["right_hand"])
    })

output = {
    "sign": data["sign"],
    "frames": normalized_frames
}

with open("recordings/help_normalized.json", "w") as f:
    json.dump(output, f)

print("Normalization Complete")
print(f"Frames: {len(normalized_frames)}")