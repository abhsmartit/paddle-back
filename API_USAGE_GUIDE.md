# Padel Club API - Usage Guide

## Overview
This guide shows how to use the Padel Club API for both **Admin Dashboard** and **Customer Application**.

## Base URL
```
http://localhost:3000
```

## Authentication

All endpoints (except login) require a JWT Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### 1. Admin Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@padelclub.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "674187c2e4b...",
    "email": "admin@padelclub.com",
    "fullName": "System Admin",
    "roles": ["ADMIN", "MANAGER", "RECEPTIONIST"]
  }
}
```

---

## Admin Dashboard Endpoints

### Dashboard Overview
Get club information, courts, and booking statistics.

#### Get Club Details
```http
GET /clubs
```

#### Get All Courts
```http
GET /clubs/{clubId}/courts
```

#### Get Booking Statistics (Day View)
```http
GET /clubs/{clubId}/schedule/day?date=2025-11-23
```

**Response:**
```json
{
  "date": "2025-11-23",
  "courts": [
    {
      "courtId": "674187c2...",
      "courtName": "Court 1",
      "bookings": [
        {
          "_id": "674187c3...",
          "bookingName": "Yousef Fahad",
          "phone": "+966587654321",
          "startDateTime": "2025-11-23T10:00:00.000Z",
          "endDateTime": "2025-11-23T12:00:00.000Z",
          "price": 480,
          "paymentStatus": "PAID",
          "bookingCategory": {
            "name": "Coach Session",
            "colorHex": "#3B82F6"
          }
        }
      ]
    }
  ]
}
```

#### Get Week View
```http
GET /clubs/{clubId}/schedule/week?startDate=2025-11-23
```

### Manage Bookings

#### Create New Booking
```http
POST /clubs/{clubId}/bookings
Content-Type: application/json

{
  "courtId": "674187c2e4b...",
  "customerId": "674187c3...", // Optional
  "bookingName": "Ahmed Ali",
  "phone": "+966501234567",
  "bookingType": "SINGLE",
  "startDateTime": "2025-11-23T14:00:00.000Z",
  "endDateTime": "2025-11-23T15:30:00.000Z",
  "price": 360,
  "bookingCategoryId": "674187c2..." // Optional
}
```

#### Update Booking
```http
PATCH /clubs/{clubId}/bookings/{bookingId}
Content-Type: application/json

{
  "startDateTime": "2025-11-23T15:00:00.000Z",
  "endDateTime": "2025-11-23T16:30:00.000Z",
  "price": 360
}
```

#### Delete/Cancel Booking
```http
DELETE /clubs/{clubId}/bookings/{bookingId}
```

### Manage Customers

#### Get All Customers
```http
GET /clubs/{clubId}/customers?search=Ahmed
```

#### Create Customer
```http
POST /clubs/{clubId}/customers
Content-Type: application/json

{
  "fullName": "Ahmed Khalid",
  "phone": "+966501234567",
  "email": "ahmed.khalid@example.com",
  "notes": "Regular player, prefers evening slots"
}
```

#### Update Customer
```http
PATCH /customers/{customerId}
Content-Type: application/json

{
  "phone": "+966509876543",
  "notes": "VIP customer"
}
```

### Manage Payments

#### Record Payment
```http
POST /clubs/{clubId}/payments
Content-Type: application/json

{
  "bookingId": "674187c3...",
  "amount": 360,
  "method": "CASH",
  "paidAt": "2025-11-23T14:00:00.000Z"
}
```

#### Get Booking Payments
```http
GET /bookings/{bookingId}/payments
```

#### Get All Payments for Club
```http
GET /clubs/{clubId}/payments?startDate=2025-11-01&endDate=2025-11-30
```

### Manage Courts

#### Add New Court
```http
POST /clubs/{clubId}/courts
Content-Type: application/json

{
  "name": "Court 7",
  "surfaceType": "Artificial Grass",
  "defaultPricePerHour": 240,
  "isActive": true
}
```

#### Update Court
```http
PATCH /courts/{courtId}
Content-Type: application/json

{
  "isActive": false,
  "defaultPricePerHour": 280
}
```

### Manage Booking Categories

#### Get Categories
```http
GET /clubs/{clubId}/booking-categories
```

#### Create Category
```http
POST /clubs/{clubId}/booking-categories
Content-Type: application/json

{
  "name": "Tournament",
  "colorHex": "#EF4444",
  "isActive": true
}
```

---

## Customer Application Endpoints

### View Available Slots

#### Get Day Schedule (Read-Only)
```http
GET /clubs/{clubId}/schedule/day?date=2025-11-24
```

This returns all bookings for the day. Parse this to show:
- **Available slots** (gaps between bookings)
- **Booked slots** (existing bookings)

#### Example Client-Side Logic:
```typescript
// Parse the response to find available slots
const workingHours = { start: 8, end: 23 }; // 8 AM to 11 PM
const bookedSlots = response.courts.map(court => court.bookings);

// Find gaps between bookings for each court
const availableSlots = findGaps(bookedSlots, workingHours);
```

### Create Booking (Customer Side)

Customers can create bookings if you expose this endpoint publicly or require customer authentication:

```http
POST /clubs/{clubId}/bookings
Content-Type: application/json

{
  "courtId": "674187c2e4b...",
  "bookingName": "Mohammed Saeed",
  "phone": "+966501234567",
  "bookingType": "SINGLE",
  "startDateTime": "2025-11-24T16:00:00.000Z",
  "endDateTime": "2025-11-24T17:30:00.000Z",
  "price": 360
}
```

**Note:** For customer application, you may want to:
1. Create a separate customer authentication endpoint
2. Or allow public booking with phone verification
3. Or integrate with customer login (WhatsApp, SMS OTP)

### Check Booking Availability

Before creating a booking, check if slot is available:

```http
GET /clubs/{clubId}/schedule/day?date=2025-11-24
```

Then verify the desired time slot doesn't overlap with existing bookings.

---

## Real-Time Updates

For live dashboard updates, consider:
1. **Polling**: Fetch `/schedule/day` every 30-60 seconds
2. **WebSockets**: (Not yet implemented) for real-time notifications
3. **Server-Sent Events**: (Not yet implemented)

---

## Example Frontend Integration

### Admin Dashboard - Today's Bookings
```typescript
async function getTodayBookings(clubId: string) {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(
    `http://localhost:3000/clubs/${clubId}/schedule/day?date=${today}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  return response.json();
}
```

### Customer App - Find Available Slots
```typescript
async function getAvailableSlots(clubId: string, date: string) {
  const response = await fetch(
    `http://localhost:3000/clubs/${clubId}/schedule/day?date=${date}`
  );
  const data = await response.json();
  
  // Process to find gaps
  return processAvailableSlots(data);
}
```

### Admin Dashboard - Create Booking
```typescript
async function createBooking(clubId: string, bookingData: any) {
  const response = await fetch(
    `http://localhost:3000/clubs/${clubId}/bookings`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(bookingData)
    }
  );
  return response.json();
}
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Booking overlap or duplicate

**Example Error Response:**
```json
{
  "statusCode": 400,
  "message": [
    "startDateTime must be a valid ISO 8601 date string"
  ],
  "error": "Bad Request"
}
```

**Booking Overlap Error:**
```json
{
  "statusCode": 409,
  "message": "Court is already booked for this time slot",
  "error": "Conflict"
}
```

---

## Current Database State

After running the seeder, you have:

- **Club:** Padel Club Riyadh
- **Courts:** 6 courts (Court 1-6)
- **Categories:** 2 categories (Regular Booking-Green, Coach Session-Blue)
- **Customers:** 25 customers
- **Bookings:** 28 bookings from Nov 21-27, 2025
- **Admin User:** admin@padelclub.com / Admin@123

---

## Next Steps

### For Admin Dashboard:
1. Build a React/Next.js dashboard
2. Show calendar view with bookings
3. Allow creating/editing/canceling bookings
4. Show payment status and history
5. Manage customers and courts

### For Customer Application:
1. Build a public-facing booking page
2. Show available time slots per court
3. Allow booking creation with phone/name
4. Show booking confirmation
5. Optional: Add customer authentication

Would you like me to create these frontend applications?
