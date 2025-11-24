import { connect, connection } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UserRole, DayOfWeek, BookingType, PaymentStatus, PaymentMethod } from '../common/enums';

async function seed() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/padel-club';
    await connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    const db = connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    await db.dropDatabase();
    console.log('🗑️  Dropped existing database');

    // 1. Create Admin User
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const usersCollection = db.collection('users');
    const adminResult = await usersCollection.insertOne({
      _id: randomUUID() as any,
      email: 'admin@padelclub.com',
      password: hashedPassword,
      fullName: 'System Admin',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const adminId = adminResult.insertedId;
    console.log('👤 Created admin user (admin@padelclub.com / Admin@123)');

    // 2. Create Club
    const clubsCollection = db.collection('clubs');
    const clubResult = await clubsCollection.insertOne({
      _id: randomUUID() as any,
      name: 'Padel Club Riyadh',
      location: {
        city: 'Riyadh',
        country: 'Saudi Arabia',
        coordinates: [46.6753, 24.7136],
      },
      timeZone: 'Asia/Riyadh',
      openingHours: [
        { dayOfWeek: DayOfWeek.SATURDAY, openTime: '08:00', closeTime: '03:00' },
        { dayOfWeek: DayOfWeek.SUNDAY, openTime: '08:00', closeTime: '03:00' },
        { dayOfWeek: DayOfWeek.MONDAY, openTime: '08:00', closeTime: '03:00' },
        { dayOfWeek: DayOfWeek.TUESDAY, openTime: '08:00', closeTime: '03:00' },
        { dayOfWeek: DayOfWeek.WEDNESDAY, openTime: '08:00', closeTime: '03:00' },
        { dayOfWeek: DayOfWeek.THURSDAY, openTime: '08:00', closeTime: '03:00' },
        { dayOfWeek: DayOfWeek.FRIDAY, openTime: '08:00', closeTime: '03:00' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const clubId = clubResult.insertedId;
    console.log('🏢 Created club: Padel Club Riyadh');

    // 3. Create Courts
    const courtsCollection = db.collection('courts');
    const courtNames = ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6'];
    const courts: any[] = [];
    
    for (const name of courtNames) {
      const courtResult = await courtsCollection.insertOne({
        _id: randomUUID() as any,
        clubId,
        name,
        surfaceType: 'Artificial Grass',
        isActive: true,
        defaultPricePerHour: 240,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      courts.push(courtResult.insertedId);
    }
    console.log(`🎾 Created ${courts.length} courts`);

    // 4. Create Booking Categories
    const categoriesCollection = db.collection('bookingcategories');
    const greenCategoryResult = await categoriesCollection.insertOne({
      _id: randomUUID() as any,
      clubId,
      name: 'Regular Booking',
      colorHex: '#22C55E',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const blueCategoryResult = await categoriesCollection.insertOne({
      _id: randomUUID() as any,
      clubId,
      name: 'Coach Session',
      colorHex: '#3B82F6',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('📋 Created 2 booking categories');

    // 5. Create Coaches
    const coachesCollection = db.collection('coaches');
    const coachResult = await coachesCollection.insertOne({
      _id: randomUUID() as any,
      clubId,
      fullName: 'Carlos Rodriguez',
      specialization: 'Advanced Training',
      phone: '+966501234567',
      email: 'carlos@padelclub.com',
      hourlyRate: 300,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const coachId = coachResult.insertedId;
    console.log('🎓 Created 1 coach');

    // 6. Create Customers
    const customersCollection = db.collection('customers');
    const customerNames = [
      'Aziz Alotaibi', 'dani alsumiri', 'abdullah alaraj', 'Abdulaziz Al Habi',
      'Faisal Saleh', 'Ahmed Samir', 'Hadi', 'Sara Ahmed', 'Mohammed Ali',
      'Omar Hassan', 'Ali Mohammed', 'Khalid Ahmed', 'Nasser Ibrahim',
      'Yousef Fahad', 'Faisal Hamad', 'Saud Majed', 'Turki Saad',
      'Bandar Fawaz', 'Rakan Saleh', 'Majed Zaid', 'Sultan Nayef',
      'Waleed Rashid', 'Nawaf Talal', 'Abdulrahman Said', 'Fahad Mubarak'
    ];
    
    const customerMap: Map<string, any> = new Map();
    for (const fullName of customerNames) {
      const phone = `+966${Math.floor(500000000 + Math.random() * 99999999)}`;
      const email = fullName.toLowerCase().replace(/\s+/g, '.') + '@example.com';
      const customerResult = await customersCollection.insertOne({
        _id: randomUUID() as any,
        clubId,
        fullName,
        phone,
        email,
        notes: 'Regular customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      customerMap.set(fullName, customerResult.insertedId);
    }
    console.log(`👥 Created ${customerMap.size} customers`);

    // 7. Create Bookings with all three types (SINGLE, FIXED, COACH)
    const bookingsCollection = db.collection('bookings');
    const paymentsCollection = db.collection('payments');
    
    const bookingsData = [
      // SINGLE BOOKINGS - Nov 21, 2025
      { type: BookingType.SINGLE, courtIdx: 0, playerName: 'Aziz Alotaibi', date: '2025-11-21', start: '14:00', end: '15:30', color: 'green', price: 360 },
      { type: BookingType.SINGLE, courtIdx: 0, playerName: 'dani alsumiri', date: '2025-11-21', start: '15:30', end: '17:00', color: 'green', price: 360 },
      { type: BookingType.SINGLE, courtIdx: 1, playerName: 'abdullah alaraj', date: '2025-11-21', start: '16:00', end: '17:00', color: 'green', price: 240 },
      { type: BookingType.SINGLE, courtIdx: 0, playerName: 'Abdulaziz Al Habi', date: '2025-11-21', start: '17:00', end: '19:00', color: 'green', price: 480 },
      { type: BookingType.SINGLE, courtIdx: 1, playerName: 'Faisal Saleh', date: '2025-11-21', start: '17:30', end: '19:00', color: 'green', price: 360 },
      { type: BookingType.SINGLE, courtIdx: 2, playerName: 'Ahmed Samir', date: '2025-11-21', start: '13:00', end: '14:00', color: 'green', price: 240 },
      { type: BookingType.SINGLE, courtIdx: 3, playerName: 'Sara Ahmed', date: '2025-11-21', start: '10:00', end: '11:30', color: 'green', price: 360 },
      { type: BookingType.SINGLE, courtIdx: 4, playerName: 'Mohammed Ali', date: '2025-11-21', start: '12:00', end: '13:00', color: 'green', price: 240 },
      
      // COACH BOOKINGS - Nov 21, 2025
      { type: BookingType.COACH, courtIdx: 5, playerName: 'Hadi', coachName: 'Carlos Rodriguez', date: '2025-11-21', start: '15:00', end: '17:00', color: 'blue', price: 480, coachFee: 600 },
      { type: BookingType.COACH, courtIdx: 2, playerName: 'Late Night Session', coachName: 'Carlos Rodriguez', date: '2025-11-21', start: '23:00', end: '01:00', color: 'blue', price: 480, coachFee: 600 },
      { type: BookingType.COACH, courtIdx: 3, playerName: 'Midnight Match', coachName: 'Carlos Rodriguez', date: '2025-11-21', start: '23:00', end: '02:00', color: 'blue', price: 720, coachFee: 900 },
      
      // SINGLE BOOKINGS - Nov 22, 2025
      { type: BookingType.SINGLE, courtIdx: 1, playerName: 'Omar Hassan', date: '2025-11-22', start: '09:00', end: '10:30', color: 'green', price: 360 },
      { type: BookingType.SINGLE, courtIdx: 0, playerName: 'Ali Mohammed', date: '2025-11-22', start: '14:00', end: '15:30', color: 'green', price: 360 },
      { type: BookingType.SINGLE, courtIdx: 4, playerName: 'Nasser Ibrahim', date: '2025-11-22', start: '18:00', end: '19:30', color: 'green', price: 360 },
      
      // COACH BOOKINGS - Nov 22, 2025
      { type: BookingType.COACH, courtIdx: 2, playerName: 'Khalid Ahmed', coachName: 'Carlos Rodriguez', date: '2025-11-22', start: '16:00', end: '17:00', color: 'blue', price: 240, coachFee: 300 },
      { type: BookingType.COACH, courtIdx: 1, playerName: 'Late Night Championship', coachName: 'Carlos Rodriguez', date: '2025-11-22', start: '23:30', end: '03:00', color: 'blue', price: 840, coachFee: 1050 },
      
      // COACH BOOKINGS - Nov 23, 2025
      { type: BookingType.COACH, courtIdx: 1, playerName: 'Yousef Fahad', coachName: 'Carlos Rodriguez', date: '2025-11-23', start: '10:00', end: '12:00', color: 'blue', price: 480, coachFee: 600 },
      { type: BookingType.COACH, courtIdx: 5, playerName: 'Saud Majed', coachName: 'Carlos Rodriguez', date: '2025-11-23', start: '15:30', end: '17:00', color: 'blue', price: 360, coachFee: 450 },
      
      // SINGLE BOOKINGS - Nov 23-27, 2025
      { type: BookingType.SINGLE, courtIdx: 3, playerName: 'Faisal Hamad', date: '2025-11-23', start: '13:00', end: '14:00', color: 'green', price: 240 },
      { type: BookingType.SINGLE, courtIdx: 0, playerName: 'Turki Saad', date: '2025-11-24', start: '11:00', end: '12:30', color: 'green', price: 360 },
      { type: BookingType.SINGLE, courtIdx: 4, playerName: 'Rakan Saleh', date: '2025-11-24', start: '17:00', end: '18:00', color: 'green', price: 240 },
      { type: BookingType.SINGLE, courtIdx: 3, playerName: 'Sultan Nayef', date: '2025-11-25', start: '12:00', end: '13:30', color: 'green', price: 360 },
      { type: BookingType.SINGLE, courtIdx: 5, playerName: 'Nawaf Talal', date: '2025-11-26', start: '19:00', end: '20:30', color: 'green', price: 360 },
      { type: BookingType.SINGLE, courtIdx: 4, playerName: 'Fahad Mubarak', date: '2025-11-27', start: '13:00', end: '15:00', color: 'green', price: 480 },
      
      // COACH BOOKINGS - Nov 24-27, 2025
      { type: BookingType.COACH, courtIdx: 2, playerName: 'Bandar Fawaz', coachName: 'Carlos Rodriguez', date: '2025-11-24', start: '14:00', end: '16:00', color: 'blue', price: 480, coachFee: 600 },
      { type: BookingType.COACH, courtIdx: 1, playerName: 'Majed Zaid', coachName: 'Carlos Rodriguez', date: '2025-11-25', start: '09:00', end: '10:30', color: 'blue', price: 360, coachFee: 450 },
      { type: BookingType.COACH, courtIdx: 0, playerName: 'Waleed Rashid', coachName: 'Carlos Rodriguez', date: '2025-11-26', start: '16:00', end: '17:00', color: 'blue', price: 240, coachFee: 300 },
      { type: BookingType.COACH, courtIdx: 2, playerName: 'Abdulrahman Said', coachName: 'Carlos Rodriguez', date: '2025-11-27', start: '10:00', end: '11:00', color: 'blue', price: 240, coachFee: 300 },
    ];

    let bookingCount = 0;
    let paymentCount = 0;

    // Create SINGLE and COACH bookings
    for (const booking of bookingsData) {
      const [startHour, startMin] = booking.start.split(':').map(Number);
      const [endHour, endMin] = booking.end.split(':').map(Number);
      const [year, month, day] = booking.date.split('-').map(Number);
      
      const startDateTime = new Date(year, month - 1, day, startHour, startMin);
      let endDateTime = new Date(year, month - 1, day, endHour, endMin);
      
      // Handle overnight bookings
      if (endHour < startHour) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }
      
      const durationMinutes = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60));
      const categoryId = booking.color === 'green' ? greenCategoryResult.insertedId : blueCategoryResult.insertedId;
      const customerId = customerMap.get(booking.playerName);
      
      const bookingDoc: any = {
        _id: randomUUID() as any,
        clubId,
        courtId: courts[booking.courtIdx],
        customerId: customerId || null,
        bookingName: booking.playerName,
        phone: customerId ? `+966${Math.floor(500000000 + Math.random() * 99999999)}` : '+966500000000',
        bookingType: booking.type,
        startDateTime,
        endDateTime,
        durationMinutes,
        price: booking.price,
        totalReceived: booking.price,
        paymentStatus: PaymentStatus.PAID,
        bookingCategoryId: categoryId,
        createdByUserId: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add coach for COACH bookings
      if (booking.type === BookingType.COACH) {
        bookingDoc.coachId = coachId;
        bookingDoc.coachFee = booking['coachFee'] || 0;
      }

      const bookingResult = await bookingsCollection.insertOne(bookingDoc);
      bookingCount++;

      // Create payment record
      await paymentsCollection.insertOne({
        _id: randomUUID() as any,
        bookingId: bookingResult.insertedId,
        clubId,
        amount: booking.price,
        method: PaymentMethod.CASH,
        paidAt: startDateTime,
        createdByUserId: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      paymentCount++;
    }

    // Create FIXED (recurring) bookings - Weekly sessions for regular customers
    const fixedBookingsData = [
      // Every Saturday 10:00-11:30 on Court 0 for 4 weeks
      { courtIdx: 0, playerName: 'Aziz Alotaibi', dayOfWeek: DayOfWeek.SATURDAY, startTime: '10:00', duration: 90, weeks: 4, price: 360, color: 'green' },
      // Every Sunday 18:00-19:30 on Court 3 for 4 weeks
      { courtIdx: 3, playerName: 'dani alsumiri', dayOfWeek: DayOfWeek.SUNDAY, startTime: '18:00', duration: 90, weeks: 4, price: 360, color: 'green' },
      // Every Monday 14:00-15:00 on Court 2 for 3 weeks
      { courtIdx: 2, playerName: 'abdullah alaraj', dayOfWeek: DayOfWeek.MONDAY, startTime: '14:00', duration: 60, weeks: 3, price: 240, color: 'green' },
    ];

    for (const fixed of fixedBookingsData) {
      const seriesId = randomUUID();
      const categoryId = fixed.color === 'green' ? greenCategoryResult.insertedId : blueCategoryResult.insertedId;
      const customerId = customerMap.get(fixed.playerName);
      const [hour, min] = fixed.startTime.split(':').map(Number);
      
      // Start from Nov 24, 2025 (Sunday)
      let currentDate = new Date(2025, 10, 24); // Month is 0-indexed
      
      // Find first occurrence of the target day
      const dayMap = {
        [DayOfWeek.SUNDAY]: 0,
        [DayOfWeek.MONDAY]: 1,
        [DayOfWeek.TUESDAY]: 2,
        [DayOfWeek.WEDNESDAY]: 3,
        [DayOfWeek.THURSDAY]: 4,
        [DayOfWeek.FRIDAY]: 5,
        [DayOfWeek.SATURDAY]: 6,
      };
      
      const targetDay = dayMap[fixed.dayOfWeek];
      while (currentDate.getDay() !== targetDay) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      const recurrenceEndDate = new Date(currentDate);
      recurrenceEndDate.setDate(recurrenceEndDate.getDate() + (fixed.weeks * 7));
      
      // Create weekly occurrences
      for (let week = 0; week < fixed.weeks; week++) {
        const occurrenceDate = new Date(currentDate);
        occurrenceDate.setDate(occurrenceDate.getDate() + (week * 7));
        
        const startDateTime = new Date(occurrenceDate);
        startDateTime.setHours(hour, min, 0, 0);
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + fixed.duration);
        
        const bookingResult = await bookingsCollection.insertOne({
          _id: randomUUID() as any,
          clubId,
          courtId: courts[fixed.courtIdx],
          customerId: customerId || null,
          bookingName: fixed.playerName,
          phone: customerId ? `+966${Math.floor(500000000 + Math.random() * 99999999)}` : '+966500000000',
          bookingType: BookingType.FIXED,
          startDateTime,
          endDateTime,
          durationMinutes: fixed.duration,
          repeatedDayOfWeek: fixed.dayOfWeek,
          recurrenceEndDate,
          seriesId,
          price: fixed.price,
          totalReceived: fixed.price,
          paymentStatus: PaymentStatus.PAID,
          bookingCategoryId: categoryId,
          createdByUserId: adminId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        bookingCount++;

        // Create payment
        await paymentsCollection.insertOne({
          _id: randomUUID() as any,
          bookingId: bookingResult.insertedId,
          clubId,
          amount: fixed.price,
          method: PaymentMethod.CASH,
          paidAt: startDateTime,
          createdByUserId: adminId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        paymentCount++;
      }
    }
    
    console.log(`📅 Created ${bookingCount} bookings`);
    console.log(`💰 Created ${paymentCount} payments`);
    console.log('✅ Database seeded successfully!');
    
    await connection.close();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
