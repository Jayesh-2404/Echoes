"use client"
import RetroShell from "@/components/retro-shell";
import { useEffect, useState, type FormEvent } from "react";


interface AnsweredMessage {
    id: string;
    message: string;
    answer: string | null;
    answeredAt: string;
}


interface UserProfile {
  name: string
  avatarUrl?: string
  answeredMessages: AnsweredMessage[]
}

export default function SendMessagePage({ params }: { params: { userId:string } }) {
  const { userId } = params
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`)
        if (!res.ok) throw new Error("User not found.")
        const data = await res.json()
        setProfile(data)
      } catch (err) {
        setError("Could not find this user.")
      }
    }
    fetchProfile()
  }, [userId])

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      setSuccess("Message sent successfully!")
      setMessage("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!profile && !error) {
    return (
      <RetroShell>
        <main className="container container-center">Loading...</main>
      </RetroShell>
    )
  }

  if (error && !profile) {
    return (
      <RetroShell>
        <main className="container container-center alert alert-error">{error}</main>
      </RetroShell>
    )
  }

  return (
    <RetroShell>
       <style jsx>{`
        .qna-section {
            margin-top: 3rem;
            border-top: 2px solid var(--border-color);
            padding-top: 1.5rem;
        }
        .qna-item {
            margin-bottom: 2rem;
        }
        .qna-question, .qna-answer {
            padding: 1rem;
            border: 2px solid var(--border-color);
        }
        .qna-question {
            background: #fff;
            position: relative;
        }
        .qna-question::before {
            content: 'Q:';
            position: absolute;
            top: -12px;
            left: 10px;
            background: var(--background);
            padding: 0 8px;
            font-weight: bold;
            font-size: 22px;
        }
        .qna-answer {
            background: #f0fff8;
            margin-top: 0.75rem;
            position: relative;
        }
        .qna-answer::before {
            content: 'A:';
            position: absolute;
            top: -12px;
            left: 10px;
            background: #f0fff8;
            padding: 0 8px;
            font-weight: bold;
            color: var(--primary);
            font-size: 22px;
        }
      `}</style>
      <main className="container">
        <div className="profile-header">
          {profile?.avatarUrl && (
            <img src={profile.avatarUrl || "/placeholder.svg"} alt={profile.name} className="profile-avatar" />
          )}
          <h1>Send a message to {profile?.name}</h1>
        </div>

        {error && <p className="alert alert-error">{error}</p>}
        {success && <p className="alert alert-success">{success}</p>}

        <form onSubmit={handleSendMessage} className="form-stack">
          <textarea placeholder="Leave your anonymous message here..." value={message} onChange={(e) => setMessage(e.target.value)} required aria-label="Anonymous message" />
          <button type="submit" disabled={loading} className="btn">{loading ? "Sending..." : "Send Message"}</button>
        </form>

        {/* --- NEW SECTION: Display Answered Questions --- */}
        {profile && profile.answeredMessages.length > 0 && (
            <div className="qna-section">
                <h2>Answered Questions</h2>
                {profile.answeredMessages.map(item => (
                    <div key={item.id} className="qna-item">
                        <div className="qna-question">
                            <p>{item.message}</p>
                        </div>
                         <div className="qna-answer">
                            <p>{item.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>
    </RetroShell>
  )
}
