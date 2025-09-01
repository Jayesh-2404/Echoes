# 🎮 Anonymous Messaging App

A full-stack anonymous messaging application built with the Next.js App Router. Inspired by platforms like NGL, this project features a unique retro-pixelated UI, robust security measures including rate limiting and spam detection, and a clean, scalable architecture.

| ![Homepage](public/front.png) | ![Dashboard](public/dash.png) | ![Sender](public/sender.png) |

## ✨ Key Features

- **👤 User Profiles**: Create a public profile with a name and an optional avatar
- **🔗 Shareable Links**: Instantly generate a unique, shareable link (`/u/[userId]`)
- **📝 Anonymous Messaging**: Receive anonymous messages from anyone who has your link
- **⚡ Real-time(ish) Inbox**: The user dashboard polls every 5 seconds to display new messages
- **🔐 Secure Authentication**: Uses secure, httpOnly cookies for managing user sessions, preventing XSS attacks
- **🛡️ Advanced Rate Limiting**: Implements a dual-strategy rate limiter using Redis:
  - A standard limit for all users
  - A much stricter limit for IPs flagged as suspicious
- **🚫 Spam Detection**: Includes basic content analysis to identify spammy messages and penalize the sender's IP
- **🎨 Retro UI**: A fun and nostalgic pixel-art inspired user interface

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **In-Memory Store**: Redis (for rate limiting and managing suspicious IPs)
- **Validation**: Zod
- **Styling**: CSS-in-JS (styled-jsx) & Global CSS


## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **npm** or **yarn**
- A running **PostgreSQL** database instance
- A running **Redis** instance

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root of the project and add your database and Redis connection URLs:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   REDIS_URL="redis://HOST:PORT"
   ```

4. **Run database migrations:**

   This will sync the Prisma schema with your PostgreSQL database.
   ```bash
   npx prisma migrate dev
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## ⚙️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users` | Creates a new user and sets an auth cookie |
| `GET` | `/api/users/[userId]` | Fetches a user's public profile (name, avatar) |
| `POST` | `/api/send-message` | Submits a new anonymous message to a user |
| `GET` | `/api/messages` | **(Protected)** Fetches all messages for the authenticated user |
| `POST` | `/api/logout` | Clears the authentication cookie to log out |

## 🔧 Configuration

### Rate Limiting

The application uses Redis-backed rate limiting with two tiers:

- **Standard users**: Basic rate limits to prevent abuse
- **Suspicious IPs**: Stricter limits for IPs flagged by spam detection

### Spam Detection

Basic content analysis identifies potentially spammy messages based on:

- Message content patterns
- Frequency of similar messages
- IP reputation scoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by NGL and similar anonymous messaging platforms
- Built with modern web technologies for performance and security
- Retro UI design inspired by classic pixel art aesthetics

## 🐛 Issues & Support

If you encounter any issues or have questions, please [open an issue](https://github.com/your-username/your-repo-name/issues) on GitHub.

---

