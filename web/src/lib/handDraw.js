import { FINGER_COLORS } from "./ui.js";

// MediaPipe Hands connections, tagged by finger so each bone is colored.
const C = (a, b, f) => ({ a, b, f });
export const HAND_CONNECTIONS = [
  // palm / wrist
  C(0, 1, "palm"), C(0, 5, "palm"), C(5, 9, "palm"),
  C(9, 13, "palm"), C(13, 17, "palm"), C(0, 17, "palm"),
  // thumb
  C(1, 2, "thumb"), C(2, 3, "thumb"), C(3, 4, "thumb"),
  // index
  C(5, 6, "index"), C(6, 7, "index"), C(7, 8, "index"),
  // middle
  C(9, 10, "middle"), C(10, 11, "middle"), C(11, 12, "middle"),
  // ring
  C(13, 14, "ring"), C(14, 15, "ring"), C(15, 16, "ring"),
  // pinky
  C(17, 18, "pinky"), C(18, 19, "pinky"), C(19, 20, "pinky"),
];

// landmark index -> finger (for point color)
const LANDMARK_FINGER = {
  0: "palm",
  1: "thumb", 2: "thumb", 3: "thumb", 4: "thumb",
  5: "index", 6: "index", 7: "index", 8: "index",
  9: "middle", 10: "middle", 11: "middle", 12: "middle",
  13: "ring", 14: "ring", 15: "ring", 16: "ring",
  17: "pinky", 18: "pinky", 19: "pinky", 20: "pinky",
};

/**
 * Map a MediaPipe normalized point (0..1 over the SOURCE frame) into the
 * canvas, accounting for object-cover cropping of a srcW×srcH source into a
 * cw×ch box — so the skeleton aligns with the displayed (cover-fit) video.
 */
function coverMap(cw, ch, srcW, srcH) {
  const scale = Math.max(cw / srcW, ch / srcH);
  const dw = srcW * scale;
  const dh = srcH * scale;
  const ox = (cw - dw) / 2;
  const oy = (ch - dh) / 2;
  return (x, y) => [ox + x * dw, oy + y * dh];
}

/**
 * Draw the detected hands' skeletons onto a 2D context.
 * hands = [{ points: [{x,y}, ...21] }, ...]
 */
export function drawHands(ctx, hands, cw, ch, srcW, srcH) {
  ctx.clearRect(0, 0, cw, ch);
  if (!hands || !hands.length || !srcW) return;
  const map = coverMap(cw, ch, srcW, srcH);
  const lineW = Math.max(2.5, cw * 0.004);
  const dotR = Math.max(3.5, cw * 0.0075);

  for (const hand of hands) {
    const pts = hand.points;
    if (!pts || pts.length < 21) continue;

    // bones
    ctx.lineWidth = lineW;
    ctx.lineCap = "round";
    for (const { a, b, f } of HAND_CONNECTIONS) {
      const [ax, ay] = map(pts[a].x, pts[a].y);
      const [bx, by] = map(pts[b].x, pts[b].y);
      ctx.strokeStyle = FINGER_COLORS[f];
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    // joints
    for (let i = 0; i < pts.length; i++) {
      const [px, py] = map(pts[i].x, pts[i].y);
      ctx.beginPath();
      ctx.arc(px, py, dotR, 0, Math.PI * 2);
      ctx.fillStyle = FINGER_COLORS[LANDMARK_FINGER[i]] || "#fff";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.stroke();
    }
  }
}
