## Task Manager Dashboard

Full-stack Task Manager Dashboard built with Node.js, Express, MongoDB, and vanilla HTML/CSS/JS. The app exposes secure REST endpoints behind Basic Auth and ships with a responsive dashboard UI that supports CRUD, filtering, pagination, and color-coded audit logs.

### Tech Stack
- Node.js + Express (REST API)
- MongoDB + Mongoose (data & audit logs)
- HTML, CSS, JavaScript (no frameworks)
- Basic Auth (static credentials)

### Features
- Responsive dashboard layout with sidebar navigation (`Tasks`, `Audit Logs`)
- Task CRUD with modal-based create/edit, delete confirmation, and frontend validation
- Server-side pagination (5 tasks/page) and case-insensitive search filtering
- Audit log stream with action colors (Create = green, Update = yellow, Delete = red)
- Shared validation & sanitization on both client and server
- Centralized error handling + friendly JSON responses

### Project Structure
```
/controllers      Request handlers for tasks and logs
/middleware       Basic auth, validation, and error handling
/models           Mongoose schemas (Task, AuditLog)
/public           Frontend (HTML, CSS, JS)
/routes           Express routers for tasks and audit logs
server.js         Express bootstrap & Mongo connection
```

### Prerequisites
- Node.js 18+
- MongoDB 6+ running locally or accessible via connection string

### Setup & Running
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure MongoDB (defaults to `mongodb://127.0.0.1:27017/task_manager_dashboard`). Either export the vars or create a `.env` file:
   ```bash
   # .env
   MONGODB_URI="your-mongodb-uri"
   PORT=4000
   ```
3. Start the server:
   ```bash
   npm run dev    # nodemon
   # or
   npm start
   ```
4. Visit `http://localhost:4000` to open the dashboard UI.

### Authentication
All `/api/*` endpoints require Basic Auth:
- Username: `admin`
- Password: `password123`

Include the header in every request:
```
Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=
```

### REST API
| Method | Path            | Description                          |
| ------ | --------------- | ------------------------------------ |
| GET    | `/api/tasks`    | Fetch paginated, filtered tasks      |
| POST   | `/api/tasks`    | Create a new task                    |
| PUT    | `/api/tasks/:id`| Update an existing task              |
| DELETE | `/api/tasks/:id`| Delete a task                        |
| GET    | `/api/logs`     | Retrieve audit logs (limit optional) |

Query params: `page` (default 1), `search` (partial match on title/description, case-insensitive).

### Validation Rules
- Title & description required (max 100 / 500 chars)
- Input sanitized to remove HTML tags on both client and server
- Backend returns concise error messages (400/401/500)

### Frontend Usage
- `Tasks` tab: search, paginate, create/edit via modal, delete with confirmation
- `Audit Logs` tab: read-only feed with timestamp, action, task ID, and updated content
- Toast notifications indicate success/errors

### Troubleshooting
- Ensure MongoDB is running and accessible
- Check env `MONGODB_URI` if not using the default local URI
- Inspect server logs for connection issues or validation errors

