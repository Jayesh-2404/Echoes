'use client';

import { useState, FormEvent, useEffect, useCallback, useRef } from 'react';

interface UserData {
  userId: string;
}

interface Message {
  id: string;
  message: string;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'anonymous-messages-user-id';

export default function HomePage() {
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [user, setUser] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // The new, async logout handler
  const handleLogout = useCallback(async () => {
    try {
      // 1. Tell the server to clear the secure cookie
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error("Failed to call logout API, clearing client state anyway.", err);
    } finally {
      // 2. Clear all client-side state and storage
      if (intervalRef.current) clearInterval(intervalRef.current);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setUser(null);
      setMessages([]);
      setName('');
      setAvatarUrl('');
      setError('');
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    setError('');
    try {
      const res = await fetch(`/api/messages?userId=${user.userId}`);

      if (res.status === 403 || res.status === 401) {
        throw new Error('Access Denied');
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to fetch messages.' }));
        throw new Error(data.error);
      }

      const data = await res.json();
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes('Access Denied')) {
        await handleLogout();
      }
    }
  }, [user, handleLogout]);

  useEffect(() => {
    try {
      const savedUserId = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedUserId) {
        setUser({ userId: savedUserId });
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setCheckingAuth(false);
  }, []);

  // Effect to manage polling for messages
  useEffect(() => {
    if (user) {
      fetchMessages();
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(fetchMessages, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, fetchMessages]);

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
      localStorage.setItem(LOCAL_STORAGE_KEY, data.userId);
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <main className="container container-center">Loading...</main>;
  }

  if (user) {
    const publicLink = `${window.location.origin}/u/${user.userId}`;
    return (
      <main className="container">
        <h2>Your Dashboard</h2>
        <div className="link-box">
          <p><strong>Your public link is ready!</strong></p>
          <p>Share this link with your friends to receive messages:</p>
          <div className="link-box-actions">
             <input type="text" readOnly value={publicLink} />
             <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(publicLink)}>Copy</button>
          </div>
        </div>

        <div className="inbox-header">
          <h3>Your Inbox</h3>
          <button className="btn btn-secondary" onClick={fetchMessages} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>

        {error && <p className="alert alert-error">{error}</p>}

        <ul className="message-list">
          {messages.length === 0 && !loading && <p>Your inbox is empty. Share your link!</p>}
          {messages.map((msg) => (
            <li key={msg.id} className="message-item">
              <p>{msg.message}</p>
              <small>Received: {new Date(msg.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>

        <button onClick={handleLogout} className="btn btn-secondary" style={{ marginTop: '2rem' }}>Create a new link</button>
      </main>
    );
  }

  return (
    <main className="container container-center">
      <h1>Get Your Anonymous Message Link</h1>
      <form onSubmit={handleCreateUser} className="form-stack">
        <input
          type="text"
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="url"
          placeholder="Avatar URL (optional)"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
        <button type="submit" disabled={loading} className="btn">
          {loading ? 'Creating...' : 'Create My Link'}
        </button>
        {error && <p className="alert alert-error">{error}</p>}
      </form>
    </main>
  );
}
