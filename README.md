# AssemblyTrack_fresh

AssemblyTrack is a secure, scalable manufacturing product tracking platform with:

- **Backend:** Java Spring Boot, MySQL, JWT authentication, role-based access (`ADMIN`, `EMPLOYEE`)
- **Frontend:** React + Axios with a modern dashboard UI
- **Core Features:**
  - Employee/Admin login
  - Master data CRUD (products)
  - Production run tracking
  - Image upload per run
  - Dashboard analytics for product/run counts and statuses

## Project Structure

- `/backend` - Spring Boot REST API
- `/frontend` - React application (Vite)

## Backend Run

```bash
cd /home/runner/work/AssemblyTrack_fresh/AssemblyTrack_fresh/backend
mvn spring-boot:run
```

Environment variables (optional):

- `DB_URL` (default `jdbc:mysql://localhost:3306/assemblytrack`)
- `DB_USERNAME` (default `root`)
- `DB_PASSWORD` (default `root`)
- `JWT_SECRET` (base64-encoded secret)

Default seeded users:

- `admin / Admin@123`
- `employee / Employee@123`

## Frontend Run

```bash
cd /home/runner/work/AssemblyTrack_fresh/AssemblyTrack_fresh/frontend
npm install
npm run dev
```

Optional API URL override:

- `VITE_API_URL` (default `http://localhost:8080`)

## Tests

```bash
cd /home/runner/work/AssemblyTrack_fresh/AssemblyTrack_fresh/backend
mvn test
```
