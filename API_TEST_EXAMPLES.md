# 🧪 API Testing Examples

Quick reference for testing both Admin and Customer authentication flows.

---

## 🔑 Admin Authentication Flow

### Step 1: Admin Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@padelclub.com",
    "password": "Admin@123"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "674187c2e4b0a7e8f9d12345",
    "email": "admin@padelclub.com",
    "fullName": "System Admin",
    "roles": ["ADMIN", "MANAGER", "RECEPTIONIST"]
  }
}
```

### Step 2: Get Club ID (Save this for later use)
```bash
curl -X GET http://localhost:3000/clubs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 3: Get Today's Schedule
```bash
curl -X GET "http://localhost:3000/clubs/YOUR_CLUB_ID/schedule/day?date=2025-11-23" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 4: Create a Booking
```bash
curl -X POST http://localhost:3000/clubs/YOUR_CLUB_ID/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "courtId": "YOUR_COURT_ID",
    "bookingName": "Test Booking",
    "phone": "+966501234567",
    "bookingType": "SINGLE",
    "startDateTime": "2025-11-24T14:00:00.000Z",
    "endDateTime": "2025-11-24T15:30:00.000Z",
    "price": 360
  }'
```

---

## 📱 Customer Authentication Flow

### Step 1: Request OTP
```bash
curl -X POST http://localhost:3000/auth/customer/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966501234567",
    "bookingName": "Ahmed Ali"
  }'
```

**Expected Response (Development Mode):**
```json
{
  "message": "OTP sent successfully",
  "phone": "+966501234567",
  "expiresIn": 300,
  "devOtp": "123456"
}
```

> **Note:** Copy the `devOtp` value for the next step.

### Step 2: Verify OTP
```bash
curl -X POST "http://localhost:3000/auth/customer/verify?clubId=YOUR_CLUB_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966501234567",
    "otp": "123456"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": "674187c3e4b0a7e8f9d67890",
    "fullName": "Ahmed Ali",
    "phone": "+966501234567",
    "email": "+966501234567@customer.temp"
  }
}
```

### Step 3: Customer Views Available Slots
```bash
curl -X GET "http://localhost:3000/clubs/YOUR_CLUB_ID/schedule/day?date=2025-11-24"
```

**Note:** This endpoint is public (no auth required) so customers can browse available slots.

### Step 4: Customer Creates Booking
```bash
curl -X POST http://localhost:3000/clubs/YOUR_CLUB_ID/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_ACCESS_TOKEN" \
  -d '{
    "courtId": "YOUR_COURT_ID",
    "customerId": "YOUR_CUSTOMER_ID",
    "bookingName": "Ahmed Ali",
    "phone": "+966501234567",
    "bookingType": "SINGLE",
    "startDateTime": "2025-11-24T16:00:00.000Z",
    "endDateTime": "2025-11-24T17:30:00.000Z",
    "price": 360
  }'
```

### Step 5: Resend OTP (if needed)
```bash
curl -X POST http://localhost:3000/auth/customer/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966501234567"
  }'
```

---

## 🧪 Postman/Thunder Client Collection

### Import this JSON into Postman:

```json
{
  "info": {
    "name": "Padel Club API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "adminToken",
      "value": ""
    },
    {
      "key": "customerToken",
      "value": ""
    },
    {
      "key": "clubId",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Admin",
      "item": [
        {
          "name": "Admin Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const response = pm.response.json();",
                  "pm.collectionVariables.set('adminToken', response.accessToken);"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@padelclub.com\",\n  \"password\": \"Admin@123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        },
        {
          "name": "Get Clubs",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const response = pm.response.json();",
                  "if (response.length > 0) {",
                  "  pm.collectionVariables.set('clubId', response[0]._id);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/clubs",
              "host": ["{{baseUrl}}"],
              "path": ["clubs"]
            }
          }
        },
        {
          "name": "Get Today Schedule",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/clubs/{{clubId}}/schedule/day?date=2025-11-23",
              "host": ["{{baseUrl}}"],
              "path": ["clubs", "{{clubId}}", "schedule", "day"],
              "query": [
                {
                  "key": "date",
                  "value": "2025-11-23"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "Customer",
      "item": [
        {
          "name": "Customer Request OTP",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"phone\": \"+966501234567\",\n  \"bookingName\": \"Ahmed Ali\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/customer/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "customer", "login"]
            }
          }
        },
        {
          "name": "Customer Verify OTP",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const response = pm.response.json();",
                  "pm.collectionVariables.set('customerToken', response.accessToken);"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"phone\": \"+966501234567\",\n  \"otp\": \"123456\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/customer/verify?clubId={{clubId}}",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "customer", "verify"],
              "query": [
                {
                  "key": "clubId",
                  "value": "{{clubId}}"
                }
              ]
            }
          }
        },
        {
          "name": "Customer View Schedule",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/clubs/{{clubId}}/schedule/day?date=2025-11-24",
              "host": ["{{baseUrl}}"],
              "path": ["clubs", "{{clubId}}", "schedule", "day"],
              "query": [
                {
                  "key": "date",
                  "value": "2025-11-24"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🎯 Complete Test Flow

### 1. Start the Server
```bash
npm run start:dev
```

### 2. Test Admin Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@padelclub.com","password":"Admin@123"}'
```

Save the `accessToken` from response.

### 3. Get Club Info
```bash
curl -X GET http://localhost:3000/clubs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Save the club `_id` from response.

### 4. Test Customer OTP Flow
```bash
# Step 1: Request OTP
curl -X POST http://localhost:3000/auth/customer/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+966501234567","bookingName":"Ahmed Ali"}'

# Step 2: Copy devOtp from response and verify
curl -X POST "http://localhost:3000/auth/customer/verify?clubId=YOUR_CLUB_ID" \
  -H "Content-Type: application/json" \
  -d '{"phone":"+966501234567","otp":"PASTE_DEV_OTP_HERE"}'
```

---

## 🔍 Check Database

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/padel-club

# View customers
db.customers.find().pretty()

# View bookings
db.bookings.find().pretty()

# View OTP logs in terminal
# OTP will be printed in the server console
```

---

## ✅ Success Indicators

### Admin Login Success:
- Returns `accessToken` and `refreshToken`
- User object has `roles` array
- Token can be used for protected endpoints

### Customer OTP Success:
- Request OTP returns `devOtp` (in development)
- Verify OTP returns `accessToken`
- Customer record created in database
- Customer can create bookings

---

## 🐛 Common Issues

### Issue: "Cannot find module 'CustomersModule'"
**Solution:** Make sure CustomersModule exports CustomersService:
```typescript
// customers.module.ts
@Module({
  exports: [CustomersService], // Add this
})
```

### Issue: "Invalid OTP"
**Solution:** 
- Check if OTP expired (5 minutes)
- Use the exact OTP from `devOtp` field
- Request a new OTP if expired

### Issue: "Booking overlap"
**Solution:**
- Check existing bookings for that time slot
- Choose a different time or court
- Use GET /schedule/day to see available slots

---

## 🕐 Testing Overnight Bookings

The system supports overnight bookings (e.g., 11:30 PM to 3:00 AM) with proper overlap detection.

### Test Case 1: Create Overnight Booking
```bash
curl -X POST http://localhost:3000/clubs/YOUR_CLUB_ID/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "courtId": "YOUR_COURT_ID",
    "customerId": "YOUR_CUSTOMER_ID",
    "categoryId": "YOUR_CATEGORY_ID",
    "bookingName": "Late Night Match",
    "phone": "+966501234567",
    "startDateTime": "2024-11-23T23:30:00Z",
    "endDateTime": "2024-11-24T03:00:00Z",
    "price": 80
  }'
```

### Test Case 2: Verify Overlap Detection
Try creating a conflicting booking:
```bash
# This should FAIL with "Court is already booked"
curl -X POST http://localhost:3000/clubs/YOUR_CLUB_ID/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "courtId": "SAME_COURT_ID",
    "customerId": "YOUR_CUSTOMER_ID",
    "categoryId": "YOUR_CATEGORY_ID",
    "bookingName": "Another Booking",
    "phone": "+966501234567",
    "startDateTime": "2024-11-24T01:00:00Z",
    "endDateTime": "2024-11-24T02:00:00Z",
    "price": 50
  }'
```

**Expected Error:**
```json
{
  "statusCode": 400,
  "message": "Court is already booked during this time. Conflicts: Late Night Match (2024-11-23 23:30 - 2024-11-24 03:00)",
  "error": "Bad Request"
}
```

---

## 🖱️ Testing Drag-and-Drop Updates

Use the drag-drop endpoint to move bookings to different times or courts.

### Test Case 1: Move Booking to Different Time
```bash
curl -X PUT http://localhost:3000/clubs/YOUR_CLUB_ID/bookings/YOUR_BOOKING_ID/drag-drop \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "startDateTime": "2024-11-23T10:00:00Z",
    "endDateTime": "2024-11-23T11:30:00Z"
  }'
```

### Test Case 2: Move to Different Court
```bash
curl -X PUT http://localhost:3000/clubs/YOUR_CLUB_ID/bookings/YOUR_BOOKING_ID/drag-drop \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "startDateTime": "2024-11-23T15:00:00Z",
    "endDateTime": "2024-11-23T16:30:00Z",
    "courtId": "DIFFERENT_COURT_ID"
  }'
```

### Test Case 3: Move with Coach Assignment
```bash
curl -X PUT http://localhost:3000/clubs/YOUR_CLUB_ID/bookings/YOUR_BOOKING_ID/drag-drop \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "startDateTime": "2024-11-23T17:00:00Z",
    "endDateTime": "2024-11-23T18:00:00Z",
    "courtId": "YOUR_COURT_ID",
    "coachId": "YOUR_COACH_ID"
  }'
```

### Test Case 4: Overnight Drag-Drop
```bash
curl -X PUT http://localhost:3000/clubs/YOUR_CLUB_ID/bookings/YOUR_BOOKING_ID/drag-drop \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "startDateTime": "2024-11-23T23:00:00Z",
    "endDateTime": "2024-11-24T02:30:00Z"
  }'
```

**Response:** Returns complete updated booking object with new time/court/coach

**Notes:**
- Duration automatically calculated from start/end times
- Validates both court AND coach availability
- Works with overnight bookings spanning midnight
- Returns detailed error if time slot conflicts exist

---

## 📱 Mobile App Integration

For React Native or Flutter apps, use the same endpoints:

```javascript
// React Native Example
const customerLogin = async () => {
  const response = await fetch('http://YOUR_SERVER_IP:3000/auth/customer/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '+966501234567',
      bookingName: 'Ahmed Ali'
    })
  });
  
  const data = await response.json();
  console.log('Dev OTP:', data.devOtp);
};
```

---

## 🚀 Ready to Test!

1. ✅ Server running on http://localhost:3000
2. ✅ Admin auth: `/auth/login`
3. ✅ Customer OTP: `/auth/customer/login` → `/auth/customer/verify`
4. ✅ Both systems tested and working

Use the examples above to integrate with your frontend applications!
