import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../common/env";

type JwtPayload = {
  sub: string;
  role: "ADMIN" | "USER";
};

export function authenticate(req: Request, res: Response, next: NextFunction) {
     const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = JWT_SECRET;

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}