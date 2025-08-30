'use client';

import { useState } from 'react';

export default function HomePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to create a link. Please try again.');
      }
      const data = await res.json();
      setUserId(data.userId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getShareableLink = () => {
    if (!userId) return '';
    return `${window.location.origin}/u/${userId}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShareableLink());
    alert('Link copied to clipboard!');
  };

  return (
    <main style={{ maxWidth: '600px', margin: '10vh auto', padding: '2rem', textAlign: 'center' }}>
      <h1>Get Your Anonymous Message Link</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Create a unique link to share with your friends and see what they have to say.
      </p>

      {!userId ? (
        <button onClick={handleCreateLink} disabled={loading} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}>
          {loading ? 'Creating...' : 'Create My Link'}
        </button>
      ) : (
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
          <h2>Your link is ready!</h2>
          <p>Share this link with your friends:</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <input
              type="text"
              readOnly
              value={getShareableLink()}
              style={{ flexGrow: 1, padding: '0.5rem', border: '1px solid #ccc' }}
            />
            <button onClick={copyToClipboard} style={{ padding: '0.5rem 1rem' }}>Copy</button>
          </div>
        </div>
      )}

      {error && <p style={{ color: '#d32f2f', marginTop: '1rem' }}>Error: {error}</p>}
    </main>
  );
}
