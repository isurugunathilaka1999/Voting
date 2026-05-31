import { Candidate, VoteType } from '../types';

interface Props {
  candidate: Candidate;
  votedAs: VoteType | null;
  onVote: (id: number, type: VoteType) => void;
}

export function CandidateCard({ candidate, votedAs, onVote }: Props) {
  return (
    <div className="candidate-card">
      {candidate.image && (
        <img
          src={candidate.image}
          alt={candidate.name}
          className="candidate-image"
        />
      )}

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
          <span className="btn-label">{votedAs === 'like' ? 'Liked!' : 'Like'}</span>
        </button>

        <button
          className={`btn-vote btn-dislike${votedAs === 'dislike' ? ' voted' : ''}`}
          onClick={() => onVote(candidate.id, 'dislike')}
          disabled={votedAs !== null}
        >
          <span className="btn-icon">👎</span>
          <span className="btn-label">{votedAs === 'dislike' ? 'Disliked!' : 'Dislike'}</span>
        </button>
      </div>

      {votedAs && (
        <p className="voted-message">✓ Your vote has been recorded</p>
      )}
    </div>
  );
}
