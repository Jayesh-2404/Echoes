'use client';

import { useState, FormEvent, useEffect } from 'react';

interface UserData {
  userId: string;
  secretToken: string;
}

interface Message {
  id: string;
  message: string;
  createdAt: string;
}

// The key we'll use to store user data in the browser's localStorage
const LOCAL_STORAGE_KEY = 'anonymous-messages-user';

export default function HomePage() {
  // Form state for creating a new user
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [user, setUser] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // --- Effects ---

  // On initial component load, check if we have a user saved in localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  const fetchMessages = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/messages?userId=${user.userId}&token=${user.secretToken}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch messages.');
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create link.');

      // Save the new user to state and localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUser(null);
    setMessages([]);
    setName('');
    setAvatarUrl('');
  };

  // --- Rendering ---

  // Show a loading spinner while checking localStorage
  if (checkingAuth) {
    return <main style={{ textAlign: 'center', paddingTop: '5rem' }}>Loading...</main>;
  }

  // If we have a user, show the Dashboard/Inbox view
  if (user) {
    const publicLink = `${window.location.origin}/u/${user.userId}`;
    return (
      <main style={{ maxWidth: '600px', margin: 'auto', padding: '2rem' }}>
        <h2>Your Dashboard</h2>
        <div style={{ background: '#f0f8ff', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <p><strong>Your public link is ready!</strong></p>
          <p>Share this link with your friends to receive messages:</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
             <input type="text" readOnly value={publicLink} style={{ width: '100%', padding: '0.5rem' }} />
             <button onClick={() => navigator.clipboard.writeText(publicLink)}>Copy</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Your Inbox</h3>
          <button onClick={fetchMessages} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && <p style={{ color: '#d32f2f' }}>{error}</p>}

        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {messages.length === 0 && !loading && <p>Your inbox is empty. Share your link!</p>}
          {messages.map((msg) => (
            <li key={msg.id} style={{ border: '1px solid #eee', padding: '1rem', margin: '0.5rem 0' }}>
              <p>{msg.message}</p>
              <small style={{ color: '#999' }}>Received: {new Date(msg.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>

        <button onClick={handleLogout} style={{ marginTop: '2rem', background: '#eee' }}>Create a new link</button>
      </main>
    );
  }

  // If there's no user, show the creation form
  return (
    <main style={{ maxWidth: '600px', margin: '10vh auto', padding: '2rem', textAlign: 'center' }}>
      <h1>Get Your Anonymous Message Link</h1>
      <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        <input
          type="text"
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '0.75rem' }}
        />
        <input
          type="url"
          placeholder="Avatar URL (optional)"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          style={{ padding: '0.75rem' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.75rem', fontSize: '1rem' }}>
          {loading ? 'Creating...' : 'Create My Link'}
        </button>
        {error && <p style={{ color: '#d32f2f', marginTop: '1rem' }}>{error}</p>}
      </form>
    </main>
  );
}
