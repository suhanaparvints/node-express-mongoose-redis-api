# CRUD Node, Express, and MongoDB API

A JSON REST API for registering and authenticating users and managing user
records. It uses Node.js, Express, MongoDB, and Mongoose, with bcrypt password
hashing and JWT-based authentication.

## Features

- User registration and login
- Admin login and user administration
- Admin creation only through the seed command
- Request validation with Joi
- Centralized JSON error responses
- MongoDB persistence with Mongoose
- Optional Redis caching for the admin user list
- CORS, Helmet, and Morgan middleware
- Database-aware health check

## Requirements

- Node.js with ES module support
- npm
- A MongoDB instance (local or hosted)
- A Redis instance (optional; configure `REDIS_URL` to enable user-list caching)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file from `.env.example` and configure MongoDB, the database
   name, and a long random `JWT_SECRET`. Set `REDIS_URL` if you want to enable
   Redis caching; if it is omitted or Redis is unavailable, the API uses MongoDB
   without caching. Keep `.env` private and do not commit credentials or secrets.

3. Seed the first admin account. Set `ADMIN_NAME`, `ADMIN_AGE`, `ADMIN_EMAIL`,
   `ADMIN_ADDRESS`, and `ADMIN_PASSWORD` in `.env`. The seed password must be at
   least 12 characters, no more than 72 UTF-8 bytes, and include an uppercase
   letter, lowercase letter, number, and special character.

   ```bash
   npm run seed:admin
   ```

   Seeding is safe to rerun: an existing admin is left unchanged. It will not
   promote a regular user. If the configured email already belongs to a regular
   user, choose a different email. No public API endpoint creates or promotes an
   admin.

4. Start the server:

   ```bash
   npm run dev
   ```

   For a regular start, use `npm start`. The API is available at
   `http://localhost:<PORT>` (default port `3000`).

## API

Request and response bodies use JSON. Protected endpoints require:

```http
Authorization: Bearer <token>
```

| Method   | Path                   | Access           | Description                                               |
| -------- | ---------------------- | ---------------- | --------------------------------------------------------- |
| `GET`    | `/health`              | Public           | Check server and MongoDB readiness.                       |
| `POST`   | `/api/auth/register`   | Public           | Register a regular user.                                  |
| `POST`   | `/api/users/login`     | Public           | Log in as a regular user and receive a JWT.               |
| `POST`   | `/api/admin/login`     | Public           | Log in as a seeded admin and receive a JWT.               |
| `PATCH`  | `/api/users/:id`       | Own user account | Update the authenticated user's name.                     |
| `PUT`    | `/api/users/:id`       | Own user account | Replace the authenticated user's editable profile fields. |
| `GET`    | `/api/admin/users`     | Admin            | List users without password fields.                       |
| `PUT`    | `/api/admin/users/:id` | Admin            | Replace a user's editable profile fields.                 |
| `DELETE` | `/api/admin/users/:id` | Admin            | Delete a user.                                            |

The `:id` parameter is the MongoDB document ID. User update endpoints reject
requests targeting another account. Admins use the `/api/admin/users` endpoints
for user management.

### Health check

```http
GET /health
```

Returns HTTP `200` when MongoDB is connected and HTTP `503` otherwise. Example:

```json
{
  "status": "OK",
  "message": "The server is running",
  "database": "your_database_name",
  "redis": "connected"
}
```

The `redis` health-check field is `disabled` when `REDIS_URL` is not set,
`connected` when Redis is ready, and `unavailable` if the cache cannot be used.
The admin user-list endpoint caches its response for up to 60 seconds. API
registration and user updates/deletions invalidate that cache.

### Register a user

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Jane Doe",
  "age": 30,
  "email": "jane@example.com",
  "address": "123 Main Street",
  "password": "StrongPassword1!"
}
```

Name, age, email, address, and password are required. Passwords must be at
least eight characters, no more than 72 UTF-8 bytes, and include uppercase and
lowercase letters, a number, and a special character. Email addresses are
normalized and unique. A `role` field is rejected; public registration always
creates a regular user.

### Log in

Both login endpoints accept an email and password:

```json
{
  "email": "jane@example.com",
  "password": "StrongPassword1!"
}
```

User tokens expire after one hour; admin tokens expire after one day. Both
tokens contain the MongoDB document ID in the `id` claim and are rejected if
the account is deleted or its role changes.

### Update a user

Update a name:

```http
PATCH /api/users/<user-id>
Authorization: Bearer <user-token>
Content-Type: application/json
```

```json
{
  "name": "Jane Smith"
}
```

`PUT /api/users/<user-id>` and `PUT /api/admin/users/<user-id>` replace the
profile fields `name`, `age`, `email`, and `address`. Password and role changes
are not supported by these endpoints. Passwords and password hashes are never
included in API responses.

### Delete a user

```http
DELETE /api/admin/users/<user-id>
Authorization: Bearer <admin-token>
```

### Errors

Errors use a simple JSON response:

```json
{
  "status": "error",
  "message": "User not found"
}
```

Validation errors return `400`, missing records return `404`, duplicate email
addresses return `409`, and unexpected server errors return a generic `500`
message. Detailed unexpected errors are written to the server log, not returned
to clients.

## Project structure

```text
src/
  config/       MongoDB connection
  controllers/  Authentication and user handlers
  middleware/   Authentication, validation, and global errors
  models/       Mongoose user model
  routes/       Express API routes
  scripts/      Admin seeding command
  validators/   Joi request schemas
  server.js     Application setup and startup
```

## Available scripts

| Command                | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| `npm start`            | Start the API with Node.js.                                |
| `npm run dev`          | Start the API with nodemon.                                |
| `npm run seed:admin`   | Create the initial admin using the configured seed values. |
| `npm run format`       | Format the project with Prettier.                          |
| `npm run format:check` | Check formatting with Prettier.                            |
