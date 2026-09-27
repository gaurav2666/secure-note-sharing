# Secure Note Sharing App

A secure note-sharing application built with Next.js, TypeScript, Tailwind CSS, MongoDB, Mongoose, and Better Auth.

The application allows authenticated users to create notes and generate secure share links with public or password-protected access. Share links can be configured as one-time or time-based links with expiry, revocation, view tracking, and brute-force protection.

---

## 1. Setup Instructions

### Prerequisites

- Node.js 20+
- npm
- MongoDB Atlas account
- Git

### Clone the Repository

```bash
git clone https://github.com/gaurav2666/secure-note-sharing.git
cd secure-note-sharing
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
```

Do not commit `.env.local` to GitHub.

### Run the Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

### Type Check

```bash
npm run typecheck
```

### Production Build

```bash
npm run build
```

---

## 2. Tech Stack Used

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- Next.js Route Handlers
- Node.js

### Database

- MongoDB Atlas
- Mongoose

### Authentication

- Better Auth

### Security

- bcryptjs for password/access-key hashing
- Node.js `crypto` for secure random token/key generation
- MongoDB atomic operations for one-time link consumption and view count updates

---

## 3. Application Requirements

The application supports:

- Creating notes with title and content
- One-time share links
- Time-based share links
- Public share links
- Password-protected share links
- Dynamic access-key generation
- Expiring links
- Force invalidation/revocation
- Successful view count tracking
- Brute-force protection
- Concurrent one-time link protection

---

## 4. Database Schema

The application uses MongoDB with Mongoose.

### Note Collection

```text
Note
├── _id
├── ownerId
├── title
├── content
├── createdAt
└── updatedAt
```

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique note ID |
| `ownerId` | String | ID of the user who owns the note |
| `title` | String | Note title |
| `content` | String | Note content |
| `createdAt` | Date | Note creation time |
| `updatedAt` | Date | Last update time |

### ShareLink Collection

```text
ShareLink
├── _id
├── noteId
├── ownerId
├── token
├── shareType
├── accessType
├── expiresAt
├── passwordHash
├── viewCount
├── failedAttempts
├── lockedUntil
├── usedAt
├── revokedAt
├── createdAt
└── updatedAt
```

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Share-link ID |
| `noteId` | ObjectId | ID of the shared note |
| `ownerId` | String | Owner of the note |
| `token` | String | Secure random share token |
| `shareType` | String | `one-time` or `time-based` |
| `accessType` | String | `public` or `password` |
| `expiresAt` | Date | Share-link expiry time |
| `passwordHash` | String | bcrypt hash of the access key |
| `viewCount` | Number | Number of successful views |
| `failedAttempts` | Number | Number of failed password attempts |
| `lockedUntil` | Date | Temporary lockout time |
| `usedAt` | Date | Time when a one-time link was consumed |
| `revokedAt` | Date | Time when a link was revoked |
| `createdAt` | Date | Creation time |
| `updatedAt` | Date | Last update time |

The `token` field is unique and indexed.

---

## 5. Share Link Flow

After creating a note, the authenticated user can generate a secure share link.

The user selects:

### Share Type

- One-time
- Time-based

### Access Type

- Public
- Password-protected

This results in four possible combinations:

| Share Type | Access Type |
|---|---|
| One-time | Public |
| One-time | Password-protected |
| Time-based | Public |
| Time-based | Password-protected |

### Flow

```text
Authenticated User
        |
        v
   Create Note
        |
        v
 Select Share Type
        |
   +----+----+
   |         |
   v         v
One-time  Time-based
   |         |
   +----+----+
        |
        v
 Select Access Type
        |
   +----+----+
   |         |
   v         v
Public    Password
            |
            v
      Generate Access Key
            |
            v
       Hash Access Key
            |
            v
        Set Expiry
            |
            v
    Generate Secure Token
            |
            v
      Store ShareLink
            |
            v
      Return Share URL
```

The generated share URL is:

```text
/share/[token]
```

Public links can be opened directly.

Password-protected links require the generated access key before the note can be viewed.

---

## 6. Password / Access-Key Generation Logic

The application uses Node.js `crypto` to generate cryptographically secure random values.

### Share Token

A 32-byte random token is generated:

```ts
const token = crypto.randomBytes(32).toString("base64url");
```

The token is used in the share URL.

Example:

```text
/share/secure-random-token
```

The token is stored in MongoDB with a unique index.

### Access Key

For password-protected links, a separate random access key is generated:

```ts
const accessKey = crypto.randomBytes(16).toString("base64url");
```

The generated access key is returned to the note owner when the share link is created.

The plaintext access key is not stored in the database.

### Password Hashing

The access key is hashed using bcrypt:

```ts
const passwordHash = await bcrypt.hash(accessKey, 12);
```

Only the hash is stored in MongoDB.

When the recipient enters the access key, it is verified using:

```ts
bcrypt.compare(accessKey, passwordHash);
```

This prevents the plaintext access key from being stored in the database.

---

## 7. Expiry Logic

Every share link has an `expiresAt` value.

When creating a share link, the server checks that the expiry time is in the future.

```text
Requested Expiry
       |
       v
Is expiry in the future?
       |
   +---+---+
   |       |
  Yes      No
   |       |
   v       v
Create   Reject
 Link    Request
```

When a share link is accessed, the server checks whether:

```text
expiresAt > current time
```

If the expiry time has passed, the link is considered expired and access is rejected.

Expired links do not increase the view count.

The expiry check is also performed when unlocking password-protected links.

---

## 8. Invalidate / Revoke Logic

The owner can forcefully invalidate/revoke a share link.

Instead of deleting the share-link document, the application stores the time at which the link was revoked:

```text
revokedAt = current time
```

Every access request checks that:

```text
revokedAt == null
```

If `revokedAt` is not null, the link is considered revoked and access is rejected.

This allows the application to preserve the share-link record and its metadata while preventing further access.

---

## 9. View Count Logic

The application tracks successful views using the `viewCount` field.

The rules are:

| Situation | View Count |
|---|---:|
| Successful public view | +1 |
| Successful password unlock | +1 |
| Wrong password | No increase |
| Expired link | No increase |
| Revoked link | No increase |
| Already-used one-time link | No increase |

For time-based links, MongoDB's atomic `$inc` operator is used:

```ts
await ShareLink.findOneAndUpdate(
  {
    _id: shareLink._id,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  },
  {
    $inc: { viewCount: 1 },
  }
);
```

For one-time links, the view-count increment happens in the same atomic operation that consumes the link.

---

## 10. Race-Condition Handling

The main race condition occurs with one-time links.

A simple implementation could have this problem:

```text
Request A:
Check if link is unused

Request B:
Check if link is unused

Request A:
Mark link as used

Request B:
Mark link as used
```

Both requests could pass the check before either request updates the database.

To prevent this, the application uses an atomic MongoDB `findOneAndUpdate()` operation.

The operation checks:

```text
usedAt == null
revokedAt == null
expiresAt > current time
```

and simultaneously performs:

```text
usedAt = current time
viewCount = viewCount + 1
```

Example:

```ts
const consumedLink = await ShareLink.findOneAndUpdate(
  {
    _id: shareLink._id,
    usedAt: null,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  },
  {
    $set: {
      usedAt: new Date(),
    },
    $inc: {
      viewCount: 1,
    },
  },
  {
    new: true,
  }
);
```

If the operation returns a document, the request successfully consumed the link.

If it returns `null`, the link was already consumed or is no longer valid.

This ensures that only one simultaneous request can successfully consume a one-time link.

---

## 11. How Do You Prevent Two Users From Using a One-Time Link at the Same Time?

The application uses an atomic conditional MongoDB update.

The database operation only succeeds when:

```text
usedAt == null
```

At the same time, it sets:

```text
usedAt = current time
```

Therefore, when two users attempt to access the same one-time link simultaneously, only one request can successfully change the link from unused to used.

The second request will fail because `usedAt` is no longer `null`.

This prevents concurrent reuse of a one-time link.

---

## 12. How Do You Update View Count Safely?

MongoDB's atomic `$inc` operator is used:

```ts
$inc: { viewCount: 1 }
```

This avoids a read-modify-write race condition.

For example:

```text
Initial viewCount = 10

Request A -> +1
Request B -> +1

Final viewCount = 12
```

Both increments are safely applied by MongoDB.

For one-time links, the view-count increment and link consumption happen in the same atomic database operation.

Wrong passwords, expired links, revoked links, and already-used one-time links do not increase the view count.

---

## 13. How Would This Work If 1 Million People Opened the Link?

The share token is unique and indexed in MongoDB.

Therefore, the application can efficiently find a share link using an indexed token lookup instead of scanning all share links.

```text
Incoming Request
       |
       v
Share Token
       |
       v
Indexed MongoDB Lookup
       |
       v
ShareLink
       |
       v
Validate Link
       |
       v
Return Note
```

For a production system handling very large traffic, the application could be scaled using:

- Multiple Next.js application instances
- Load balancing
- MongoDB connection pooling
- Proper database indexes
- MongoDB replica sets
- Redis-based distributed rate limiting
- CDN/caching where appropriate
- Monitoring and logging

The one-time-link race-condition protection would continue to work because the state transition is handled atomically by MongoDB.

---

## 14. How Would You Prevent Brute-Force Attempts on Password-Protected Links?

The application tracks failed password attempts using:

```text
failedAttempts
lockedUntil
```

The current implementation allows a maximum of **5 failed attempts**.

After the fifth failed attempt, the share link is temporarily locked for **5 minutes**.

During the lockout period, further attempts receive:

```text
HTTP 429 Too Many Requests
```

After a successful authentication:

```text
failedAttempts = 0
lockedUntil = null
```

Failed password attempts do not increase `viewCount`.

For a production-scale implementation, this protection could be strengthened with distributed rate limiting using Redis and IP-based rate limiting.
