# Padel Club Management System - Backend API

Production-ready REST API for Padel Club Management built with NestJS, MongoDB, and TypeScript.

## Features

- 🏢 **Multi-club Management** - Support for multiple clubs with location-based services
- 🎾 **Court Management** - Manage courts, surfaces, and pricing
- 📅 **Advanced Booking System**
  - Single bookings
  - Recurring (FIXED) bookings with weekly schedules
  - Coach bookings with trainer assignments
  - Drag-and-drop support with overlap detection
  - Overnight booking support
- 👥 **Customer Management** - Customer profiles and booking history
- 🎓 **Coach Management** - Coach profiles, specializations, and availability
- 💰 **Payment Tracking** - Multiple payment methods and status tracking
- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 📊 **Schedule Views** - Day and week views with real-time availability

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with JWT strategy
- **Validation**: class-validator & class-transformer
- **Date Handling**: date-fns
- **API Documentation**: RESTful API design

## Prerequisites

- Node.js 18+ or Docker
- MongoDB 7.0+ (or use Docker Compose)
- npm or yarn

## Installation

### Option 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/abhsmartit/paddle-back.git
cd paddle-back
```

2. Start with Docker Compose:
```bash
docker-compose up -d
```

3. Run database seeder:
```bash
docker-compose exec api npm run seed
```

The API will be available at `http://localhost:3000`

### Option 2: Local Development

1. Clone the repository:
```bash
git clone https://github.com/abhsmartit/paddle-back.git
cd paddle-back
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/padel-club
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

4. Start MongoDB (if not using Docker)

5. Run database seeder:
```bash
npm run seed
```

6. Start the development server:
```bash
npm run start:dev
```

## Database Seeder

The seeder creates sample data including:
- 1 Admin user (admin@padelclub.com / Admin@123)
- 1 Club (Padel Club Riyadh)
- 6 Courts
- 2 Booking categories (Regular/Green, Coach/Blue)
- 1 Coach (Carlos Rodriguez)
- 25 Customers
- 39 Bookings (SINGLE, FIXED, and COACH types)
- 39 Payment records

```bash
npm run seed
```

## API Endpoints

### Authentication
- `POST /auth/login` - Admin/staff login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `POST /auth/customer/login` - Customer OTP login
- `POST /auth/customer/verify` - Verify OTP
- `POST /auth/customer/resend-otp` - Resend OTP

### Clubs
- `GET /clubs` - List all clubs
- `POST /clubs` - Create club
- `GET /clubs/:id` - Get club details
- `PATCH /clubs/:id` - Update club
- `DELETE /clubs/:id` - Delete club

### Courts
- `GET /clubs/:clubId/courts` - List courts
- `POST /clubs/:clubId/courts` - Create court
- `GET /courts/:id` - Get court details
- `PATCH /courts/:id` - Update court
- `DELETE /courts/:id` - Delete court

### Bookings
- `GET /clubs/:clubId/bookings` - List bookings
- `POST /clubs/:clubId/bookings` - Create booking
- `GET /clubs/:clubId/bookings/:id` - Get booking details
- `PATCH /clubs/:clubId/bookings/:id` - Update booking
- `PUT /clubs/:clubId/bookings/:id/drag-drop` - Drag-and-drop update
- `DELETE /clubs/:clubId/bookings/:id` - Delete booking
- `POST /clubs/:clubId/bookings/:id/cancel-occurrence` - Cancel recurring occurrence
- `POST /clubs/:clubId/bookings/cancel-series/:seriesId` - Cancel recurring series

### Schedules
- `GET /clubs/:clubId/schedule/day` - Get day schedule
- `GET /clubs/:clubId/schedule/week` - Get week schedule

### Customers
- `GET /clubs/:clubId/customers` - List customers
- `POST /clubs/:clubId/customers` - Create customer
- `GET /customers/:id` - Get customer details
- `PATCH /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Coaches
- `GET /clubs/:clubId/coaches` - List coaches
- `POST /clubs/:clubId/coaches` - Create coach
- `GET /coaches/:id` - Get coach details
- `PATCH /coaches/:id` - Update coach
- `DELETE /coaches/:id` - Delete coach

### Payments
- `GET /clubs/:clubId/payments` - List payments
- `POST /clubs/:clubId/payments` - Create payment
- `GET /bookings/:bookingId/payments` - Get booking payments
- `DELETE /payments/:id` - Delete payment

### Booking Categories
- `GET /clubs/:clubId/booking-categories` - List categories
- `POST /clubs/:clubId/booking-categories` - Create category
- `GET /booking-categories/:id` - Get category details
- `PATCH /booking-categories/:id` - Update category
- `DELETE /booking-categories/:id` - Delete category

## Booking Types

### SINGLE Booking
One-time booking for a specific court and time slot.

### FIXED Booking
Recurring weekly booking on a specific day (e.g., every Saturday at 10:00 AM).

### COACH Booking
Booking with assigned coach for training sessions.

## Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Run seeder
docker-compose exec api npm run seed

# Access API container shell
docker-compose exec api sh
```

## Development

```bash
# Development mode with hot reload
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm run test

# Lint
npm run lint

# Format code
npm run format
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | API port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/padel-club` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_REFRESH_SECRET` | JWT refresh secret key | Required |

## Architecture

```
src/
├── common/              # Shared utilities, guards, decorators
│   ├── decorators/     # Custom decorators
│   ├── enums/          # Enums (BookingType, PaymentStatus, etc.)
│   └── guards/         # Auth guards
├── config/             # Configuration modules
├── database/           # Database seeder
└── modules/            # Feature modules
    ├── auth/           # Authentication
    ├── bookings/       # Booking management
    ├── booking-categories/
    ├── clubs/          # Club management
    ├── coaches/        # Coach management
    ├── courts/         # Court management
    ├── customers/      # Customer management
    ├── payments/       # Payment tracking
    ├── schedules/      # Schedule views
    └── users/          # User management
```

## Key Features Implementation

### UUID-based Identifiers
All collections use UUID (v4) for `_id` fields instead of MongoDB ObjectId for better compatibility and scalability.

### Overlap Detection
Advanced overlap detection for booking conflicts:
- Start time overlap
- End time overlap
- Complete containment
- Overnight bookings support

### Date Handling
All date operations use `date-fns` for immutable, consistent date manipulation.

### Role-based Access Control
Three user roles:
- `ADMIN` - Full system access
- `MANAGER` - Club management
- `RECEPTIONIST` - Booking operations

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
