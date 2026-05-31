import { Router } from 'express';
import db from '../db';

const router = Router();

router.post('/:candidateId', (req, res): void => {
  const id = Number(req.params.candidateId);
  const { voteType, previousVoteType } = req.body as {
    voteType?: string;
    previousVoteType?: string;
  };

  if (voteType !== 'like' && voteType !== 'dislike') {
    res.status(400).json({ error: 'voteType must be "like" or "dislike"' });
    return;
  }

  const candidate = db.get('SELECT id FROM candidates WHERE id = ?', [id]);
  if (!candidate) {
    res.status(404).json({ error: 'Candidate not found' });
    return;
  }

  // Changing vote: remove one row of the previous type
  if (previousVoteType === 'like' || previousVoteType === 'dislike') {
    db.run(
      `DELETE FROM votes WHERE id = (
         SELECT id FROM votes WHERE candidate_id = ? AND vote_type = ? LIMIT 1
       )`,
      [id, previousVoteType]
    );
  }

  db.run('INSERT INTO votes (candidate_id, vote_type) VALUES (?, ?)', [id, voteType]);

  const counts = db.get(
    `SELECT
      COUNT(CASE WHEN vote_type = 'like'    THEN 1 END) AS likes,
      COUNT(CASE WHEN vote_type = 'dislike' THEN 1 END) AS dislikes
     FROM votes WHERE candidate_id = ?`,
    [id]
  ) as { likes: number; dislikes: number };

  res.json(counts);
});

export default router;
