# 🚀 Quick Reference - Padel Club API

## ⚡ Quick Start Commands

```bash
# Install
npm install

# Seed database
npm run seed

# Start server
npm run start:dev

# Run tests
npm run test
```

## 🔑 Default Login

```json
{
  "email": "admin@padelclub.com",
  "password": "Admin@123"
}
```

## 🎯 Most Common Endpoints

### Login
```bash
POST /auth/login
{
  "email": "admin@padelclub.com",
  "password": "Admin@123"
}
```

### Get Today's Schedule
```bash
GET /clubs/{clubId}/schedule/day?date=2024-11-22
Authorization: Bearer {token}
```

### Create Single Booking
```bash
POST /clubs/{clubId}/bookings
Authorization: Bearer {token}
{
  "courtId": "...",
  "bookingName": "John Doe - Match",
  "phone": "+34600111222",
  "bookingType": "SINGLE",
  "startDateTime": "2024-11-22T18:00:00Z",
  "endDateTime": "2024-11-22T19:30:00Z",
  "price": 45
}
```

### Create Recurring Booking
```bash
POST /clubs/{clubId}/bookings
{
  "courtId": "...",
  "bookingName": "Weekly Training",
  "phone": "+34600111222",
  "bookingType": "FIXED",
  "startDateTime": "2024-11-25T18:00:00Z",
  "durationMinutes": 60,
  "repeatedDayOfWeek": "MONDAY",
  "recurrenceEndDate": "2024-12-23T18:00:00Z",
  "price": 40
}
```

### Search Customers
```bash
GET /clubs/{clubId}/customers?search=juan
Authorization: Bearer {token}
```

### Record Payment
```bash
POST /clubs/{clubId}/payments
{
  "bookingId": "...",
  "amount": 45,
  "method": "CARD",
  "paidAt": "2024-11-22T10:00:00Z"
}
```

## 📦 Project Structure (Simplified)

```
src/
├── modules/
│   ├── auth/           # Login, JWT
│   ├── bookings/       # Core booking logic
│   ├── schedules/      # Calendar views
│   ├── payments/       # Payment tracking
│   ├── clubs/          # Club CRUD
│   ├── courts/         # Court CRUD
│   ├── coaches/        # Coach CRUD
│   ├── customers/      # Customer CRUD
│   └── booking-categories/
├── common/             # Guards, decorators
├── config/             # Environment config
└── database/           # Seeder
```

## 🎭 User Roles

| Role | Permissions |
|------|-------------|
| ADMIN | Everything |
| MANAGER | Club, bookings, staff |
| RECEPTIONIST | Bookings, customers |
| COACH | View own schedule |

## 🔧 Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/padel-club
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

## 📊 Booking Types

| Type | Description | Required Fields |
|------|-------------|-----------------|
| SINGLE | One-time booking | startDateTime, endDateTime |
| FIXED | Weekly recurring | startDateTime, durationMinutes, repeatedDayOfWeek, recurrenceEndDate |
| COACH | With coach | All SINGLE fields + coachId |

## ⚠️ Common Errors

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Not authenticated | Add Bearer token |
| 403 | Insufficient role | Check user role |
| 409 | Booking overlap | Choose different time |
| 404 | Not found | Check ID exists |

## 🎨 Payment Methods

- `CASH`
- `CARD`
- `TRANSFER`
- `WALLET`

## 📅 Payment Status

- `NOT_PAID` - No payments received
- `PARTIALLY_PAID` - Some payments received
- `PAID` - Fully paid

## 🏷️ Default Categories (Seeded)

- Match (#4CAF50)
- Training (#2196F3)
- Tournament (#FF9800)
- Kids Class (#9C27B0)

## 🗓️ Days of Week

`MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`

## 🔥 Key Features

✅ JWT authentication
✅ Role-based access
✅ Overlap detection
✅ Recurring bookings
✅ Payment tracking
✅ Schedule views
✅ Search customers

## 📝 Testing Flow

1. Start MongoDB
2. Run `npm run seed`
3. Start API `npm run start:dev`
4. Login with admin@padelclub.com
5. Copy access token
6. Test endpoints with token

## 🌐 Port & URLs

- **API**: http://localhost:3000
- **MongoDB**: mongodb://localhost:27017

## 📚 Documentation

- `README.md` - Overview
- `SETUP.md` - Detailed setup
- `API_DOCUMENTATION.md` - All endpoints
- `PROJECT_SUMMARY.md` - Architecture

## 🐛 Troubleshooting

**Can't connect to MongoDB?**
```bash
# Start MongoDB
mongod
```

**Port 3000 in use?**
```bash
# Change PORT in .env
PORT=3001
```

**Token expired?**
```bash
# Use refresh token endpoint
POST /auth/refresh
{ "refreshToken": "..." }
```

## 💡 Pro Tips

1. Use Postman/Insomnia for testing
2. Save Bearer token as environment variable
3. Check `schedule/day` for visual feedback
4. Try creating overlapping bookings (should fail)
5. Create recurring booking and check DB
6. Test partial payments

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Seed database
3. ✅ Start server
4. ✅ Login and get token
5. ✅ Test endpoints
6. 🚀 Build frontend!

---

**Need help?** Check the full documentation files!
