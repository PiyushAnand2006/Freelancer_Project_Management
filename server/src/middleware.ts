import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthedRequest, AuthUser, Role } from "./types.js";

const jwtSecret = process.env.JWT_SECRET ?? "local-demo-secret";

export function signToken(user: AuthUser) {
  return jwt.sign(user, jwtSecret, { expiresIn: "8h" });
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing authorization token" });
  }

  try {
    req.user = jwt.verify(header.slice(7), jwtSecret) as AuthUser;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission for this action" });
    }

    return next();
  };
}

export function asyncHandler(
  fn: (req: AuthedRequest, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
