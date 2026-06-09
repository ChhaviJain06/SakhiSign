import json
import math

with open("recordings/help_normalized.json", "r") as f:
    data = json.load(f)

frame = data["frames"][0]

left = frame["left_hand"]
right = frame["right_hand"]

left_wrist = left[0]
right_wrist = right[0]

distance = math.sqrt(
    (left_wrist[0] - right_wrist[0])**2 +
    (left_wrist[1] - right_wrist[1])**2 +
    (left_wrist[2] - right_wrist[2])**2
)

x_offset = right_wrist[0] - left_wrist[0]
y_offset = right_wrist[1] - left_wrist[1]

print("Distance:", distance)
print("X Offset:", x_offset)
print("Y Offset:", y_offset)