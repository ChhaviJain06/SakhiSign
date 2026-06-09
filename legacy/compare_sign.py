import cv2
import mediapipe as mp
import json
import math

# --------------------------
# LOAD REFERENCE SIGN
# --------------------------

with open("reference_signs/pain.json", "r") as f:
    reference_data = json.load(f)

reference_hand = reference_data["reference"]["right_hand"]

# --------------------------
# NORMALIZATION FUNCTION
# --------------------------

def normalize_hand(hand_landmarks):

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
# SIMILARITY FUNCTION
# --------------------------

def calculate_similarity(reference, current):

    total_distance = 0

    for i in range(21):

        dx = reference[i][0] - current[i][0]
        dy = reference[i][1] - current[i][1]
        dz = reference[i][2] - current[i][2]

        distance = math.sqrt(
            dx**2 +
            dy**2 +
            dz**2
        )

        total_distance += distance

    average_distance = total_distance / 21

    score = max(
        0,
        100 - (average_distance * 50)
    )

    return int(score)

# --------------------------
# MEDIAPIPE SETUP
# --------------------------

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

# --------------------------
# CAMERA
# --------------------------

cap = cv2.VideoCapture(0)

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

    score = 0

    if results.multi_hand_landmarks:

        for hand_landmarks in results.multi_hand_landmarks:

            mp_draw.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS
            )

            current_hand = []

            for landmark in hand_landmarks.landmark:

                current_hand.append([
                    landmark.x,
                    landmark.y,
                    landmark.z
                ])

            current_hand = normalize_hand(
                current_hand
            )

            score = calculate_similarity(
                reference_hand,
                current_hand
            )

    # --------------------------
    # DISPLAY SCORE
    # --------------------------

    cv2.putText(
        frame,
        f"Similarity: {score}%",
        (20, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    if score >= 80:

        cv2.putText(
            frame,
            "Correct Sign",
            (20, 100),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

    else:

        cv2.putText(
            frame,
            "Try Again",
            (20, 100),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            2
        )

    cv2.imshow(
        "Pain Sign Evaluation",
        frame
    )

    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()