import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

/** Attaches req.user = { id, isGuest } when a valid Bearer token is present. */
export function authOptional(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, env.jwtSecret);
    } catch {
      /* ignore invalid token in optional mode */
    }
  }
  next();
}

/** Requires a valid token (guest or real). */
export function authRequired(req, res, next) {
  authOptional(req, res, () => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    next();
  });
}

/** Requires a real (non-guest) account. */
export function realUserRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.isGuest)
      return res.status(403).json({ error: "Sign in with an account to access this" });
    next();
  });
}
