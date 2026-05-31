import { useState } from 'react';
import VotingPage from './pages/VotingPage';
import AdminPage from './pages/AdminPage';

type Page = 'vote' | 'admin';

export default function App() {
  const [page, setPage] = useState<Page>('vote');

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-title">🗳️ VoteBox</span>
          <nav>
            <button
              className={`nav-btn${page === 'vote' ? ' active' : ''}`}
              onClick={() => setPage('vote')}
            >
              Vote
            </button>
            <button
              className={`nav-btn${page === 'admin' ? ' active' : ''}`}
              onClick={() => setPage('admin')}
            >
              Admin
            </button>
          </nav>
        </div>
      </header>
      <main className="main">
        {page === 'vote' ? <VotingPage /> : <AdminPage />}
      </main>
    </div>
  );
}
