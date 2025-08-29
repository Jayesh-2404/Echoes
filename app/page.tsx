'use client';

import { useState, FormEvent } from 'react';

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

export default function HomePage() {
  const [recipientId, setRecipientId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<Status>({ loading: false, error: '', success: '' });

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus({ loading: false, success: 'Message sent successfully!', error: '' });
      setMessage('');
      handleGetMessages(); // Refresh messages after sending
    } catch (err: any) {
      setStatus({ loading: false, error: err.message, success: '' });
    }
  };

  const handleGetMessages = async () => {
    if (!recipientId) return;
    setStatus({ loading: true, error: '', success: '' });
    try {
      const res = await fetch(`/api/messages?recipientId=${recipientId}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data: Message[] = await res.json();
      setMessages(data);
      setStatus({ loading: false, success: 'Messages loaded.', error: '' });
    } catch (err: any) {
      setStatus({ loading: false, error: err.message, success: '' });
    }
  };

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto', padding: '2rem' }}>
      <h1>Anonymous Messages</h1>

      {status.error && <p style={{ color: '#d32f2f', background: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>Error: {status.error}</p>}
      {status.success && <p style={{ color: '#388e3c', background: '#e8f5e9', padding: '0.5rem', borderRadius: '4px' }}>{status.success}</p>}

      <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Recipient ID (e.g., a CUID)"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          required
          style={{ padding: '0.5rem' }}
        />
        <textarea
          placeholder="Your anonymous message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          style={{ padding: '0.5rem', minHeight: '100px' }}
        />
        <button type="submit" disabled={status.loading} style={{ padding: '0.75rem', cursor: 'pointer' }}>
          {status.loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      <hr style={{ margin: '2rem 0' }}/>

      <div>
        <h2>Inbox for "{recipientId || '...'}"</h2>
        <button onClick={handleGetMessages} disabled={!recipientId || status.loading}>
          {status.loading ? 'Loading...' : 'Refresh Messages'}
        </button>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {messages.length === 0 && <p>No messages yet.</p>}
          {messages.map((msg) => (
            <li key={msg.id} style={{ border: '1px solid #ddd', padding: '1rem', margin: '0.5rem 0', borderRadius: '4px' }}>
              <p>{msg.message}</p>
              <small>Received: {new Date(msg.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
