"use client"

import RetroShell from "@/components/retro-shell"
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"

interface UserData {
  userId: string
}

interface Message {
  id: string
  message: string
  createdAt: string
  answer?: string
}

const LOCAL_STORAGE_KEY = "anonymous-messages-user-id"
const AnswerForm = ({ message, onAnswerSubmitted }: { message: Message; onAnswerSubmitted: (messageId: string, answer: string) => Promise<void> }) => {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      setFormError('Answer cannot be empty.');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      await onAnswerSubmitted(message.id, answer);
      setAnswer('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (message.answer) {
    return (
      <div className="answered-box">
        <strong>Your Answer:</strong>
        <p>{message.answer}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="answer-form">
      <textarea
        placeholder="Type your answer here..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-secondary" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Answer'}
      </button>
      {formError && <small className="error-text">{formError}</small>}
    </form>
  )
}

export default function HomePage() {
  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [user, setUser] = useState<UserData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checkingAuth, setCheckingAuth] = useState(true)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // The new, async logout handler
  const handleLogout = useCallback(async () => {
    try {
      // 1. Tell the server to clear the secure cookie
      await fetch("/api/logout", { method: "POST" })
    } catch (err) {
      console.error("Failed to call logout API, clearing client state anyway.", err)
    } finally {
      // 2. Clear all client-side state and storage
      if (intervalRef.current) clearInterval(intervalRef.current)
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      setUser(null)
      setMessages([])
      setName("")
      setAvatarUrl("")
      setError("")
    }
  }, [])

  const fetchMessages = useCallback(async () => {
    if (!user) return
    setError("")
    try {
      const res = await fetch(`/api/messages?userId=${user.userId}`)

      if (res.status === 403 || res.status === 401) {
        throw new Error("Access Denied")
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to fetch messages." }))
        throw new Error(data.error)
      }

      const data = await res.json()
      setMessages(data)
    } catch (err: any) {
      setError(err.message)
      if (err.message.includes("Access Denied")) {
        await handleLogout()
      }
    }
  }, [user, handleLogout])

  useEffect(() => {
    try {
      const savedUserId = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedUserId) {
        setUser({ userId: savedUserId })
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e)
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
    setCheckingAuth(false)
  }, [])

  // Effect to manage polling for messages
  useEffect(() => {
    if (user) {
      fetchMessages()
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(fetchMessages, 5000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [user, fetchMessages])
  const handleAnswerSubmitted = async (messageId: string, answer: string) => {
    const res = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save answer.');
    }

    const updatedMessage = await res.json();
    setMessages(prevMessages =>
        prevMessages.map(msg =>
            msg.id === messageId ? { ...msg, answer: updatedMessage.answer } : msg
        )
    );
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create link.")
      localStorage.setItem(LOCAL_STORAGE_KEY, data.userId)
      setUser(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <RetroShell>
        <main className="container container-center">Loading...</main>
      </RetroShell>
    )
  }

  if (user) {
    const publicLink = `${window.location.origin}/u/${user.userId}`
    return (
      <RetroShell>
        {/* We need some simple styles for the new answer form */}
        <style jsx>{`
            .answer-form {
                margin-top: 1rem;
                border-top: 2px dashed #ccc;
                padding-top: 1rem;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .answered-box {
                margin-top: 1rem;
                padding: 0.75rem;
                background-color: #f0fff8;
                border: 2px solid var(--primary);
            }
            .answered-box p {
                margin: 0.25rem 0 0 0;
            }
            .error-text {
                color: var(--error);
            }
        `}</style>
        <main className="container">
          <h2>Your Dashboard</h2>
          <div className="link-box">
            <p><strong>Your public link is ready <span className="badge">Share it</span></strong></p>
            <p>Share this link with your friends to receive messages:</p>
            <div className="link-box-actions">
              <input type="text" readOnly value={publicLink} aria-label="Public link" />
              <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(publicLink)}>Copy</button>
            </div>
          </div>

          <div className="inbox-header">
            <h3>Your Inbox</h3>
            <button className="btn btn-secondary" onClick={fetchMessages} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh Now"}
            </button>
          </div>

          {error && <p className="alert alert-error">{error}</p>}

          <ul className="message-list">
            {messages.length === 0 && !loading && <p>Your inbox is empty. Share your link!</p>}
            {messages.map((msg) => (
              <li key={msg.id} className="message-item">
                <p>{msg.message}</p>
                <small>Received: {new Date(msg.createdAt).toLocaleString()}</small>
                {/* Render the AnswerForm for each message */}
                <AnswerForm message={msg} onAnswerSubmitted={handleAnswerSubmitted} />
              </li>
            ))}
          </ul>

          <button onClick={handleLogout} className="btn btn-secondary" style={{ marginTop: "2rem" }}>
            Create a new link
          </button>
        </main>
      </RetroShell>
    )
  }

  // The create user form remains unchanged.
  return (
    <RetroShell>
      <main className="container container-center">
        <h1>Get Your Anonymous Message Link</h1>
        <form onSubmit={handleCreateUser} className="form-stack">
          <input type="text" placeholder="Enter Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="url" placeholder="Avatar URL (optional)" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          <button type="submit" disabled={loading} className="btn">{loading ? "Creating..." : "Create My Link"}</button>
          {error && <p className="alert alert-error">{error}</p>}
        </form>
      </main>
    </RetroShell>
  )
}
