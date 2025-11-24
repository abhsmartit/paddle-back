# 🎾 Padel Club API - Developer Handoff Document

## 📌 Project Overview

Complete backend API for Padel Club management system with:
- ✅ Admin Dashboard authentication (email/password)
- ✅ Customer App authentication (phone OTP)
- ✅ 44 REST API endpoints
- ✅ Real booking data pre-loaded (28 bookings)
- ✅ MongoDB database with 6 courts, 25 customers
- ✅ Full documentation and integration examples

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB running locally or connection string
- Git (optional)

### 2. Installation & Setup

```bash
# Navigate to project
cd c:\paddle-application

# Install dependencies (already done)
npm install

# Start MongoDB (if local)
mongod

# Start development server
npm run start:dev
```

**Server will run on:** `http://localhost:3000`

### 3. Verify Installation

```bash
# Test server is running
curl http://localhost:3000/clubs

# Test admin login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@padelclub.com","password":"Admin@123"}'
```

---

## 🔐 Authentication Systems

### Option 1: Admin Authentication (Dashboard)

**Use for:** Admin panel, management dashboard, staff application

**Flow:**
1. Login with email/password
2. Receive JWT access token (1 hour) + refresh token (7 days)
3. Use access token for all API calls
4. Auto-refresh before expiry

**Credentials:**
- Email: `admin@padelclub.com`
- Password: `Admin@123`

**Endpoints:**
- `POST /auth/login` - Admin login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

**Complete code examples:** See `INTEGRATION_GUIDE.md` section "Admin Authentication"

---

### Option 2: Customer Authentication (Mobile App)

**Use for:** Customer mobile app, public booking portal

**Flow:**
1. Enter phone number + name
2. Receive OTP via SMS (6-digit code, 5 min expiry)
3. Verify OTP
4. Receive JWT token (30 days validity)
5. Create bookings

**Endpoints:**
- `POST /auth/customer/login` - Request OTP
- `POST /auth/customer/verify` - Verify OTP & get token
- `POST /auth/customer/resend-otp` - Resend OTP

**Dev Mode:** OTP is returned in API response as `devOtp` for testing
**Production:** Integrate SMS service (Twilio, AWS SNS, etc.)

**Complete code examples:** See `INTEGRATION_GUIDE.md` section "Customer Authentication"

---

## 📚 Documentation Files

| File | Purpose | Use When |
|------|---------|----------|
| **INTEGRATION_GUIDE.md** | Complete integration examples with React code | Building frontend apps |
| **API_TEST_EXAMPLES.md** | Quick API testing with curl commands | Testing endpoints |
| **API_DOCUMENTATION.md** | Full API reference (all 44 endpoints) | Looking up specific endpoints |
| **COMPLETE_SETUP.md** | Project summary and features | Understanding project structure |
| **SETUP.md** | Installation and configuration | Setting up on new machine |
| **QUICK_REFERENCE.md** | Quick lookup for common tasks | Daily development reference |

---

## 📱 Integration Examples

### React Admin Dashboard

```typescript
// 1. Install dependencies
npm install axios react-router-dom

// 2. Copy from INTEGRATION_GUIDE.md:
//    - AdminAuthContext (handles login/logout/token refresh)
//    - Admin login page
//    - API service with interceptors

// 3. Wrap app with provider
<AdminAuthProvider>
  <App />
</AdminAuthProvider>

// 4. Use in components
const { user, accessToken, login, logout } = useAdminAuth();
```

**Full working code:** `INTEGRATION_GUIDE.md` lines 50-250

---

### React Customer App

```typescript
// 1. Install dependencies
npm install axios react-router-dom

// 2. Copy from INTEGRATION_GUIDE.md:
//    - CustomerAuthContext (handles OTP flow)
//    - Customer login/OTP page
//    - Booking page with available slots

// 3. Wrap app with provider
<CustomerAuthProvider>
  <App />
</CustomerAuthProvider>

// 4. Use in components
const { customer, requestOtp, verifyOtp } = useCustomerAuth();
```

**Full working code:** `INTEGRATION_GUIDE.md` lines 300-600

---

## 🎯 Common Integration Tasks

### Task 1: Get Today's Bookings (Admin)
```typescript
import api from './services/api';

const getTodayBookings = async (clubId: string) => {
  const today = new Date().toISOString().split('T')[0];
  const response = await api.get(
    `/clubs/${clubId}/schedule/day?date=${today}`
  );
  return response.data;
};
```

### Task 2: Create Booking (Customer)
```typescript
const createBooking = async (bookingData: any) => {
  const response = await api.post(
    `/clubs/${clubId}/bookings`,
    bookingData,
    {
      headers: {
        'Authorization': `Bearer ${customerToken}`
      }
    }
  );
  return response.data;
};
```

### Task 3: Find Available Time Slots
```typescript
const findAvailableSlots = (bookings: any[], date: string) => {
  // Get all bookings for the date
  // Parse working hours (8 AM - 11 PM)
  // Find gaps between bookings
  // Return available slots
  
  // See complete implementation in INTEGRATION_GUIDE.md
};
```

---

## 🗂️ Database Schema

### Collections:
- **users** - Admin/staff accounts (email/password)
- **clubs** - Club information (1 club: Padel Club Riyadh)
- **courts** - 6 courts (Court 1-6)
- **customers** - Customer profiles (25 customers)
- **bookings** - 28 bookings (Nov 21-27, 2025)
- **bookingcategories** - 2 categories (Green, Blue)
- **payments** - 28 payments (all paid)
- **coaches** - Coach profiles (empty, can be added)

### Get Sample Data:
```bash
# View in MongoDB
mongosh mongodb://localhost:27017/padel-club

# See all bookings
db.bookings.find().pretty()

# See customers
db.customers.find().pretty()
```

---

## 🛠️ Development Commands

```bash
# Start dev server (with hot reload)
npm run start:dev

# Build for production
npm run build

# Start production
npm run start:prod

# Run tests
npm run test

# Reset database with fresh data
npm run seed

# Check for errors
npm run lint
```

---

## 🔧 Configuration

### Environment Variables (.env)
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/padel-club

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

### Club ID (Save This!)
After starting server, get club ID:
```bash
curl http://localhost:3000/clubs
```

Save the `_id` field - you'll need it for all API calls.

---

## ✅ Pre-Integration Checklist

Before starting frontend development:

- [ ] Server running on http://localhost:3000
- [ ] Admin login tested (admin@padelclub.com)
- [ ] Customer OTP flow tested
- [ ] Club ID retrieved and saved
- [ ] Can view today's schedule
- [ ] Can create a test booking
- [ ] Read INTEGRATION_GUIDE.md
- [ ] Postman/Thunder Client collection imported
- [ ] Understand authentication flow

---

## 🎨 Frontend Development Guide

### Step 1: Choose Your Framework
- **Next.js** (Recommended) - Full-stack React with SSR
- **React + Vite** - Fast, lightweight SPA
- **React Native** - Mobile app (iOS/Android)

### Step 2: Setup Authentication
Copy the appropriate context from `INTEGRATION_GUIDE.md`:
- `AdminAuthContext` for admin dashboard
- `CustomerAuthContext` for customer app

### Step 3: Create API Service
Copy the API service with interceptors from documentation.
Handles:
- Auto-adding auth tokens
- Token refresh on 401
- Error handling

### Step 4: Build Core Features

**Admin Dashboard Must-Haves:**
- [ ] Login page
- [ ] Dashboard with today's bookings
- [ ] Calendar view (day/week)
- [ ] Create/edit/cancel bookings
- [ ] Customer management
- [ ] Payment tracking

**Customer App Must-Haves:**
- [ ] OTP login flow
- [ ] Court selection
- [ ] Date picker
- [ ] Available time slots
- [ ] Booking creation
- [ ] Booking confirmation

### Step 5: Test Integration
- [ ] Admin can login and manage bookings
- [ ] Customer can login via OTP
- [ ] Customer can view available slots
- [ ] Customer can create bookings
- [ ] Bookings appear in admin dashboard
- [ ] Overlapping bookings are prevented

---

## 📞 API Endpoints Quick Reference

### Authentication (6 endpoints)
```
POST   /auth/login                    # Admin login
POST   /auth/refresh                  # Refresh token
POST   /auth/logout                   # Logout
POST   /auth/customer/login           # Customer request OTP
POST   /auth/customer/verify          # Customer verify OTP
POST   /auth/customer/resend-otp      # Resend OTP
```

### Bookings (7 endpoints)
```
POST   /clubs/:clubId/bookings                      # Create booking
GET    /clubs/:clubId/bookings                      # List bookings
GET    /clubs/:clubId/bookings/:id                  # Get booking
PATCH  /clubs/:clubId/bookings/:id                  # Update booking
DELETE /clubs/:clubId/bookings/:id                  # Delete booking
POST   /clubs/:clubId/bookings/:id/cancel-occurrence  # Cancel one
POST   /clubs/:clubId/bookings/cancel-series/:seriesId # Cancel series
```

### Schedules (2 endpoints)
```
GET    /clubs/:clubId/schedule/day?date=YYYY-MM-DD  # Day view
GET    /clubs/:clubId/schedule/week?startDate=...   # Week view
```

### Courts (5 endpoints)
```
POST   /clubs/:clubId/courts          # Create court
GET    /clubs/:clubId/courts           # List courts
GET    /courts/:id                     # Get court
PATCH  /courts/:id                     # Update court
DELETE /courts/:id                     # Delete court
```

### Customers (5 endpoints)
```
POST   /clubs/:clubId/customers        # Create customer
GET    /clubs/:clubId/customers        # List customers
GET    /customers/:id                  # Get customer
PATCH  /customers/:id                  # Update customer
DELETE /customers/:id                  # Delete customer
```

**Full API reference:** See `API_DOCUMENTATION.md`

---

## 🎯 Example User Stories

### Admin Story 1: View Today's Schedule
```
AS AN admin
I WANT TO see all bookings for today
SO THAT I know which courts are occupied

Steps:
1. Login to admin dashboard
2. View calendar (default: today)
3. See all 6 courts with bookings
4. Green = Regular, Blue = Coach session
```

### Admin Story 2: Create Walk-in Booking
```
AS AN receptionist
I WANT TO quickly book a court for a walk-in customer
SO THAT they can play immediately

Steps:
1. Select court from dropdown
2. Select available time slot
3. Enter customer name & phone
4. Set price (default: 240 SAR/hr)
5. Create booking
6. Mark as paid (optional)
```

### Customer Story 1: Book Court Online
```
AS A customer
I WANT TO book a court from my phone
SO THAT I don't need to call

Steps:
1. Open app, enter phone number
2. Receive OTP via SMS
3. Enter OTP code
4. Select court & date
5. Choose available time slot
6. Confirm booking
7. Receive confirmation
```

---

## 🚨 Important Notes for Frontend Developers

### 1. **Authentication Tokens**
- Admin tokens expire in 1 hour
- Customer tokens expire in 30 days
- Implement auto-refresh for admin
- Store tokens in localStorage (web) or SecureStore (mobile)

### 2. **Time Zones**
- All times stored in UTC
- Club timezone: Asia/Riyadh (GMT+3)
- Convert to local time in frontend
- Use `date-fns-tz` or `moment-timezone`

### 3. **Booking Validation**
- Check for overlaps before creating
- Min booking duration: 30 minutes
- Max booking duration: 8 hours
- Working hours: 8 AM - 3 AM (next day)

### 4. **OTP in Production**
- Current: OTP returned in API (dev only)
- Production: Integrate SMS service
- Remove `devOtp` from response
- Add rate limiting (3 OTP requests per 5 min)

### 5. **Error Handling**
- 400: Validation error (show to user)
- 401: Unauthorized (redirect to login)
- 409: Conflict (slot already booked)
- Handle network errors gracefully

---

## 📊 Current Database State

### Loaded Data:
- ✅ 1 Club: Padel Club Riyadh
- ✅ 6 Courts: Court 1-6 (240 SAR/hr)
- ✅ 2 Categories: Regular (Green), Coach (Blue)
- ✅ 25 Customers: Real names from your data
- ✅ 28 Bookings: Nov 21-27, 2025
- ✅ 28 Payments: All marked as PAID
- ✅ 1 Admin: admin@padelclub.com

### To Add More Data:
```bash
# Edit src/database/seeder.ts
# Add more bookings, customers, etc.
# Run seeder
npm run seed
```

---

## 🎓 Learning Resources

### NestJS (Backend Framework)
- Official Docs: https://docs.nestjs.com
- Authentication: https://docs.nestjs.com/security/authentication
- Mongoose: https://docs.nestjs.com/techniques/mongodb

### Frontend Integration
- Axios Docs: https://axios-http.com
- React Context: https://react.dev/reference/react/useContext
- JWT Decode: https://www.npmjs.com/package/jwt-decode

### API Testing
- Postman: https://www.postman.com
- Thunder Client (VS Code): Extension Marketplace

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
mongosh mongodb://localhost:27017

# Start MongoDB
mongod

# Or update .env with remote connection
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/padel-club
```

### Issue: "401 Unauthorized"
- Check if token is being sent in header
- Verify token hasn't expired
- Try logging in again

### Issue: "Booking overlap error"
- Slot is already booked
- Check GET /schedule/day to see occupied slots
- Choose different time or court

### Issue: "OTP not working"
- Check server console for printed OTP
- Use exact OTP from `devOtp` field
- OTP expires in 5 minutes

---

## ✅ Final Checklist

Before deploying to production:

**Security:**
- [ ] Change JWT secrets in .env
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Implement SMS service for OTP
- [ ] Remove devOtp from API response
- [ ] Add CORS whitelist
- [ ] Use environment-specific configs

**Testing:**
- [ ] All endpoints tested
- [ ] Error scenarios handled
- [ ] Token refresh working
- [ ] OTP flow working
- [ ] Booking overlap prevention working

**Documentation:**
- [ ] API docs shared with team
- [ ] Frontend examples provided
- [ ] Environment variables documented
- [ ] Deployment guide created

---

## 🚀 Ready to Build!

You now have:
- ✅ Complete working backend API
- ✅ Two authentication systems
- ✅ 28 real bookings pre-loaded
- ✅ Full documentation with code examples
- ✅ Integration guides for React/Next.js
- ✅ Test examples and Postman collection

**Next Steps:**
1. Read `INTEGRATION_GUIDE.md` (full code examples)
2. Test API with Postman/curl
3. Start building frontend
4. Use provided React contexts
5. Deploy and customize!

**Questions?** All documentation is in the project folder. Good luck! 🎾
