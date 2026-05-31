import { Request, Response, NextFunction } from 'express';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const password =
    (req.headers['x-admin-password'] as string) ||
    (req.query['adminPassword'] as string);

  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
