import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * Decodes and validates a Firebase ID token from the Authorization header.
 * Expected format: Bearer <firebaseIdToken>
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization header. Expected Bearer token.',
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Empty token provided.' });
    return;
  }

  try {
    // Decode JWT segments (Header.Payload.Signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      res.status(401).json({ error: 'Unauthorized: Malformed JWT token format.' });
      return;
    }

    // Decode Base64URL payload
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(jsonPayload);

    // Validate expiration
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) {
      res.status(401).json({ error: 'Unauthorized: Token has expired. Please sign in again.' });
      return;
    }

    // Extract user ID (Firebase uses 'user_id' or 'sub')
    const userId = payload.user_id || payload.sub;
    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ error: 'Unauthorized: Invalid token claims (missing user id).' });
      return;
    }

    // Attach verified user information to request
    req.userId = userId;
    req.userEmail = payload.email || undefined;

    next();
  } catch (error) {
    console.warn('Auth token verification error:', error);
    res.status(401).json({ error: 'Unauthorized: Failed to authenticate user credentials.' });
  }
}
