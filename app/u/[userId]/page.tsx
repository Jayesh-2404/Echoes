// FILE: app/u/[userId]/page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';

interface Message {
  id: string;
  message: string;
  createdAt: string;
}

interface Status {
  loading: boolean;
  error: string;
  success: string;
}

export default function UserPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<Status>({ loading: false, error: '', success: '' });
  const [inboxStatus, setInboxStatus] = useState<Status>({ loading: false, error: '', success: '' });

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus({ loading: false, success: 'Message sent successfully! Thank you.', error: '' });
      setMessage('');
    } catch (err: any) {
      setStatus({ loading: false, error: err.message, success: '' });
    }
  };

  const handleGetMessages = async () => {
    setInboxStatus({ loading: true, error: '', success: '' });
    try {
      const res = await fetch(`/api/messages?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch messages. This might not be your link, or an error occurred.');
      const data: Message[] = await res.json();
      setMessages(data);
      setInboxStatus({ loading: false, success: '', error: '' });
    } catch (err: any) {
      setInboxStatus({ loading: false, error: err.message, success: '' });
    }
  };

  useEffect(() => {
    handleGetMessages();

  }, [userId]);


  return (
    <main style={{ maxWidth: '600px', margin: 'auto', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center' }}>Send an Anonymous Message</h1>

      {status.error && <p style={{ color: '#d32f2f' }}>Error: {status.error}</p>}
      {status.success && <p style={{ color: '#388e3c' }}>{status.success}</p>}

      <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        <textarea
          placeholder="Leave a secret message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          style={{ padding: '0.75rem', minHeight: '120px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button type="submit" disabled={status.loading} style={{ padding: '0.75rem', cursor: 'pointer', background: '#333', color: 'white', border: 'none' }}>
          {status.loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      <hr style={{ margin: '3rem 0', border: 'none', borderTop: '1px solid #eee' }}/>

      <div>
        <h2>Your Inbox</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>Only you should see this. Don't share this link if you want to keep your messages private!</p>
        <button onClick={handleGetMessages} disabled={inboxStatus.loading} style={{ marginTop: '0.5rem' }}>
          {inboxStatus.loading ? 'Refreshing...' : 'Refresh Messages'}
        </button>

        {inboxStatus.error && <p style={{ color: '#d32f2f', marginTop: '1rem' }}>{inboxStatus.error}</p>}

        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {messages.length === 0 && !inboxStatus.loading && <p>Your inbox is empty.</p>}
          {messages.map((msg) => (
            <li key={msg.id} style={{ border: '1px solid #eee', padding: '1rem', margin: '0.5rem 0', borderRadius: '4px' }}>
              <p>{msg.message}</p>
              <small style={{ color: '#999' }}>Received: {new Date(msg.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
