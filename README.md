# AssemblyTrack - Enterprise Production Tracking System

A full-stack production tracking system built with React, Spring Boot, and MySQL.

## Features

- **Employee Module**: Start/stop production runs, track active productions
- **Admin Module**: Dashboard with metrics, analytics charts, production records
- **Real-time Tracking**: Live duration updates for active productions
- **Authentication**: JWT-based secure login for employees and admins
- **Data Visualization**: Charts for production analytics using Chart.js

## Tech Stack

- **Frontend**: React.js with React Router
- **Backend**: Spring Boot with Spring Security and JWT
- **Database**: MySQL
- **Charts**: Chart.js with react-chartjs-2

## Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Setup Instructions

### 1. Database Setup

1. Install MySQL and create a database named `assemblytrack`
2. Update database credentials in `Backend/src/main/resources/application.properties`

### 2. Backend Setup

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Build the project:
   ```bash
   mvn clean install
   ```

3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:3000`

## Default Users

For testing purposes, you can register users via the `/api/auth/register` endpoint or use the sample data in `import.sql`.

Example login credentials:
- Employee: employeeId: `EMP001`, password: `password`
- Admin: employeeId: `ADMIN001`, password: `password`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (for testing)

### Production (Employee)
- `GET /api/productions/active` - Get active productions
- `POST /api/productions/start` - Start new production
- `POST /api/productions/stop/{id}` - Stop production

### Dashboard (Admin)
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/productions/history` - Get production history
- `GET /api/export/csv` - Export data as CSV

## Project Structure

```
Product Tracking System/
├── Backend/
│   ├── src/main/java/com/assemblytrack/
│   │   ├── config/          # Security and configuration
│   │   ├── controller/      # REST controllers
│   │   ├── entity/          # JPA entities
│   │   ├── repository/      # Data repositories
│   │   ├── service/         # Business logic
│   │   └── dto/            # Data transfer objects
│   └── src/main/resources/  # Application properties
├── Frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # App entry point
│   └── public/             # Static assets
└── MiddleWare/             # Optional API gateway
```

## Future Enhancements

- WebSocket integration for real-time updates
- Mobile app with React Native
- Multi-tenant support
- AI-based delay prediction
- Integration with ERP systems

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.