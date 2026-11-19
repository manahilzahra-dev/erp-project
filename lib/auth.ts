import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { UserRole } from "@/lib/models/User";

export interface TokenPayload {
  id: string;
  role: UserRole;
  email: string;
}

/**
 * Verify JWT token from Authorization header
 * Returns payload or null
 */
export function verifyToken(req: NextRequest): TokenPayload | null {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    return decoded;
  } catch  {
    return null;
  }
}

/**
 * Get authenticated user from request
 * Returns payload or throws 401 response
 */
export function requireAuth(req: NextRequest): TokenPayload {
  const payload = verifyToken(req);

  if (!payload) {
    throw new AuthError("Unauthorized: Please login first", 401);
  }

  return payload;
}

/**
 * Require specific roles
 * Throws 403 if role not allowed
 */
export function requireRole(req: NextRequest, allowedRoles: UserRole[]): TokenPayload {
  const payload = requireAuth(req);

  if (!allowedRoles.includes(payload.role)) {
    throw new AuthError(
      `Forbidden: This action requires one of these roles: ${allowedRoles.join(", ")}`,
      403
    );
  }

  return payload;
}

/**
 * Custom error class for auth failures
 */
export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}