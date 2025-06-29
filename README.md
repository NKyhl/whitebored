# whitebored

> A minimalist collaborative whiteboarding tool built with Go (Gin), WebSockets, and React.

**whitebored** lets multiple users draw on a shared canvas in real time. Each canvas is discarded when all users disconnect. No accounts or history - just drop in and draw.

## Project Structure
```
whitebored/
├── backend/        # Go server (Gin + WebSocket hub)
│ ├── cmd/
│ │ └── server/
│ │   └── main.go   # Entry point
│ ├── internal/
│ │ └── hub/        # Canvas hub
│ │ └── handlers/   # API handlers
│ ├── go.mod
│ └── go.sum
│
├── frontend/       # React frontend
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Home.js
│ │ │ └── Whiteboard.js
│ │ ├── App.js
│ │ └── index.js
│ └── package.json
└── README.md
```

## Getting Started

### Backend (Go & Gin)
```bash
cd backend
go run main.go
```
The WebSocket server runs at ws://localhost:8080/ws/:canvasID

### Frontend (React)
```bash
cd frontend
yarn install
yarn start
```
React runs on localhost:3000

## Planned Improvements
- User interface for creating and joining rooms ✅
- Toolbar for selecting pen style ✅
- Mobile responsiveness
- Undo/redo
- Display other users
- Add persistent canvas storage
- Infinite canvas
- Display real-time cursors