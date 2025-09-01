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

  // Use a ref to hold the interval ID to avoid issues with state updates
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    setError('');
    try {
      const res = await fetch(`/api/messages?userId=${user.userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch messages.');
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
      if (err.message.toLowerCase().includes('denied')) {
        handleLogout();
      }
    } finally {
    }
  }, [user]);

  // On initial load, check for user ID in localStorage
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
     intervalRef.current = setInterval(fetchMessages, 5000);
    }

    // Cleanup function to clear interval when component unmounts or user changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
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

      // Save only the userId to localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, data.userId);
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear local state and storage
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUser(null);
    setMessages([]);
    setName('');
    setAvatarUrl('');
    // We can't clear the httpOnly cookie from the client, but it will be invalid
    // when the user tries to fetch messages next time and they will be logged out.
    // A proper logout would involve an API call to clear the cookie.
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
