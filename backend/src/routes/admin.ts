import { Router } from 'express';
import db from '../db';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/verify', requireAdmin, (_req, res): void => {
  res.json({ ok: true });
});

router.post('/reset-votes', requireAdmin, (_req, res): void => {
  db.run('DELETE FROM votes');
  res.json({ success: true });
});

export default router;
