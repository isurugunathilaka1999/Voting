import { useState, useEffect, useCallback, useRef } from 'react';
import { Candidate } from '../types';

const SESSION_KEY = 'votebox_admin_pwd';

export default function AdminPage() {
  const [pwd, setPwd] = useState('');
  const [authed, setAuthed] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFlash = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setFlash({ msg, type });
    setTimeout(() => setFlash(null), 3000);
  };

  const fetchCandidates = useCallback(async () => {
    const res = await fetch('/api/candidates');
    if (res.ok) setCandidates(await res.json());
  }, []);

  const adminHeaders = () => ({
    'x-admin-password': sessionStorage.getItem(SESSION_KEY) ?? '',
  });

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return;
    fetch('/api/admin/verify', { headers: { 'x-admin-password': saved } }).then(res => {
      if (res.ok) { setAuthed(true); fetchCandidates(); }
      else sessionStorage.removeItem(SESSION_KEY);
    });
  }, [fetchCandidates]);

  useEffect(() => {
    if (!authed) return;
    const id = setInterval(fetchCandidates, 10000);
    return () => clearInterval(id);
  }, [authed, fetchCandidates]);

  const login = async () => {
    if (!pwd.trim()) return;
    try {
      const res = await fetch('/api/admin/verify', { headers: { 'x-admin-password': pwd } });
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, pwd);
        setAuthed(true);
        fetchCandidates();
      } else {
        showFlash('Wrong password', 'err');
      }
    } catch {
      showFlash('Could not connect to server', 'err');
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setPwd('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addCandidate = async () => {
    if (!newName.trim()) { showFlash('Name is required', 'err'); return; }

    const formData = new FormData();
    formData.append('name', newName);
    formData.append('description', newDesc);
    if (imageFile) formData.append('image', imageFile);

    const res = await fetch('/api/candidates', {
      method: 'POST',
      headers: adminHeaders(),
      body: formData,
    });

    if (res.ok) {
      const c: Candidate = await res.json();
      setCandidates(prev => [c, ...prev]);
      setNewName('');
      setNewDesc('');
      clearImage();
      showFlash('Candidate added');
    } else {
      showFlash('Failed to add candidate', 'err');
    }
  };

  const deleteCandidate = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}" and all their votes?`)) return;
    const res = await fetch(`/api/candidates/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    });
    if (res.ok) {
      setCandidates(prev => prev.filter(c => c.id !== id));
      showFlash('Candidate deleted');
    } else {
      showFlash('Failed to delete', 'err');
    }
  };

  const resetVotes = async () => {
    if (!confirm('Reset ALL votes across all candidates? This cannot be undone.')) return;
    const res = await fetch('/api/admin/reset-votes', {
      method: 'POST',
      headers: { ...adminHeaders(), 'Content-Type': 'application/json' },
    });
    if (res.ok) { fetchCandidates(); showFlash('All votes reset'); }
    else showFlash('Failed to reset votes', 'err');
  };

  if (!authed) {
    return (
      <div className="page login-page">
        <div className="login-box">
          <h2>Admin Login</h2>
          <p>Enter the admin password to manage candidates.</p>
          <div className="login-form">
            <input
              type="password"
              className="input"
              placeholder="Password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
            />
            <button className="btn-primary" onClick={login}>Login</button>
          </div>
          {flash && <p className={`flash ${flash.type}`}>{flash.msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="admin-topbar">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Manage candidates and votes</p>
        </div>
        <div className="admin-topbar-actions">
          <button className="btn-danger" onClick={resetVotes}>Reset All Votes</button>
          <button className="btn-secondary" onClick={logout}>Logout</button>
        </div>
      </div>

      {flash && <div className={`flash-bar ${flash.type}`}>{flash.msg}</div>}

      <div className="admin-section">
        <h3>Add Candidate</h3>
        <div className="form-row">
          <input
            type="text"
            className="input"
            placeholder="Name *"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCandidate()}
          />
          <input
            type="text"
            className="input"
            placeholder="Description (optional)"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
          />
        </div>

        <div className="image-upload-row">
          <label className="upload-label">
            📷 {imageFile ? imageFile.name : 'Choose photo (optional)'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>
          {imagePreview && (
            <div className="image-preview-wrap">
              <img src={imagePreview} alt="preview" className="image-preview" />
              <button className="btn-clear-img" onClick={clearImage}>✕</button>
            </div>
          )}
          <button className="btn-primary" onClick={addCandidate}>Add Candidate</button>
        </div>
      </div>

      <div className="admin-section">
        <h3>Candidates ({candidates.length})</h3>
        {candidates.length === 0 ? (
          <p className="empty-note">No candidates yet.</p>
        ) : (
          <div className="admin-list">
            {candidates.map(c => {
              const total = c.likes + c.dislikes;
              const pct = total > 0 ? Math.round((c.likes / total) * 100) : 0;
              return (
                <div key={c.id} className="admin-row">
                  {c.image && (
                    <img src={c.image} alt={c.name} className="admin-thumb" />
                  )}
                  <div className="admin-row-info">
                    <strong>{c.name}</strong>
                    {c.description && <span className="admin-desc"> — {c.description}</span>}
                  </div>
                  <div className="admin-row-stats">
                    <span className="stat-like">👍 {c.likes}</span>
                    <span className="stat-dislike">👎 {c.dislikes}</span>
                    <span className="stat-total">
                      {total} vote{total !== 1 ? 's' : ''}
                      {total > 0 ? ` · ${pct}% approval` : ''}
                    </span>
                  </div>
                  <button className="btn-delete" onClick={() => deleteCandidate(c.id, c.name)}>
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
