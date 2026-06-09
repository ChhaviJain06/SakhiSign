import cv2
import mediapipe as mp
import json
import time
import os

# ----------------------------------
# SETTINGS
# ----------------------------------

SIGN_NAME = "help"
RECORD_SECONDS = 3
COUNTDOWN_SECONDS = 3

# ----------------------------------
# CREATE RECORDINGS FOLDER
# ----------------------------------

os.makedirs("recordings", exist_ok=True)

# ----------------------------------
# MEDIAPIPE
# ----------------------------------

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

# ----------------------------------
# CAMERA
# ----------------------------------

cap = cv2.VideoCapture(0)

recording = False
countdown = False

recorded_frames = []

start_time = None
countdown_start = None

print("================================")
print("Press R to start recording")
print("Both hands must be visible")
print("Press ESC to quit")
print("================================")

while True:

    success, frame = cap.read()

    if not success:
        break

    frame = cv2.flip(frame, 1)

    rgb_frame = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )

    results = hands.process(rgb_frame)

    current_frame_data = {
        "left_hand": None,
        "right_hand": None
    }

    both_hands_detected = False

    # ----------------------------------
    # DETECT HANDS
    # ----------------------------------

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

            for idx, landmark in enumerate(
                hand_landmarks.landmark
            ):

                h, w, c = frame.shape

                cx = int(landmark.x * w)
                cy = int(landmark.y * h)

                cv2.putText(
                    frame,
                    str(idx),
                    (cx, cy),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.4,
                    (0, 255, 0),
                    1
                )

                hand_points.append([
                    landmark.x,
                    landmark.y,
                    landmark.z
                ])

            wrist = hand_landmarks.landmark[0]

            wx = int(wrist.x * w)
            wy = int(wrist.y * h)

            cv2.putText(
                frame,
                label,
                (wx, wy - 20),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 0, 0),
                2
            )

            if label == "Left":
                current_frame_data["left_hand"] = hand_points

            elif label == "Right":
                current_frame_data["right_hand"] = hand_points

    # ----------------------------------
    # BOTH HANDS CHECK
    # ----------------------------------

    if (
        current_frame_data["left_hand"] is not None
        and
        current_frame_data["right_hand"] is not None
    ):

        both_hands_detected = True

        cv2.putText(
            frame,
            "BOTH HANDS DETECTED",
            (20, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2
        )

    else:

        cv2.putText(
            frame,
            "SHOW BOTH HANDS",
            (20, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2
        )

    # ----------------------------------
    # COUNTDOWN
    # ----------------------------------

    if countdown:

        elapsed = (
            time.time() -
            countdown_start
        )

        remaining = (
            COUNTDOWN_SECONDS -
            int(elapsed)
        )

        cv2.putText(
            frame,
            f"Starting in {remaining}",
            (150, 150),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.5,
            (0, 255, 255),
            3
        )

        if elapsed >= COUNTDOWN_SECONDS:

            countdown = False

            recording = True

            start_time = time.time()

            recorded_frames = []

            print("\nRecording Started...")

    # ----------------------------------
    # RECORDING
    # ----------------------------------

    if recording:

        if both_hands_detected:

            recorded_frames.append(
                current_frame_data
            )

        elapsed = (
            time.time() -
            start_time
        )

        cv2.putText(
            frame,
            f"RECORDING {elapsed:.1f}s",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            3
        )

        if elapsed >= RECORD_SECONDS:

            recording = False

            output = {
                "sign": SIGN_NAME,
                "frames": recorded_frames
            }

            filepath = (
                f"recordings/{SIGN_NAME}.json"
            )

            with open(
                filepath,
                "w"
            ) as f:

                json.dump(
                    output,
                    f
                )

            print("\n====================")
            print("Recording Complete")
            print(
                f"Frames Saved: {len(recorded_frames)}"
            )
            print(
                f"Saved To: {filepath}"
            )
            print("====================\n")

    # ----------------------------------
    # IDLE UI
    # ----------------------------------

    if not recording and not countdown:

        cv2.putText(
            frame,
            "Press R to Record",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 255),
            2
        )

    cv2.imshow(
        "SakhiSign Recorder",
        frame
    )

    key = cv2.waitKey(1) & 0xFF

    if (
        key == ord('r')
        and not recording
        and not countdown
    ):

        countdown = True

        countdown_start = time.time()

        print("\nGet Ready...")

    if key == 27:
        break

cap.release()
cv2.destroyAllWindows()