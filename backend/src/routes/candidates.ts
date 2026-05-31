import { Router } from 'express';
import multer from 'multer';
import db from '../db';
import { requireAdmin } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB max
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'));
  },
});

router.get('/', (_req, res): void => {
  const candidates = db.all(`
    SELECT
      c.id, c.name, c.description, c.image, c.created_at,
      COUNT(CASE WHEN v.vote_type = 'like'    THEN 1 END) AS likes,
      COUNT(CASE WHEN v.vote_type = 'dislike' THEN 1 END) AS dislikes
    FROM candidates c
    LEFT JOIN votes v ON c.id = v.candidate_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);
  res.json(candidates);
});

router.post('/', requireAdmin, upload.single('image'), (req, res): void => {
  const { name, description } = req.body as { name?: string; description?: string };

  if (!name?.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  let imageData: string | null = null;
  if (req.file) {
    const b64 = req.file.buffer.toString('base64');
    imageData = `data:${req.file.mimetype};base64,${b64}`;
  }

  const result = db.run(
    'INSERT INTO candidates (name, description, image) VALUES (?, ?, ?)',
    [name.trim(), description?.trim() ?? '', imageData]
  );

  res.status(201).json({
    id: result.lastInsertRowid,
    name: name.trim(),
    description: description?.trim() ?? '',
    image: imageData,
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
