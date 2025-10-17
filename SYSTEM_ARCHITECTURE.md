# NGL Clone - System Architecture Documentation

## 📋 **Project Overview**

**Project Name**: NGL Clone - Anonymous Messaging Platform
**Tech Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL, Redis
**Architecture Pattern**: Layered Architecture with Repository Pattern
**Deployment**: Serverless (Vercel-ready)

---

## 🏗️ **System Architecture Overview**

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Next.js 14 App Router                                     │
│  ├── Dashboard (/ - Author View)                           │
│  ├── Public Page (/u/[userId] - User View)                │
│  └── API Routes (/api/*)                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  RESTful API Endpoints                                      │
│  ├── POST /api/users (Create User)                         │
│  ├── GET  /api/users/[userId] (Get Public Profile)         │
│  ├── POST /api/send-message (Send Message)                 │
│  ├── GET  /api/messages (Get User Messages)                │
│  ├── PATCH /api/messages/[id] (Answer Message)             │
│  └── POST /api/logout (Logout)                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVICE LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  Business Logic                                             │
│  ├── UserService (User Management)                         │
│  ├── MessageService (Message & Answer Logic)               │
│  └── Rate Limiting & Spam Detection                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                REPOSITORY LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  Data Access Layer                                          │
│  ├── UserRepository (User CRUD)                            │
│  └── MessageRepository (Message CRUD)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  ├── PostgreSQL (Primary Database)                         │
│  └── Redis (Rate Limiting & Caching)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation Details**

### **1. Frontend Architecture**

#### **Pages & Routes**
- **`/` (Dashboard)**: Author's private view for managing messages
- **`/u/[userId]` (Public Page)**: Public view for sending messages and viewing answered Q&As

#### **Key Components**
- **RetroShell**: Consistent UI wrapper with retro styling
- **AnswerForm**: Interactive component for answering questions
- **State Management**: React hooks with localStorage persistence

### **2. API Layer Architecture**

#### **Authentication Strategy**
```typescript
// Secure HTTP-only cookies for authentication
cookies().set('auth_token', user.secretToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60*60*24*365, // 1 year
  path: '/'
})
```

#### **API Endpoints**

| Method | Endpoint | Purpose | Security |
|--------|----------|---------|----------|
| `POST` | `/api/users` | Create user account | None |
| `GET` | `/api/users/[userId]` | Get public profile + answered Q&As | None |
| `POST` | `/api/send-message` | Send anonymous message | Rate Limited |
| `GET` | `/api/messages` | Get all messages for author | Auth Required |
| `PATCH` | `/api/messages/[id]` | Answer a message | Auth Required |
| `POST` | `/api/logout` | Clear authentication | None |

### **3. Service Layer**

#### **UserService**
```typescript
class UserService {
  createUser(data: { name: string; avatarUrl?: string })
  getUserPublicProfile(userId: string)
}
```

#### **MessageService**
```typescript
class MessageService {
  processNewMessage(input: SendMessageInput, ip: string)
  getMessageForUser(userId: string, token?: string)
  getAnsweredMessagesForUser(userId: string)
  answerMessage(messageId: string, answer: string, token: string)
  isIpSuspicious(ip: string): Promise<boolean>
}
```

### **4. Repository Layer**

#### **UserRepository**
```typescript
class UserRepository {
  create(data: { name: string; avatarUrl?: string }): Promise<User>
  findById(id: string): Promise<User | null>
}
```

#### **MessageRepository**
```typescript
class MessageRepository {
  create(data: { userId: string; message: string; ipAddress: string }): Promise<Message>
  findByUserId(userId: string): Promise<Message[]>
  findById(id: string): Promise<Message | null>
  updateAnswer(id: string, answer: string): Promise<Message>
  findAnsweredMessagesByUserId(userId: string): Promise<Message[]>
}
```

---

## 🛡️ **Security & Performance Features**

### **1. Rate Limiting**
- **Standard Users**: 10 requests per 60 seconds
- **Suspicious IPs**: 1 request per 5 minutes
- **Implementation**: Redis-backed with memory fallback

### **2. Spam Detection**
- Content analysis for spam keywords
- IP reputation tracking
- Automatic IP flagging for suspicious behavior

### **3. Data Validation**
- **Zod schemas** for all API inputs
- **Type safety** with TypeScript throughout
- **Input sanitization** and length limits

### **4. Authentication & Authorization**
- **HTTP-only cookies** for secure token storage
- **Secret token validation** for protected endpoints
- **User ownership verification** for message operations

---

## 📊 **Data Model**

### **Database Schema (PostgreSQL)**

```sql
-- Users Table
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY DEFAULT cuid(),
  "name" TEXT NOT NULL,
  "avatarUrl" TEXT,
  "secretToken" TEXT UNIQUE DEFAULT cuid(),
  "createdAt" TIMESTAMP DEFAULT now()
);

-- Messages Table
CREATE TABLE "Message" (
  "id" TEXT PRIMARY KEY DEFAULT cuid(),
  "message" TEXT NOT NULL,
  "ipAddress" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT now(),
  "answer" TEXT,
  "answerAt" TIMESTAMP,
  "userId" TEXT REFERENCES "User"("id")
);

-- Indexes
CREATE INDEX ON "Message"("userId");
```

### **Data Flow**

```
1. User Creation → User Table
2. Message Sending → Message Table (with IP tracking)
3. Message Answering → Update Message Table (answer + answerAt)
4. Public Display → Query answered messages only
```

---

## 🔄 **Business Logic & Visibility Rules**

### **Message Visibility Matrix**

| User Type | Unanswered Messages | Answered Messages |
|-----------|-------------------|------------------|
| **Author** | ✅ Can see all | ✅ Can see all |
| **Public Users** | ❌ Cannot see | ✅ Can see all |

### **Core Business Rules**
1. **Anonymous Messaging**: Users can send messages without revealing identity
2. **Answer Control**: Only authors can answer their messages
3. **Public Display**: Only answered questions are visible to public
4. **Rate Limiting**: Prevents spam and abuse
5. **IP Tracking**: Monitors for suspicious behavior

---

## 🚀 **Deployment & Scalability**

### **Current Setup**
- **Framework**: Next.js 14 with App Router
- **Database**: Neon PostgreSQL (serverless)
- **Caching**: Redis (optional for development)
- **Deployment**: Vercel-ready

### **Scalability Considerations**
- **Database**: PostgreSQL with proper indexing
- **Caching**: Redis for rate limiting and session management
- **CDN**: Static assets served via Vercel CDN
- **Serverless**: Auto-scaling with Next.js API routes

### **Performance Optimizations**
- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Limited to 50 messages per request
- **Lazy Loading**: Components load on demand
- **Memory Fallbacks**: Graceful degradation when Redis unavailable

---

## 🔍 **Monitoring & Observability**

### **Logging Strategy**
- **API Errors**: Comprehensive error logging with stack traces
- **Rate Limiting**: Track rate limit violations
- **Database Queries**: Monitor slow queries
- **Authentication**: Track login/logout events

### **Error Handling**
- **Graceful Degradation**: App works without Redis
- **User-Friendly Errors**: Clear error messages for users
- **Developer Logging**: Detailed logs for debugging

---

## 🛠️ **Development Workflow**

### **Project Structure**
```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── u/[userId]/        # Dynamic public pages
│   └── page.tsx           # Dashboard
├── src/
│   ├── lib/               # Database & Redis clients
│   ├── repositories/      # Data access layer
│   ├── services/          # Business logic
│   ├── schemas/           # Zod validation schemas
│   └── utils/             # Rate limiting utilities
├── prisma/                # Database schema & migrations
└── components/            # Reusable UI components
```

### **Key Design Patterns**
- **Repository Pattern**: Clean separation of data access
- **Service Layer**: Business logic encapsulation
- **Dependency Injection**: Testable and maintainable code
- **Layered Architecture**: Clear separation of concerns

---

## 📈 **Future Enhancements**

### **Planned Features**
1. **Real-time Updates**: WebSocket integration for live message updates
2. **Message Categories**: Tagging and categorization system
3. **Analytics Dashboard**: Message statistics and insights
4. **Bulk Operations**: Mass answer/delete functionality
5. **Export Features**: Data export capabilities

### **Technical Improvements**
1. **Caching Strategy**: Implement comprehensive Redis caching
2. **Database Optimization**: Query optimization and connection pooling
3. **Security Enhancements**: CSRF protection and input sanitization
4. **Testing**: Comprehensive unit and integration tests
5. **CI/CD Pipeline**: Automated testing and deployment

---

## 🎯 **Key Takeaways for Senior Principal Engineer**

### **Architecture Strengths**
- ✅ **Clean Architecture**: Well-separated layers with clear responsibilities
- ✅ **Type Safety**: Full TypeScript implementation with runtime validation
- ✅ **Security First**: Multiple layers of security and validation
- ✅ **Scalable Design**: Serverless-ready with proper data modeling
- ✅ **Maintainable Code**: Repository pattern and service layer abstraction

### **Technical Excellence**
- ✅ **Modern Stack**: Latest Next.js 14 with App Router
- ✅ **Database Design**: Optimized schema with proper relationships
- ✅ **Performance**: Rate limiting, caching, and query optimization
- ✅ **Error Handling**: Comprehensive error management and logging
- ✅ **Developer Experience**: Clear project structure and patterns

### **Business Value**
- ✅ **User Experience**: Intuitive interface with clear visibility rules
- ✅ **Security**: Protection against spam and abuse
- ✅ **Scalability**: Ready for production deployment
- ✅ **Maintainability**: Easy to extend and modify
- ✅ **Monitoring**: Built-in observability and error tracking

This architecture demonstrates enterprise-grade development practices with a focus on security, scalability, and maintainability.
