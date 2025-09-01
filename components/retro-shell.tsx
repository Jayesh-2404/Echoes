"use client"
import type React from "react"

export default function RetroShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="site-wrapper">
        {children}
        <footer className="site-footer">
          Made with <span className="heart">♥</span> by{" "}
          <a href="https://github.com/Jayesh-2404" target="_blank" rel="noopener noreferrer">
            Jayesh
          </a>
        </footer>
      </div>
      <style jsx global>{`
        /* Google font for readable retro pixel look */
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

        :root {
          /* 3-5 color limit (exactly 5):
             - Primary: teal green
             - Neutrals: off-white, near-black, mid-gray
             - Accent: gold
          */
          --background: #f7f6f3;
          --foreground: #111111;
          --primary: #00a884;
          --primary-dark: #007a66;
          --accent: #f4d03f;
          --muted: #6b7280;
          --border-color: #111111;
          --error: #d32f2f;
          --success: #2e7d32;
          --font-family: 'VT323', 'Courier New', Courier, monospace;
        }

        /* Subtle grid paper background for retro feel */
        html,
        body {
          height: 100%;
        }
        body {
          background-color: var(--background);
          background-image: repeating-linear-gradient(
              0deg,
              rgba(17, 17, 17, 0.06) 0,
              rgba(17, 17, 17, 0.06) 1px,
              transparent 1px,
              transparent 24px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(17, 17, 17, 0.06) 0,
              rgba(17, 17, 17, 0.06) 1px,
              transparent 1px,
              transparent 24px
            );
          color: var(--foreground);
          font-family: var(--font-family);
          margin: 0;
          padding: 16px;
          image-rendering: pixelated;
        }
        * {
          box-sizing: border-box;
        }

        /* Containers (pixel card) */
        .container {
          max-width: 760px;
          margin: 4vh auto;
          padding: 24px;
          background: #ffffff;
          border: 2px solid var(--border-color);
          box-shadow: 6px 6px 0 var(--border-color);
        }
        .container-center {
          text-align: center;
        }

        /* Typography with subtle pixel shadow */
        h1,
        h2,
        h3 {
          margin: 0 0 16px 0;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        h1 {
          font-size: 40px;
          text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.15);
        }
        h2 {
          font-size: 28px;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 8px;
        }
        h3 {
          font-size: 22px;
        }
        p,
        small,
        li {
          line-height: 1.5;
          font-size: 20px;
        }
        small {
          color: var(--muted);
        }

        /* Form stack */
        .form-stack {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 20px;
        }

        /* Inputs with beveled retro edge */
        input,
        textarea {
          font-family: var(--font-family);
          font-size: 20px;
          padding: 12px 14px;
          border: 2px solid var(--border-color);
          background: #fffdfa;
          color: var(--foreground);
          width: 100%;
          outline: none;
          box-shadow: inset -2px -2px 0 #ffffff, inset 2px 2px 0 rgba(0, 0, 0, 0.1);
        }
        input::placeholder,
        textarea::placeholder {
          color: #9ca3af;
        }
        input:focus,
        textarea:focus {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
          background: #fffef6;
        }
        textarea {
          min-height: 140px;
          resize: vertical;
        }

        /* Pixel buttons with offset shadow */
        .btn {
          font-family: var(--font-family);
          font-size: 20px;
          padding: 12px 16px;
          border: 2px solid var(--border-color);
          background: var(--primary);
          color: #ffffff;
          cursor: pointer;
          text-transform: uppercase;
          font-weight: 700;
          box-shadow: 4px 4px 0 var(--border-color);
          transition: transform 40ms ease, box-shadow 40ms ease, background 120ms ease;
        }
        .btn:hover {
          background: var(--primary-dark);
        }
        .btn:active {
          transform: translate(4px, 4px);
          box-shadow: 0 0 0 var(--border-color);
        }
        .btn:disabled {
          background: #d1d5db;
          color: #6b7280;
          cursor: not-allowed;
          box-shadow: 0 0 0 var(--border-color);
        }

        .btn.btn-secondary {
          background: #fffdfa;
          color: var(--foreground);
          box-shadow: 4px 4px 0 #8c8c8c;
        }
        .btn.btn-secondary:hover {
          background: #fffae6;
        }

        /* Alerts */
        .alert {
          padding: 14px;
          margin-top: 12px;
          border: 2px solid;
          background: #ffffff;
          box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
        }
        .alert-error {
          color: var(--error);
          border-color: var(--error);
          background: #ffe8ea;
        }
        .alert-success {
          color: var(--success);
          border-color: var(--success);
          background: #ebf7ed;
        }

        /* Dashboard bits */
        .link-box {
          background: #f0fff8;
          padding: 16px;
          margin: 20px 0;
          border: 2px solid var(--primary);
          box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.15);
        }
        .link-box-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .inbox-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 18px 0;
        }

        .message-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .message-item {
          border: 2px solid var(--border-color);
          background: #ffffff;
          padding: 14px;
          margin-bottom: 14px;
          box-shadow: 4px 4px 0 var(--border-color);
        }
        .message-item p {
          margin: 0 0 8px 0;
        }
        .message-item small {
          color: var(--muted);
        }

        /* Profile header */
        .profile-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .profile-avatar {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border: 2px solid var(--border-color);
          border-radius: 8px; /* square-ish retro badge */
          box-shadow: 4px 4px 0 var(--border-color);
          margin-bottom: 12px;
        }

        /* Simple utility for a gold accent label if needed */
        .badge {
          display: inline-block;
          background: var(--accent);
          color: #111;
          border: 2px solid var(--border-color);
          padding: 2px 8px;
          box-shadow: 3px 3px 0 var(--border-color);
          margin-left: 8px;
        }

        /* --- Footer --- */
        .site-footer {
          text-align: center;
          padding: 24px 16px;
          margin-top: 2rem;
          font-size: 18px;
          color: var(--muted);
        }

        .site-footer .heart {
          color: var(--error);
        }

        .site-footer a {
          color: var(--primary-dark);
          text-decoration: none;
        }

        .site-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  )
}
