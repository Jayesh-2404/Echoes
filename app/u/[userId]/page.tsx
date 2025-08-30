'use client';
import { useState, FormEvent, useEffect } from 'react';

interface UserProfile {
  name: string;
  avatarUrl?: string;
}

export default function SendMessagePage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (!res.ok) throw new Error('User not found.');
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError('Could not find this user.');
      }
    };
    fetchProfile();
  }, [userId]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setSuccess('Message sent successfully!');
      setMessage('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <main>{error || 'Loading...'}</main>;
  }

  return (
    <main style={{ maxWidth: '600px', margin: 'auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {profile.avatarUrl && <img src={profile.avatarUrl} alt={profile.name} style={{ width: '100px', height: '100px', borderRadius: '50%' }} />}
        <h1>Send a message to {profile.name}</h1>
      </div>

      {error && <p style={{ color: '#d32f2f' }}>Error: {error}</p>}
      {success && <p style={{ color: '#388e3c' }}>{success}</p>}

      <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea
          placeholder="Leave your anonymous message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          style={{ padding: '0.75rem', minHeight: '120px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.75rem' }}>
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </main>
  );
}
