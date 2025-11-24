# Padel Club Management System - API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication

All endpoints (except `/auth/login` and `/auth/refresh`) require a JWT Bearer token.

**Header Format:**
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication Endpoints

### POST /auth/login
Login and receive JWT tokens.

**Request Body:**
```json
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
    "id": "673f1234567890abcdef1234",
    "email": "admin@padelclub.com",
    "fullName": "System Admin",
    "roles": ["ADMIN"]
  }
}
```

### POST /auth/refresh
Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/logout
Logout and invalidate refresh token.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Logout successful"
}
```

---

## 🏢 Clubs

### GET /clubs
List all clubs.

**Roles:** All authenticated users

**Response:**
```json
[
  {
    "_id": "673f1234567890abcdef1234",
    "name": "Elite Padel Club",
    "location": {
      "city": "Madrid",
      "country": "Spain",
      "coordinates": [-3.7038, 40.4168]
    },
    "timeZone": "Europe/Madrid",
    "openingHours": [
      {
        "dayOfWeek": "MONDAY",
        "openTime": "08:00",
        "closeTime": "22:00"
      }
    ],
    "createdAt": "2024-11-22T10:00:00.000Z",
    "updatedAt": "2024-11-22T10:00:00.000Z"
  }
]
```

### POST /clubs
Create a new club.

**Roles:** ADMIN, MANAGER

**Request Body:**
```json
{
  "name": "Padel Pro Club",
  "location": {
    "city": "Barcelona",
    "country": "Spain",
    "coordinates": [2.1734, 41.3851]
  },
  "timeZone": "Europe/Madrid",
  "openingHours": [
    {
      "dayOfWeek": "MONDAY",
      "openTime": "09:00",
      "closeTime": "22:00"
    }
  ]
}
```

---

## 🎾 Courts

### GET /clubs/:clubId/courts
List all courts for a club.

**Response:**
```json
[
  {
    "_id": "673f1234567890abcdef1235",
    "clubId": "673f1234567890abcdef1234",
    "name": "Court 1 - Center",
    "surfaceType": "Artificial Grass",
    "isActive": true,
    "defaultPricePerHour": 30,
    "createdAt": "2024-11-22T10:00:00.000Z"
  }
]
```

### POST /clubs/:clubId/courts
Create a new court.

**Roles:** ADMIN, MANAGER

**Request Body:**
```json
{
  "name": "Court 7 - VIP",
  "surfaceType": "Synthetic Turf",
  "isActive": true,
  "defaultPricePerHour": 50
}
```

---

## 👥 Customers

### GET /clubs/:clubId/customers?search=
Search and list customers.

**Query Parameters:**
- `search` (optional): Search term for name, phone, or email

**Response:**
```json
[
  {
    "_id": "673f1234567890abcdef1236",
    "fullName": "Juan Lopez",
    "phone": "+34611222333",
    "email": "juan@example.com",
    "notes": "Regular player",
    "createdAt": "2024-11-22T10:00:00.000Z"
  }
]
```

### POST /clubs/:clubId/customers
Create a new customer.

**Roles:** ADMIN, MANAGER, RECEPTIONIST

**Request Body:**
```json
{
  "fullName": "Maria Gonzalez",
  "phone": "+34611777888",
  "email": "maria@example.com",
  "notes": "Prefers evening slots"
}
```

---

## 📅 Bookings

### POST /clubs/:clubId/bookings
Create a new booking (single, fixed, or coach).

**Roles:** ADMIN, MANAGER, RECEPTIONIST

**Single Booking:**
```json
{
  "courtId": "673f1234567890abcdef1235",
  "customerId": "673f1234567890abcdef1236",
  "bookingName": "Juan Lopez - Match",
  "phone": "+34611222333",
  "bookingType": "SINGLE",
  "startDateTime": "2024-11-22T18:00:00Z",
  "endDateTime": "2024-11-22T19:30:00Z",
  "price": 45,
  "bookingCategoryId": "673f1234567890abcdef1240",
  "notes": "Birthday match"
}
```

**Fixed/Recurring Booking:**
```json
{
  "courtId": "673f1234567890abcdef1235",
  "customerId": "673f1234567890abcdef1236",
  "bookingName": "Weekly Training - Juan",
  "phone": "+34611222333",
  "bookingType": "FIXED",
  "startDateTime": "2024-11-25T18:00:00Z",
  "durationMinutes": 60,
  "repeatedDayOfWeek": "MONDAY",
  "recurrenceEndDate": "2024-12-23T18:00:00Z",
  "price": 40,
  "notes": "4 weeks commitment"
}
```

**Coach Booking:**
```json
{
  "courtId": "673f1234567890abcdef1235",
  "coachId": "673f1234567890abcdef1238",
  "customerId": "673f1234567890abcdef1236",
  "bookingName": "Private Lesson - Carlos",
  "phone": "+34611222333",
  "bookingType": "COACH",
  "startDateTime": "2024-11-22T17:00:00Z",
  "endDateTime": "2024-11-22T18:00:00Z",
  "price": 50,
  "bookingCategoryId": "673f1234567890abcdef1241"
}
```

**Response (Single/Coach):**
```json
{
  "_id": "673f1234567890abcdef1250",
  "clubId": "673f1234567890abcdef1234",
  "courtId": "673f1234567890abcdef1235",
  "bookingName": "Juan Lopez - Match",
  "bookingType": "SINGLE",
  "startDateTime": "2024-11-22T18:00:00Z",
  "endDateTime": "2024-11-22T19:30:00Z",
  "price": 45,
  "paymentStatus": "NOT_PAID"
}
```

**Response (Fixed):** Array of created bookings

### GET /clubs/:clubId/bookings
List all bookings for a club.

**Query Parameters:**
- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)

### PATCH /clubs/:clubId/bookings/:id
Update a booking.

**Request Body:**
```json
{
  "startDateTime": "2024-11-22T19:00:00Z",
  "endDateTime": "2024-11-22T20:30:00Z",
  "price": 50,
  "notes": "Updated time"
}
```

### PUT /clubs/:clubId/bookings/:id/drag-drop
Update booking time and optionally court/coach via drag-and-drop.

**Roles:** ADMIN, MANAGER, RECEPTIONIST

**Request Body:**
```json
{
  "startDateTime": "2024-11-22T23:30:00Z",
  "endDateTime": "2024-11-23T03:00:00Z",
  "courtId": "673f1234567890abcdef1235",
  "coachId": "673f1234567890abcdef1240"
}
```

**Notes:**
- `courtId` and `coachId` are optional
- If omitted, keeps existing court/coach
- Duration automatically calculated from start/end times
- Validates court and coach availability for new time
- Supports overnight bookings (e.g., 23:30 PM to 03:00 AM)

**Response:** Returns updated booking object

### DELETE /clubs/:clubId/bookings/:id
Cancel a booking.

### POST /clubs/:clubId/bookings/:id/cancel-occurrence
Cancel one occurrence of a recurring booking.

### POST /clubs/:clubId/bookings/cancel-series/:seriesId
Cancel entire recurring series.

---

## 📊 Schedule

### GET /clubs/:clubId/schedule/day?date=YYYY-MM-DD
Get day schedule grouped by court.

**Query Parameters:**
- `date` (required): Target date (YYYY-MM-DD)

**Example:** `/clubs/673f1234567890abcdef1234/schedule/day?date=2024-11-22`

**Response:**
```json
[
  {
    "courtId": "673f1234567890abcdef1235",
    "courtName": "Court 1 - Center",
    "bookings": [
      {
        "bookingId": "673f1234567890abcdef1250",
        "bookingName": "Juan Lopez - Match",
        "startDateTime": "2024-11-22T09:00:00.000Z",
        "endDateTime": "2024-11-22T10:30:00.000Z",
        "price": 45,
        "categoryName": "Match",
        "categoryColor": "#4CAF50",
        "coachName": null,
        "phone": "+34611222333",
        "notes": "Birthday match"
      },
      {
        "bookingId": "673f1234567890abcdef1251",
        "bookingName": "Carlos Rodriguez - Training",
        "startDateTime": "2024-11-22T16:00:00.000Z",
        "endDateTime": "2024-11-22T17:00:00.000Z",
        "price": 50,
        "categoryName": "Training",
        "categoryColor": "#2196F3",
        "coachName": "Carlos Rodriguez",
        "phone": "+34611333444"
      }
    ]
  }
]
```

### GET /clubs/:clubId/schedule/week?from=YYYY-MM-DD&to=YYYY-MM-DD
Get week schedule.

**Query Parameters:**
- `from` (required): Start date
- `to` (required): End date

**Example:** `/clubs/673f1234567890abcdef1234/schedule/week?from=2024-11-18&to=2024-11-24`

---

## 💰 Payments

### POST /clubs/:clubId/payments
Record a payment for a booking.

**Roles:** ADMIN, MANAGER, RECEPTIONIST

**Request Body:**
```json
{
  "bookingId": "673f1234567890abcdef1250",
  "amount": 45,
  "method": "CARD",
  "paidAt": "2024-11-22T10:00:00Z"
}
```

**Payment Methods:** `CASH`, `CARD`, `TRANSFER`, `WALLET`

### GET /clubs/:clubId/payments
List all payments for a club.

**Roles:** ADMIN, MANAGER

**Query Parameters:**
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

### GET /bookings/:bookingId/payments
Get all payments for a specific booking.

---

## 📋 Booking Categories

### GET /clubs/:clubId/booking-categories
List booking categories.

**Query Parameters:**
- `activeOnly=true` (optional): Only active categories

**Response:**
```json
[
  {
    "_id": "673f1234567890abcdef1240",
    "clubId": "673f1234567890abcdef1234",
    "name": "Match",
    "colorHex": "#4CAF50",
    "description": "Regular matches",
    "isActive": true
  }
]
```

### POST /clubs/:clubId/booking-categories
Create a booking category.

**Roles:** ADMIN, MANAGER

**Request Body:**
```json
{
  "name": "Premium Tournament",
  "colorHex": "#FF5722",
  "description": "High-level tournament bookings",
  "isActive": true
}
```

---

## 👨‍🏫 Coaches

### GET /clubs/:clubId/coaches
List coaches for a club.

**Query Parameters:**
- `activeOnly=true` (optional): Only active coaches

### POST /clubs/:clubId/coaches
Create a coach.

**Roles:** ADMIN, MANAGER

**Request Body:**
```json
{
  "userId": "673f1234567890abcdef1237",
  "fullName": "Pedro Sanchez",
  "phone": "+34600444555",
  "hourlyRate": 55,
  "specialties": ["Advanced", "Tournament Prep"],
  "isActive": true
}
```

---

## 🔑 User Roles

- **ADMIN**: Full system access
- **MANAGER**: Club management, bookings, staff
- **RECEPTIONIST**: Customer and booking management
- **COACH**: View own schedule and bookings

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be longer than 8 characters"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Booking with ID 673f1234567890abcdef1250 not found"
}
```

### 409 Conflict (Overlap Detection)
```json
{
  "statusCode": 409,
  "message": "Court is not available during the requested time slot. Conflict with booking: Juan Lopez - Match"
}
```

---

## 🎯 Common Use Cases

### 1. Create a Single Booking
1. Login to get access token
2. Get club ID from `/clubs`
3. Get available court from `/clubs/:clubId/courts`
4. Create booking with `POST /clubs/:clubId/bookings`

### 2. View Daily Schedule
1. Get today's date in YYYY-MM-DD format
2. Call `/clubs/:clubId/schedule/day?date=2024-11-22`
3. Display bookings grouped by court

### 3. Create Weekly Recurring Booking
1. Use `bookingType: "FIXED"`
2. Specify `repeatedDayOfWeek` (e.g., "MONDAY")
3. Set `recurrenceEndDate` for end of series
4. System creates individual bookings for each week

### 4. Record Payment
1. Get booking ID
2. Call `POST /clubs/:clubId/payments`
3. Booking's `paymentStatus` automatically updates

---

## 📝 Notes

- All dates/times use **ISO 8601 format** (e.g., `2024-11-22T18:00:00Z`)
- Bookings validate for **overlaps** on both courts and coaches
- **Recurring bookings** generate individual instances for each occurrence
- **Payment status** auto-calculates: `NOT_PAID`, `PARTIALLY_PAID`, `PAID`
- All endpoints require **authentication** except login/refresh

---

Built with NestJS, TypeScript, and MongoDB
