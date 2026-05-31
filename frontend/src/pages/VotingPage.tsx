import { useState, useEffect, useCallback } from 'react';
import { Candidate, VoteType } from '../types';
import { CandidateCard } from '../components/CandidateCard';

const STORAGE_KEY = 'votebox_votes';

function getStoredVotes(): Record<number, VoteType> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function storeVote(candidateId: number, voteType: VoteType) {
  const votes = getStoredVotes();
  votes[candidateId] = voteType;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
}

export default function VotingPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [storedVotes, setStoredVotes] = useState<Record<number, VoteType>>(getStoredVotes);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await fetch('/api/candidates');
      if (!res.ok) throw new Error('Server error');
      setCandidates(await res.json());
      setError('');
    } catch {
      setError('Could not reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
    const id = setInterval(fetchCandidates, 5000);
    return () => clearInterval(id);
  }, [fetchCandidates]);

  const handleVote = async (candidateId: number, voteType: VoteType) => {
    if (storedVotes[candidateId]) return;

    try {
      const res = await fetch(`/api/votes/${candidateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });

      if (!res.ok) throw new Error('Vote failed');

      const { likes, dislikes } = (await res.json()) as { likes: number; dislikes: number };

      storeVote(candidateId, voteType);
      setStoredVotes(getStoredVotes());
      setCandidates(prev =>
        prev.map(c => (c.id === candidateId ? { ...c, likes, dislikes } : c))
      );
    } catch {
      alert('Failed to cast vote. Please try again.');
    }
  };

  if (loading) return <div className="state-msg">Loading candidates…</div>;
  if (error) return <div className="state-msg error">{error}</div>;
  if (candidates.length === 0)
    return (
      <div className="state-msg">
        No candidates yet — ask an admin to add some.
      </div>
    );

  return (
    <div className="page">
      <div className="page-header">
        <h2>Cast Your Vote</h2>
        <p>Votes are anonymous. You can vote once per candidate.</p>
      </div>
      <div className="candidates-grid">
        {candidates.map(candidate => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            votedAs={storedVotes[candidate.id] ?? null}
            onVote={handleVote}
          />
        ))}
      </div>
    </div>
  );
}
