import { Candidate, VoteType } from '../types';

interface Props {
  candidate: Candidate;
  votedAs: VoteType | null;
  onVote: (id: number, type: VoteType) => void;
}

export function CandidateCard({ candidate, votedAs, onVote }: Props) {
  const total = candidate.likes + candidate.dislikes;
  const likePercent = total > 0 ? Math.round((candidate.likes / total) * 100) : 0;

  return (
    <div className="candidate-card">
      <div className="candidate-header">
        <h2 className="candidate-name">{candidate.name}</h2>
        {candidate.description && (
          <p className="candidate-description">{candidate.description}</p>
        )}
      </div>

      <div className="vote-buttons">
        <button
          className={`btn-vote btn-like${votedAs === 'like' ? ' voted' : ''}`}
          onClick={() => onVote(candidate.id, 'like')}
          disabled={votedAs !== null}
        >
          <span className="btn-icon">👍</span>
          <span className="btn-label">Like</span>
          <span className="btn-count">{candidate.likes}</span>
        </button>

        <button
          className={`btn-vote btn-dislike${votedAs === 'dislike' ? ' voted' : ''}`}
          onClick={() => onVote(candidate.id, 'dislike')}
          disabled={votedAs !== null}
        >
          <span className="btn-icon">👎</span>
          <span className="btn-label">Dislike</span>
          <span className="btn-count">{candidate.dislikes}</span>
        </button>
      </div>

      {votedAs && (
        <p className="voted-message">✓ You voted <strong>{votedAs}</strong></p>
      )}

      {total > 0 && (
        <div className="vote-bar">
          <div className="bar-like" style={{ width: `${likePercent}%` }} />
          <div className="bar-dislike" style={{ width: `${100 - likePercent}%` }} />
        </div>
      )}

      <div className="vote-stats">
        <span>{total} vote{total !== 1 ? 's' : ''}</span>
        {total > 0 && <span>{likePercent}% approval</span>}
      </div>
    </div>
  );
}
