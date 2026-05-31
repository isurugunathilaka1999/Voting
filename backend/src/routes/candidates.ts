import { Router } from 'express';
import db from '../db';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', (_req, res): void => {
  const candidates = db.all(`
    SELECT
      c.id, c.name, c.description, c.created_at,
      COUNT(CASE WHEN v.vote_type = 'like'    THEN 1 END) AS likes,
      COUNT(CASE WHEN v.vote_type = 'dislike' THEN 1 END) AS dislikes
    FROM candidates c
    LEFT JOIN votes v ON c.id = v.candidate_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);
  res.json(candidates);
});

router.post('/', requireAdmin, (req, res): void => {
  const { name, description } = req.body as { name?: string; description?: string };

  if (!name?.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const result = db.run(
    'INSERT INTO candidates (name, description) VALUES (?, ?)',
    [name.trim(), description?.trim() ?? '']
  );

  res.status(201).json({
    id: result.lastInsertRowid,
    name: name.trim(),
    description: description?.trim() ?? '',
    created_at: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
  });
});

router.delete('/:id', requireAdmin, (req, res): void => {
  const id = Number(req.params.id);

  const candidate = db.get('SELECT id FROM candidates WHERE id = ?', [id]);
  if (!candidate) {
    res.status(404).json({ error: 'Candidate not found' });
    return;
  }

  db.run('DELETE FROM votes WHERE candidate_id = ?', [id]);
  db.run('DELETE FROM candidates WHERE id = ?', [id]);
  res.json({ success: true });
});

export default router;
