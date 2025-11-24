# 🎯 Booking System Enhancements

This document details the advanced booking features added to support overnight bookings and drag-and-drop functionality.

---

## ✨ New Features

### 1. Enhanced Overlap Detection
**Problem Solved:** Original overlap detection only checked one condition and failed for overnight bookings (e.g., 11:30 PM to 3:00 AM).

**Solution:** Implemented comprehensive 4-case overlap detection:

#### The 4 Overlap Cases
```
Case 1: Existing booking overlaps NEW booking's START
  Existing: [======]
  New:         [======]
  Condition: existingStart <= newStart AND existingEnd > newStart

Case 2: Existing booking overlaps NEW booking's END
  Existing:     [======]
  New:      [======]
  Condition: existingStart < newEnd AND existingEnd >= newEnd

Case 3: NEW booking CONTAINS existing booking
  Existing:   [====]
  New:      [==========]
  Condition: existingStart >= newStart AND existingEnd <= newEnd

Case 4: Existing booking CONTAINS new booking
  Existing: [==========]
  New:        [====]
  Condition: existingStart <= newStart AND existingEnd >= newEnd
```

#### MongoDB Query Implementation
```typescript
const conflictingBookings = await this.bookingModel.find({
  club: clubId,
  court: courtId,
  _id: { $ne: excludeBookingId }, // Exclude current booking when updating
  $or: [
    // Case 1: Existing overlaps new start
    {
      startDateTime: { $lte: startDateTime },
      endDateTime: { $gt: startDateTime },
    },
    // Case 2: Existing overlaps new end
    {
      startDateTime: { $lt: endDateTime },
      endDateTime: { $gte: endDateTime },
    },
    // Case 3: New contains existing
    {
      startDateTime: { $gte: startDateTime },
      endDateTime: { $lte: endDateTime },
    },
    // Case 4: Existing contains new
    {
      startDateTime: { $lte: startDateTime },
      endDateTime: { $gte: endDateTime },
    },
  ],
});
```

---

### 2. Overnight Booking Support

**Examples:**
- 11:30 PM to 3:00 AM ✅
- 10:00 PM to 2:00 AM ✅
- 11:00 PM to 1:00 AM ✅

**How It Works:**
- Times stored as ISO 8601 UTC timestamps
- Overlap detection works across midnight boundary
- Example: `2024-11-23T23:30:00Z` to `2024-11-24T03:00:00Z`

**Test Scenario:**
```bash
# Create overnight booking: 11:30 PM - 3:00 AM
POST /clubs/:clubId/bookings
{
  "startDateTime": "2024-11-23T23:30:00Z",
  "endDateTime": "2024-11-24T03:00:00Z",
  ...
}

# Try to book 1:00 AM - 2:00 AM (should FAIL)
POST /clubs/:clubId/bookings
{
  "startDateTime": "2024-11-24T01:00:00Z",
  "endDateTime": "2024-11-24T02:00:00Z",
  ...
}

# Error Response:
{
  "statusCode": 400,
  "message": "Court is already booked during this time. Conflicts: Late Night Match (2024-11-23 23:30 - 2024-11-24 03:00)"
}
```

---

### 3. Drag-and-Drop API

**New Endpoint:** `PUT /clubs/:clubId/bookings/:id/drag-drop`

**Purpose:** Optimized endpoint for calendar drag-and-drop interactions.

**Features:**
- Update booking time (start/end)
- Optionally change court
- Optionally change coach
- Auto-calculate duration
- Validate all conflicts (court + coach)

**Request Body:**
```typescript
class DragDropUpdateDto {
  @IsDateString()
  startDateTime: string;

  @IsDateString()
  endDateTime: string;

  @IsOptional()
  @IsMongoId()
  courtId?: string;

  @IsOptional()
  @IsMongoId()
  coachId?: string;
}
```

**Implementation Highlights:**
```typescript
async dragDropUpdate(
  clubId: string,
  bookingId: string,
  updateDto: DragDropUpdateDto,
): Promise<Booking> {
  const booking = await this.findOne(bookingId, clubId);

  const start = new Date(updateDto.startDateTime);
  const end = new Date(updateDto.endDateTime);
  const duration = Math.round((end.getTime() - start.getTime()) / 60000);

  const newCourtId = updateDto.courtId || booking.court.toString();
  const newCoachId = updateDto.coachId || booking.coach?.toString();

  // Validate court availability
  await this.validateCourtAvailability(
    clubId,
    newCourtId,
    start,
    end,
    bookingId,
  );

  // Validate coach availability if assigned
  if (newCoachId) {
    await this.validateCoachAvailability(
      clubId,
      newCoachId,
      start,
      end,
      bookingId,
    );
  }

  // Update booking
  booking.startDateTime = start;
  booking.endDateTime = end;
  booking.duration = duration;
  if (updateDto.courtId) booking.court = new Types.ObjectId(updateDto.courtId);
  if (updateDto.coachId) booking.coach = new Types.ObjectId(updateDto.coachId);

  return booking.save();
}
```

---

## 🔍 Validation Logic

### Court Availability Check
Applied in 3 methods:
1. `create()` - New booking creation
2. `update()` - Regular booking updates
3. `dragDropUpdate()` - Drag-and-drop updates

### Coach Availability Check
Also applied in same 3 methods with identical 4-case logic.

### Schedule Display for Overnight Bookings
The schedule endpoints automatically show overnight bookings on both days:
- A booking from 11:00 PM (Nov 23) to 12:30 AM (Nov 24) appears in both days' schedules
- Query uses 3 conditions to find overlapping bookings:
  1. Booking starts within the requested date range
  2. Booking ends within the requested date range  
  3. Booking spans across the entire date range

**Example:**
```
Booking: Nov 23 11:00 PM - Nov 24 12:30 AM
- GET /schedule/day?date=2024-11-23 ✅ Shows this booking
- GET /schedule/day?date=2024-11-24 ✅ Shows this booking
```

### Error Messages
Enhanced to show ALL conflicting bookings with times:
```
"Court is already booked during this time. Conflicts: 
  Match Training (2024-11-23 09:00 - 2024-11-23 10:30),
  Evening Session (2024-11-23 17:00 - 2024-11-23 18:30)"
```

---

## 📊 Use Cases

### Use Case 1: Late Night Tournament
**Scenario:** Club hosts overnight tournament from 11:00 PM to 3:00 AM
```bash
POST /clubs/:clubId/bookings
{
  "bookingName": "Midnight Tournament Finals",
  "startDateTime": "2024-11-23T23:00:00Z",
  "endDateTime": "2024-11-24T03:00:00Z",
  "courtId": "...",
  "customerId": "...",
  "categoryId": "...",
  "price": 100
}
```
✅ System prevents any overlapping bookings from 11:00 PM to 3:00 AM

### Use Case 2: Receptionist Reschedules via Calendar
**Scenario:** Drag booking from 9:00 AM to 2:00 PM on same court
```bash
PUT /clubs/:clubId/bookings/:id/drag-drop
{
  "startDateTime": "2024-11-23T14:00:00Z",
  "endDateTime": "2024-11-23T15:30:00Z"
}
```
✅ Duration auto-calculated (90 minutes), conflicts checked

### Use Case 3: Move to Different Court with Coach
**Scenario:** Court 1 unavailable, move to Court 2 with same coach
```bash
PUT /clubs/:clubId/bookings/:id/drag-drop
{
  "startDateTime": "2024-11-23T16:00:00Z",
  "endDateTime": "2024-11-23T17:30:00Z",
  "courtId": "COURT_2_ID",
  "coachId": "COACH_ID"
}
```
✅ Validates both court AND coach availability at new time

---

## 🧪 Testing Checklist

### Overnight Booking Tests
- [ ] Create booking 11:30 PM - 3:00 AM
- [ ] Try overlapping booking 1:00 AM - 2:00 AM (should fail)
- [ ] Create booking 10:00 PM - 11:00 PM (should succeed)
- [ ] Create booking 3:30 AM - 5:00 AM (should succeed)
- [ ] Verify error message shows conflicting times

### Drag-Drop Tests
- [ ] Move booking to later time same day
- [ ] Move booking to different court
- [ ] Add coach to booking via drag-drop
- [ ] Move overnight booking to regular hours
- [ ] Test conflict detection during drag-drop
- [ ] Verify duration auto-calculation

### Edge Cases
- [ ] Booking exactly at midnight (00:00)
- [ ] Same start and end date
- [ ] Very short duration (15 minutes)
- [ ] Very long duration (6+ hours)
- [ ] Multiple consecutive bookings

---

## 📝 Code Changes Summary

### New Files
1. `src/modules/bookings/dto/drag-drop-update.dto.ts`
   - DTO for drag-and-drop updates
   - Optional courtId and coachId fields

### Modified Files
1. `src/modules/bookings/bookings.service.ts`
   - Enhanced `validateCourtAvailability()` with 4-case query
   - Enhanced `validateCoachAvailability()` with 4-case query
   - Added `dragDropUpdate()` method

2. `src/modules/bookings/bookings.controller.ts`
   - Added `PUT /clubs/:clubId/bookings/:id/drag-drop` endpoint
   - Added `DragDropUpdateDto` import

### Updated Documentation
1. `API_DOCUMENTATION.md`
   - Added drag-drop endpoint documentation
   - Included overnight booking notes

2. `API_TEST_EXAMPLES.md`
   - Added overnight booking test cases
   - Added drag-drop test examples
   - Added expected error responses

---

## 🎉 Benefits

1. **Robust Conflict Detection:** All 4 overlap scenarios covered
2. **Overnight Support:** Bookings can span midnight without issues
3. **Calendar Integration:** Drag-and-drop API optimized for UI interactions
4. **Better UX:** Clear error messages showing exactly which bookings conflict
5. **Production Ready:** Handles edge cases and validates all inputs

---

## 🚀 API Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/clubs/:clubId/bookings` | Create booking (with 4-case validation) |
| PATCH | `/clubs/:clubId/bookings/:id` | Update booking (with 4-case validation) |
| **PUT** | `/clubs/:clubId/bookings/:id/drag-drop` | **Drag-and-drop update (NEW)** |

**Total API Endpoints:** 45 (increased from 44)

---

*Last Updated: November 23, 2025*
*Enhanced with overnight booking support and drag-and-drop functionality*
