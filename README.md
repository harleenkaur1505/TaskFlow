# TaskFlow

A collaborative task management platform with boards, lists, and drag-and-drop cards — inspired by Trello.

## Features

- **Boards** — Create and manage project boards with custom background colors
- **Lists** — Organize work into columns with drag-and-drop reordering
- **Cards** — Full-featured cards with descriptions, labels, due dates, checklists, attachments, and comments
- **Drag & Drop** — Reorder lists and move cards between lists with smooth drag-and-drop
- **Real-Time** — Multi-user real-time updates via Socket.IO
- **Search** — Global search across all cards (Ctrl/Cmd + K)
- **Activity Tracking** — Automatic activity logging for every action
- **Dark Mode** — Toggle between light and dark themes
- **File Attachments** — Upload images, PDFs, and documents to cards
- **Member Management** — Invite users to boards, assign members to cards

## Tech Stack

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express 5
- **Database:** MongoDB with Mongoose 9
- **Auth:** JWT (access + refresh tokens)
- **Real-Time:** Socket.IO
- **File Uploads:** Multer
- **Security:** Helmet, CORS, rate limiting, mongo sanitization, XSS prevention

### Frontend
- **Framework:** React 19
- **Routing:** React Router v7
- **Drag & Drop:** @hello-pangea/dnd
- **HTTP Client:** Axios
- **Styling:** CSS Modules
- **Icons:** Lucide React
- **Dates:** date-fns
- **Markdown:** react-markdown
- **Toasts:** react-hot-toast

## Prerequisites

- **Node.js** 20 or higher
- **MongoDB** 7+ (running locally or a cloud instance)
- **npm** 10+

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/harleenkaur1505/TaskFlow.git
cd TaskFlow
```

2. **Install all dependencies**

```bash
npm run install-all
```

This installs root, server, and client dependencies in one command.

3. **Configure environment variables**

Create `server/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your-random-secret-here
JWT_REFRESH_SECRET=your-different-random-secret-here
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

> **Important:** Use strong, unique values for `JWT_SECRET` and `JWT_REFRESH_SECRET` in production.

4. **Create uploads directory**

```bash
mkdir -p server/uploads
```

5. **Start MongoDB**

```bash
# If using local MongoDB
mongod
```

## Development

Run both client and server concurrently:

```bash
npm run dev
```

- Client runs on `http://localhost:5173`
- Server runs on `http://localhost:5000`

### Individual commands

```bash
npm run server    # Start server only (with nodemon)
npm run client    # Start client only (Vite dev server)
```

## Production Deployment

1. **Build the client**

```bash
npm run build
```

2. **Set environment variables**

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=strong-random-secret
JWT_REFRESH_SECRET=different-strong-random-secret
CLIENT_URL=https://your-domain.com
```

3. **Start the server**

```bash
npm run start
```

The server serves the built client from `client/dist` and handles SPA routing. The app is accessible at `http://localhost:5000` (or your configured port).

## Project Structure

```
TaskFlow/
├── package.json              # Root scripts (dev, build, start)
├── server/
│   ├── server.js             # Entry point — HTTP server + Socket.IO
│   ├── app.js                # Express app — middleware, routes, security
│   ├── config/
│   │   ├── db.js             # MongoDB connection with retry logic
│   │   └── socket.js         # Socket.IO init, auth, room management
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── boardController.js
│   │   ├── listController.js
│   │   ├── cardController.js
│   │   ├── activityController.js
│   │   └── searchController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   ├── boardAccess.js    # Board membership check
│   │   ├── errorHandler.js   # Global error handler
│   │   ├── sanitize.js       # XSS prevention
│   │   ├── upload.js         # Multer file upload config
│   │   └── validate.js       # express-validator runner
│   ├── models/
│   │   ├── User.js
│   │   ├── Board.js
│   │   ├── List.js
│   │   ├── Card.js
│   │   └── Activity.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── boards.js
│   │   ├── lists.js
│   │   ├── cards.js
│   │   ├── activity.js
│   │   └── search.js
│   ├── services/
│   │   └── activityService.js
│   └── utils/
│       ├── ApiError.js
│       └── validators.js
└── client/
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/              # Axios instance + API modules
        ├── components/
        │   ├── board/        # List, Card, AddList, AddCard, BoardHeader
        │   ├── boards/       # BoardCard, CreateBoardModal
        │   ├── card/         # CardModal, LabelPicker, Checklist, etc.
        │   ├── layout/       # Navbar, ProtectedRoute, SearchModal
        │   └── ui/           # Button, Input, Spinner, Skeleton
        ├── context/          # AuthContext, BoardContext, SocketContext
        ├── hooks/            # useAuth, useBoard, useSocket, useTheme
        ├── pages/            # Login, Register, Boards, Board, Profile, NotFound
        └── styles/           # CSS variables, reset, global styles
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/boards` | List user's boards |
| POST | `/api/boards` | Create board |
| GET | `/api/boards/:id` | Get board with lists/cards |
| PUT | `/api/boards/:id` | Update board |
| DELETE | `/api/boards/:id` | Delete board |
| POST | `/api/boards/:id/members` | Add member |
| DELETE | `/api/boards/:id/members/:userId` | Remove member |
| PUT | `/api/boards/:id/star` | Toggle star |
| POST | `/api/boards/:id/lists` | Create list |
| PUT | `/api/boards/:id/lists/:listId` | Update list |
| DELETE | `/api/boards/:id/lists/:listId` | Delete list |
| PUT | `/api/boards/:id/lists/reorder` | Reorder lists |
| POST | `/api/boards/:id/cards` | Create card |
| GET | `/api/boards/:id/cards/:cardId` | Get card |
| PUT | `/api/boards/:id/cards/:cardId` | Update card |
| DELETE | `/api/boards/:id/cards/:cardId` | Delete card |
| PUT | `/api/boards/:id/cards/move` | Move card |
| PUT | `/api/boards/:id/cards/reorder` | Reorder cards |
| GET | `/api/boards/:id/activity` | Board activity feed |
| GET | `/api/search?q=term` | Search cards |

## Security

- **Helmet** — Security headers including CSP
- **CORS** — Locked to configured client origin
- **Rate Limiting** — 100 req/15min globally, 5 req/min on auth endpoints
- **Input Sanitization** — HTML entity escaping on all text inputs
- **NoSQL Injection Prevention** — Custom query parameter sanitization middleware
- **HTTP Parameter Pollution** — Protected via hpp
- **JWT Auth** — Short-lived access tokens (15min) with httpOnly refresh cookies (7 days)
- **File Upload Validation** — MIME type whitelist and 10MB size limit
- **Password Hashing** — bcrypt with salt rounds

## License

ISC
