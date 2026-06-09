import json
import os

# Load normalized sign file
with open("recordings/pain_normalized.json", "r") as f:
    data = json.load(f)

# Get all frames
frames = data["frames"]

# Find middle frame
middle_index = len(frames) // 2

reference_frame = frames[middle_index]

# Create output
reference_data = {
    "sign": data["sign"],
    "reference": reference_frame
}

# Create folder if not exists
os.makedirs("reference_signs", exist_ok=True)

# Save reference file
with open("reference_signs/pain.json", "w") as f:
    json.dump(reference_data, f, indent=4)

print("Reference sign created successfully!")
print("Saved to reference_signs/pain.json")
print("Frame used:", middle_index)
