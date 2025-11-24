# Padel Club Management System API - Setup Guide

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** 6+ ([Download](https://www.mongodb.com/try/download/community))

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Update the values in `.env`:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/padel-club
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# If MongoDB is installed as a service
net start MongoDB

# Or run manually
mongod --dbpath="C:\data\db"
```

**macOS/Linux:**
```bash
# If using homebrew
brew services start mongodb-community

# Or run manually
mongod --dbpath=/usr/local/var/mongodb
```

### 4. Seed the Database

Run the seeder script to populate the database with demo data:

```bash
npm run seed
```

This creates:
- ✅ 1 Demo club (Elite Padel Club in Madrid)
- ✅ 6 Courts
- ✅ 3 Coaches
- ✅ 5 Customers
- ✅ 4 Booking Categories
- ✅ Sample bookings for today
- ✅ Payment records

**Default Admin Credentials:**
- Email: `admin@padelclub.com`
- Password: `Admin@123`

### 5. Start the Development Server

```bash
npm run start:dev
```

The API will be available at: `http://localhost:3000`

## Testing the API

### Login to Get JWT Token

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@padelclub.com",
    "password": "Admin@123"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@padelclub.com",
    "fullName": "System Admin",
    "roles": ["ADMIN"]
  }
}
```

### Get Today's Schedule

```bash
curl -X GET "http://localhost:3000/clubs/{clubId}/schedule/day?date=2024-11-22" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create a New Booking

```bash
curl -X POST http://localhost:3000/clubs/{clubId}/bookings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courtId": "...",
    "bookingName": "John Doe - Match",
    "phone": "+34600111222",
    "bookingType": "SINGLE",
    "startDateTime": "2024-11-22T18:00:00Z",
    "endDateTime": "2024-11-22T19:30:00Z",
    "price": 45
  }'
```

## Available Scripts

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build for production
npm run start:prod         # Run production build

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage

# Database
npm run seed               # Seed database with demo data

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

## Project Structure

```
src/
├── common/                 # Shared utilities
│   ├── decorators/         # Custom decorators
│   ├── enums/              # Enums
│   └── guards/             # Guards (roles, auth)
├── config/                 # Configuration files
├── database/               # Database utilities
│   └── seeder.ts           # Database seeder
├── modules/                # Feature modules
│   ├── auth/               # Authentication
│   ├── booking-categories/ # Booking categories
│   ├── bookings/           # Bookings management
│   ├── clubs/              # Clubs management
│   ├── coaches/            # Coaches management
│   ├── courts/             # Courts management
│   ├── customers/          # Customers management
│   ├── payments/           # Payment tracking
│   ├── schedules/          # Schedule views
│   └── users/              # User management
├── app.module.ts           # Root module
└── main.ts                 # Application entry point
```

## API Endpoints Summary

### Authentication
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Clubs
- `GET /clubs` - List all clubs
- `POST /clubs` - Create club
- `GET /clubs/:id` - Get club
- `PATCH /clubs/:id` - Update club

### Courts
- `GET /clubs/:clubId/courts` - List courts
- `POST /clubs/:clubId/courts` - Create court
- `PATCH /courts/:id` - Update court

### Customers
- `GET /clubs/:clubId/customers?search=` - Search customers
- `POST /clubs/:clubId/customers` - Create customer
- `PATCH /customers/:id` - Update customer

### Bookings
- `POST /clubs/:clubId/bookings` - Create booking
- `GET /clubs/:clubId/bookings` - List bookings
- `GET /clubs/:clubId/bookings/:id` - Get booking
- `PATCH /clubs/:clubId/bookings/:id` - Update booking
- `DELETE /clubs/:clubId/bookings/:id` - Cancel booking
- `POST /clubs/:clubId/bookings/:id/cancel-occurrence` - Cancel one occurrence
- `POST /clubs/:clubId/bookings/cancel-series/:seriesId` - Cancel series

### Schedule
- `GET /clubs/:clubId/schedule/day?date=YYYY-MM-DD` - Day schedule
- `GET /clubs/:clubId/schedule/week?from=YYYY-MM-DD&to=YYYY-MM-DD` - Week schedule

### Payments
- `POST /clubs/:clubId/payments` - Record payment
- `GET /clubs/:clubId/payments` - List payments
- `GET /bookings/:bookingId/payments` - Get booking payments

## Business Rules

### Booking Validation
- ✅ No overlapping bookings on the same court
- ✅ No overlapping bookings for the same coach
- ✅ Courts must be active
- ✅ Coach bookings require a coachId
- ✅ Recurring bookings generate individual instances

### Payment Tracking
- ✅ Automatic payment status calculation (NOT_PAID, PARTIALLY_PAID, PAID)
- ✅ Multiple payments per booking supported
- ✅ Payment status updates booking automatically

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check the `MONGODB_URI` in your `.env` file
- Verify MongoDB is accessible on the specified port

### Port Already in Use
- Change the `PORT` in `.env`
- Or kill the process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:3000 | xargs kill -9
  ```

### Authentication Errors
- Ensure you're using the Bearer token format: `Authorization: Bearer YOUR_TOKEN`
- Check token expiration (default: 1 hour)
- Use the refresh token endpoint to get a new access token

## Next Steps

1. **Test the API** - Use Postman, Insomnia, or curl to test endpoints
2. **Customize** - Modify schemas, add validation, extend features
3. **Deploy** - Set up for production with proper environment variables
4. **Frontend** - Build a React/Vue/Angular frontend to consume the API

## Support

For issues or questions, refer to:
- NestJS Documentation: https://docs.nestjs.com/
- Mongoose Documentation: https://mongoosejs.com/docs/
- MongoDB Documentation: https://www.mongodb.com/docs/

---

Built with ❤️ using NestJS, TypeScript, and MongoDB
