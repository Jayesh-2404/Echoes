"use client"
import RetroShell from "@/components/retro-shell"
import { useState, type FormEvent, useEffect } from "react"

interface UserProfile {
  name: string
  avatarUrl?: string
}

export default function SendMessagePage({ params }: { params: { userId: string } }) {
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
          <textarea
            placeholder="Leave your anonymous message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            aria-label="Anonymous message"
          />
          <button type="submit" disabled={loading} className="btn">
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </main>
    </RetroShell>
  )
}
