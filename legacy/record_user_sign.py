import cv2
import mediapipe as mp
import json
import time
import math

# --------------------------
# SETTINGS
# --------------------------

RECORD_SECONDS = 3

# --------------------------
# NORMALIZATION FUNCTION
# --------------------------

def normalize_hand(hand_landmarks):

    if hand_landmarks is None:
        return None

    wrist = hand_landmarks[0]

    normalized = []

    for point in hand_landmarks:

        x = point[0] - wrist[0]
        y = point[1] - wrist[1]
        z = point[2] - wrist[2]

        normalized.append([x, y, z])

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
# MEDIAPIPE
# --------------------------

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

# --------------------------
# CAMERA
# --------------------------

cap = cv2.VideoCapture(0)

recording = False
recorded_frames = []
start_time = None

print("Press R to start recording")

while True:

    success, frame = cap.read()

    if not success:
        break

    frame = cv2.flip(frame, 1)

    rgb = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )

    results = hands.process(rgb)

    current_frame = {
        "left_hand": None,
        "right_hand": None
    }

    if (
        results.multi_hand_landmarks
        and results.multi_handedness
    ):

        for hand_landmarks, handedness in zip(
            results.multi_hand_landmarks,
            results.multi_handedness
        ):

            label = handedness.classification[0].label

            mp_draw.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS
            )

            hand_points = []

            for landmark in hand_landmarks.landmark:

                hand_points.append([
                    landmark.x,
                    landmark.y,
                    landmark.z
                ])

            hand_points = normalize_hand(
                hand_points
            )

            if label == "Left":
                current_frame["left_hand"] = hand_points
            else:
                current_frame["right_hand"] = hand_points

    # --------------------------
    # RECORDING
    # --------------------------

    if recording:

        recorded_frames.append(current_frame)

        elapsed = time.time() - start_time

        cv2.putText(
            frame,
            f"Recording {elapsed:.1f}s",
            (20, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            2
        )

        if elapsed >= RECORD_SECONDS:

            recording = False

            output = {
                "frames": recorded_frames
            }

            with open(
                "user_recording.json",
                "w"
            ) as f:

                json.dump(
                    output,
                    f,
                    indent=4
                )

            print(
                f"Saved {len(recorded_frames)} frames"
            )

    # --------------------------
    # UI
    # --------------------------

    if not recording:

        cv2.putText(
            frame,
            "Press R To Record",
            (20, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 255),
            2
        )

    cv2.imshow(
        "User Sign Recorder",
        frame
    )

    key = cv2.waitKey(1) & 0xFF

    if key == ord('r'):

        recording = True
        recorded_frames = []
        start_time = time.time()

        print("Recording Started...")

    if key == 27:
        break

cap.release()
cv2.destroyAllWindows()