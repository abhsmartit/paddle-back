# 🎾 Padel Club Management System - Production-Ready Backend API

## 📋 Project Overview

A complete, production-ready NestJS backend API for managing padel club operations including clubs, courts, bookings, coaches, customers, and payments. Built with TypeScript, MongoDB, and comprehensive business logic.

## ✨ Features Implemented

### 🔐 Authentication & Authorization
- ✅ JWT-based authentication with access and refresh tokens
- ✅ Role-based authorization (ADMIN, MANAGER, RECEPTIONIST, COACH)
- ✅ Secure password hashing with bcrypt
- ✅ Passport.js strategies for local and JWT authentication
- ✅ Custom guards and decorators

### 🏢 Multi-Club Management
- ✅ Complete CRUD operations for clubs
- ✅ Location-based data with coordinates
- ✅ Timezone support
- ✅ Configurable opening hours per day of week
- ✅ Full validation with class-validator

### 🎾 Court Management
- ✅ Multiple courts per club
- ✅ Surface type tracking
- ✅ Active/inactive status
- ✅ Default pricing per hour
- ✅ Unique constraint: court name per club

### 👥 Customer Management
- ✅ Customer profiles with contact information
- ✅ Search functionality (name, phone, email)
- ✅ Notes and custom fields
- ✅ Full text search indexes

### 👨‍🏫 Coach Management
- ✅ Coach profiles linked to user accounts
- ✅ Hourly rate configuration
- ✅ Specialties and qualifications
- ✅ Active/inactive status
- ✅ Club-specific coaches

### 📅 Advanced Booking System

#### Booking Types
1. **SINGLE** - One-time bookings
2. **FIXED** - Recurring weekly bookings (generates individual instances)
3. **COACH** - Bookings with assigned coach

#### Business Rules Implementation
- ✅ **Court Overlap Detection**: Prevents double-booking of courts
- ✅ **Coach Overlap Detection**: Prevents coach conflicts
- ✅ **Recurring Bookings**: Automatic generation of weekly occurrences
- ✅ **Series Management**: Cancel single occurrence or entire series
- ✅ **Payment Tracking**: Integrated with payment system
- ✅ **Status Management**: NOT_PAID, PARTIALLY_PAID, PAID

### 📊 Schedule Views
- ✅ **Day View**: All bookings for a specific date grouped by court
- ✅ **Week View**: Bookings for a date range
- ✅ **Calendar-Optimized**: Response format perfect for UI rendering
- ✅ **Populated Data**: Includes court, coach, category info

### 💰 Payment System
- ✅ Multiple payment methods (CASH, CARD, TRANSFER, WALLET)
- ✅ Partial payments support
- ✅ Automatic payment status calculation
- ✅ Payment history per booking
- ✅ Club-wide payment reports

### 📋 Booking Categories
- ✅ Custom categories (Match, Training, Tournament, Kids)
- ✅ Color coding for UI
- ✅ Active/inactive management
- ✅ Per-club configuration

## 🏗️ Architecture

### Project Structure
```
src/
├── common/
│   ├── decorators/          # Custom decorators (CurrentUser, Roles)
│   ├── enums/               # Shared enums (roles, booking types, payment)
│   └── guards/              # Authorization guards
├── config/                  # Configuration modules (app, database, jwt)
├── database/
│   └── seeder.ts           # Database seeder script
├── modules/
│   ├── auth/               # Authentication module
│   ├── users/              # User management
│   ├── clubs/              # Club management
│   ├── courts/             # Court management
│   ├── coaches/            # Coach management
│   ├── customers/          # Customer management
│   ├── booking-categories/ # Category management
│   ├── bookings/           # Booking engine (core business logic)
│   ├── schedules/          # Read-only schedule views
│   └── payments/           # Payment tracking
├── app.module.ts           # Root application module
└── main.ts                 # Application bootstrap
```

### Key Design Patterns
- **Module-based architecture** - Each feature is a separate NestJS module
- **Repository pattern** - Mongoose models abstracted through services
- **DTO pattern** - Request/response validation with class-validator
- **Guard pattern** - Authorization and authentication guards
- **Strategy pattern** - Passport strategies for auth

## 🔒 Security Features

- ✅ JWT access tokens (1 hour expiry)
- ✅ JWT refresh tokens (7 day expiry)
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Role-based access control
- ✅ Request validation with class-validator
- ✅ CORS enabled
- ✅ Environment variable configuration

## 📊 Database Schema

### Collections
1. **users** - System users (admin, staff, coaches)
2. **clubs** - Padel club information
3. **courts** - Courts per club
4. **coaches** - Coach profiles
5. **customers** - Customer profiles
6. **bookingcategories** - Booking categories
7. **bookings** - All booking types with series support
8. **payments** - Payment records

### Indexes
- Compound indexes for performance (clubId + date, courtId + time range)
- Unique constraints (email, court name per club)
- Text search indexes (customer names)
- Geospatial indexes (club locations)

## 🧪 Testing

### Unit Tests Included
- ✅ BookingsService test suite
  - Single booking creation
  - Court overlap detection
  - Coach overlap detection
  - Recurring booking generation
  - Series cancellation
  - Booking updates with validation

### Test Framework
- Jest with TypeScript
- @nestjs/testing utilities
- Mocked Mongoose models
- Coverage reporting

## 📦 API Endpoints

### Authentication (3 endpoints)
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

### Clubs (5 endpoints)
- GET, POST, PATCH, DELETE operations

### Courts (5 endpoints)
- Nested under clubs: `/clubs/:clubId/courts`

### Customers (5 endpoints)
- Search, CRUD operations

### Coaches (5 endpoints)
- Per-club coach management

### Bookings (7 endpoints)
- Create (handles all 3 types)
- List, Get, Update, Delete
- Cancel occurrence, Cancel series

### Schedule (2 endpoints)
- Day view, Week view

### Payments (4 endpoints)
- Create, List by club, List by booking, Delete

### Booking Categories (5 endpoints)
- Full CRUD per club

**Total: 41+ endpoints**

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+
MongoDB 6+
```

### Quick Start
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Seed database
npm run seed

# Start development server
npm run start:dev
```

### Default Credentials
```
Email: admin@padelclub.com
Password: Admin@123
```

## 📝 Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/padel-club
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
```

## 🎯 Core Business Logic

### Booking Validation Rules
1. **No Overlaps**: Time-based validation for court bookings
2. **Coach Availability**: Ensures coaches aren't double-booked
3. **Court Active**: Only active courts can be booked
4. **Required Fields**: Coach bookings require coachId
5. **Time Ranges**: Start must be before end

### Recurring Booking Logic
1. Parse start date and recurrence end date
2. Generate series ID for grouping
3. Calculate all occurrences based on day of week
4. Validate each occurrence for conflicts
5. Bulk insert all instances
6. Support for canceling individual occurrences or entire series

### Payment Status Calculation
- **NOT_PAID**: totalReceived = 0
- **PARTIALLY_PAID**: 0 < totalReceived < price
- **PAID**: totalReceived >= price
- Auto-updates on payment creation/deletion

## 📚 Documentation Files

1. **README.md** - Project overview and quick start
2. **SETUP.md** - Detailed setup instructions
3. **API_DOCUMENTATION.md** - Complete API reference
4. **PROJECT_SUMMARY.md** - This file - comprehensive overview

## 🛠️ Technology Stack

### Core
- **NestJS** ^10.3.0 - Progressive Node.js framework
- **TypeScript** ^5.3.3 - Type-safe JavaScript
- **Mongoose** ^8.0.3 - MongoDB ODM
- **MongoDB** - NoSQL database

### Authentication
- **@nestjs/jwt** - JWT token generation
- **@nestjs/passport** - Authentication middleware
- **passport-jwt** - JWT strategy
- **passport-local** - Local strategy
- **bcrypt** - Password hashing

### Validation
- **class-validator** - DTO validation
- **class-transformer** - Object transformation

### Configuration
- **@nestjs/config** - Environment configuration
- **dotenv** - Environment variables

### Development
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **ts-node** - TypeScript execution

## 🎨 Code Quality

- ✅ TypeScript strict mode
- ✅ ESLint configuration
- ✅ Prettier formatting
- ✅ Consistent naming conventions
- ✅ Comprehensive error handling
- ✅ Input validation on all endpoints
- ✅ Proper HTTP status codes
- ✅ Clear error messages

## 📈 Performance Optimizations

- ✅ Database indexes on frequently queried fields
- ✅ Compound indexes for complex queries
- ✅ Populate only necessary fields
- ✅ Efficient date range queries
- ✅ Batch operations for recurring bookings
- ✅ Connection pooling (Mongoose default)

## 🔄 Data Seeder

Creates demo data:
- 1 club with 6 courts
- 3 coaches with different specialties
- 5 customers
- 4 booking categories
- 7 sample bookings (various types)
- 5 payment records

Perfect for development and testing!

## 🚦 API Status Codes

- **200** OK - Successful GET/PATCH
- **201** Created - Successful POST
- **400** Bad Request - Validation error
- **401** Unauthorized - Authentication required
- **403** Forbidden - Insufficient permissions
- **404** Not Found - Resource doesn't exist
- **409** Conflict - Booking overlap detected

## 🔮 Future Enhancements (Not Implemented)

Potential additions:
- Email notifications
- SMS reminders
- Payment gateway integration
- Multi-currency support
- Discount codes
- Membership tiers
- Statistics dashboard
- Mobile app API optimizations
- Real-time updates with WebSockets
- File uploads (court photos)
- Advanced reporting

## 📊 Database Statistics

After seeding:
- **Collections**: 8
- **Documents**: ~30
- **Indexes**: ~20
- **Size**: < 1 MB

## 🎓 Learning Resources

This project demonstrates:
- NestJS module architecture
- Mongoose schema design
- JWT authentication flow
- Role-based authorization
- Complex business logic (overlap detection)
- Recurring events generation
- Data aggregation (schedule views)
- Payment processing basics
- RESTful API design
- TypeScript best practices

## 💡 Tips for Developers

1. **Start with authentication** - Test login first
2. **Use the seeder** - Provides realistic test data
3. **Read API_DOCUMENTATION.md** - Complete endpoint reference
4. **Check error responses** - 409 for overlaps is expected behavior
5. **Test recurring bookings** - Shows advanced MongoDB operations
6. **Explore schedule views** - Optimized for calendar UIs
7. **Review business logic** - BookingsService has core rules

## 🤝 Contributing

This is a production-ready template. Feel free to:
- Add features
- Improve validation
- Enhance error handling
- Add more tests
- Optimize queries
- Extend documentation

## 📄 License

MIT License - Use freely for personal or commercial projects

---

## 🎉 Summary

This is a **complete, production-ready** Padel Club Management System backend that includes:

✅ Full authentication and authorization
✅ 9 feature modules with 40+ endpoints
✅ Advanced booking engine with overlap detection
✅ Recurring booking support
✅ Payment tracking
✅ Schedule views optimized for calendars
✅ Comprehensive validation
✅ MongoDB with proper indexes
✅ Database seeder with demo data
✅ Unit tests for core business logic
✅ Complete documentation
✅ TypeScript throughout
✅ Clean, maintainable architecture

**Ready to run**: Install dependencies, seed the database, and start the server!

---

**Built with ❤️ using NestJS, TypeScript, and MongoDB**

For questions or support, refer to the documentation files or NestJS official docs.
