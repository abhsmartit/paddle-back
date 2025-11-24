# ✅ Padel Club Backend - Complete Setup

## 🎉 What's Done

### ✅ Backend API (NestJS + MongoDB)
- **Production-ready NestJS backend** running on `http://localhost:3000`
- **41 REST API endpoints** across 9 modules
- **JWT authentication** with refresh tokens
- **Role-based authorization** (ADMIN, MANAGER, RECEPTIONIST, COACH)
- **MongoDB database** seeded with your real data
- **Comprehensive validation** using class-validator
- **TypeScript strict mode** compliant

### ✅ Database Seeded
- **1 Club:** Padel Club Riyadh
- **6 Courts:** Court 1-6 (240 SAR/hour)
- **2 Categories:** 
  - Regular Booking (Green #22C55E)
  - Coach Session (Blue #3B82F6)
- **25 Customers:** All your real customer names
- **28 Bookings:** Nov 21-27, 2025 (your exact data)
- **28 Payments:** All bookings marked as PAID

### ✅ Admin Credentials
```
Email: admin@padelclub.com
Password: Admin@123
```

---

## 📋 API Modules

| Module | Endpoints | Features |
|--------|-----------|----------|
| **Auth** | 3 | Login, Refresh Token, Logout |
| **Clubs** | 5 | CRUD operations for clubs |
| **Courts** | 5 | Manage courts per club |
| **Coaches** | 5 | Coach profiles & management |
| **Customers** | 5 | Customer database with search |
| **Booking Categories** | 5 | Color-coded categories |
| **Bookings** | 7 | Create, update, cancel bookings + overlap detection |
| **Schedules** | 2 | Day & week calendar views |
| **Payments** | 4 | Payment tracking & history |

**Total: 41 endpoints**

---

## 🚀 Quick Start

### 1. Start the Backend
The backend is already running at `http://localhost:3000`

If you need to restart:
```powershell
npm run start:dev
```

### 2. Test the API

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@padelclub.com","password":"Admin@123"}'
```

#### Get Today's Schedule
```bash
curl -X GET "http://localhost:3000/clubs/{clubId}/schedule/day?date=2025-11-23" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. View Documentation
- **Full API Documentation:** `API_DOCUMENTATION.md`
- **Usage Guide:** `API_USAGE_GUIDE.md`
- **Setup Instructions:** `SETUP.md`
- **Quick Reference:** `QUICK_REFERENCE.md`

---

## 📊 Your Real Data (Already Loaded)

### Bookings Overview
- **Nov 21:** 11 bookings across 5 courts
- **Nov 22:** 5 bookings including overnight session
- **Nov 23:** 3 bookings (Today!)
- **Nov 24:** 3 bookings
- **Nov 25:** 2 bookings
- **Nov 26:** 2 bookings
- **Nov 27:** 2 bookings

### Customers (Sample)
- Aziz Alotaibi
- dani alsumiri
- abdullah alaraj
- Abdulaziz Al Habi
- Faisal Saleh
- ... and 20 more

### Courts
All 6 courts configured:
- Court 1-6
- 240 SAR/hour default rate
- Artificial Grass surface
- Open 8 AM - 3 AM (overnight bookings supported)

---

## 🎯 Next Steps

### Option 1: Test with Postman/Thunder Client
1. Import the API endpoints
2. Login to get JWT token
3. Test all CRUD operations
4. Verify your 28 bookings are loaded

### Option 2: Build Admin Dashboard
Create a React/Next.js application with:
- Calendar view showing bookings
- Create/Edit/Delete bookings
- Manage customers
- Payment tracking
- Court management

### Option 3: Build Customer Application
Create a public booking app with:
- View available time slots
- Book a court
- See confirmation
- Optional customer login

---

## 🔧 Available Commands

```powershell
# Start development server (with hot-reload)
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Reseed database (clear & reload data)
npm run seed

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📁 Project Structure

```
c:\paddle-application\
├── src/
│   ├── modules/
│   │   ├── auth/          # JWT authentication
│   │   ├── users/         # User management
│   │   ├── clubs/         # Club CRUD
│   │   ├── courts/        # Court management
│   │   ├── coaches/       # Coach profiles
│   │   ├── customers/     # Customer database
│   │   ├── booking-categories/  # Categories
│   │   ├── bookings/      # Core booking engine
│   │   ├── schedules/     # Calendar views
│   │   └── payments/      # Payment tracking
│   ├── common/
│   │   ├── guards/        # Auth & role guards
│   │   ├── decorators/    # Custom decorators
│   │   └── enums/         # Shared enums
│   ├── config/            # Configuration files
│   ├── database/          # Seeder script
│   ├── app.module.ts      # Root module
│   └── main.ts            # Bootstrap
├── dist/                  # Compiled output
├── node_modules/          # Dependencies
├── Documentation/
│   ├── API_DOCUMENTATION.md
│   ├── API_USAGE_GUIDE.md
│   ├── SETUP.md
│   ├── QUICK_REFERENCE.md
│   └── PROJECT_SUMMARY.md
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## 🎨 Features Implemented

### ✅ Booking Engine
- **Three booking types:** SINGLE, FIXED (recurring), COACH
- **Overlap detection** for courts and coaches
- **Overnight bookings** supported (23:00 - 03:00)
- **Recurring bookings** with series management
- **Cancel individual occurrence** or entire series

### ✅ Payment System
- Track payments per booking
- Multiple payment methods (CASH, CARD, BANK_TRANSFER)
- Auto-update booking payment status
- Payment history per club and booking

### ✅ Schedule Views
- **Day view:** All bookings for a specific date
- **Week view:** 7-day calendar view
- Optimized queries with populated fields

### ✅ Security
- JWT access tokens (1 hour)
- Refresh tokens (7 days)
- Role-based authorization
- Password hashing with bcrypt
- CORS enabled for frontend integration

---

## 💡 Example Use Cases

### Admin Creates a Booking
1. Login → Get JWT token
2. GET `/clubs/{clubId}/schedule/day?date=2025-11-24`
3. Find available slot
4. POST `/clubs/{clubId}/bookings` with booking details
5. Booking created, payment status = NOT_PAID
6. POST `/clubs/{clubId}/payments` to record payment
7. Booking payment status → PAID

### Customer Views Available Slots
1. GET `/clubs/{clubId}/schedule/day?date=2025-11-24`
2. Parse response to find gaps between bookings
3. Display available time slots per court
4. Customer selects slot
5. POST `/clubs/{clubId}/bookings` (if public endpoint)
6. Booking confirmation sent

---

## 🔐 Authentication Flow

```
1. POST /auth/login
   → Returns accessToken + refreshToken

2. Use accessToken for API calls
   Authorization: Bearer {accessToken}

3. When accessToken expires (1 hour):
   POST /auth/refresh
   Body: { refreshToken }
   → Returns new accessToken

4. Logout:
   POST /auth/logout
   → Clears refreshToken
```

---

## 🌟 What Makes This Production-Ready?

✅ **Validation:** All inputs validated with class-validator
✅ **Error Handling:** Consistent error responses
✅ **Security:** JWT auth, password hashing, role guards
✅ **Database Indexes:** Optimized queries
✅ **TypeScript:** Strict mode, full type safety
✅ **Documentation:** Comprehensive guides
✅ **Seeder:** Easy demo data setup
✅ **Real Data:** Your actual bookings loaded
✅ **Modular:** Clean separation of concerns
✅ **Scalable:** Ready for horizontal scaling

---

## 📞 Support

If you encounter any issues:
1. Check `SETUP.md` for troubleshooting
2. Review `API_DOCUMENTATION.md` for endpoint details
3. Verify MongoDB is running: `mongod --version`
4. Check logs in terminal running `npm run start:dev`

---

## 🎉 You're All Set!

Your Padel Club backend is:
- ✅ Running on http://localhost:3000
- ✅ Connected to MongoDB
- ✅ Loaded with your 28 bookings
- ✅ Ready to use

**Try it now:**
1. Login with admin@padelclub.com
2. Get your clubId from GET /clubs
3. View today's schedule
4. Create a new booking
5. Add a payment
6. See the magic! 🎾✨
