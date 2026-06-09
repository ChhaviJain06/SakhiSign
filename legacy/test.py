import json

with open("recordings/help.json") as f:
    data = json.load(f)

total = len(data["frames"])

valid = 0

for frame in data["frames"]:

    if (
        frame["left_hand"] is not None and
        frame["right_hand"] is not None
    ):
        valid += 1

print("Total Frames:", total)
print("Valid Frames:", valid)
print("Percentage:", valid/total*100)