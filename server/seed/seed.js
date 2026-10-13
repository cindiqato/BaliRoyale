require('dotenv').config({ path: '../.env' });

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Package = require('../models/Package');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Archive = require('../models/Archive');
const AuditLog = require('../models/AuditLog');

const MONGO_URI = 'mongodb://localhost:27017/baliroyale';

// ---------- Helpers ----------

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
};

const ref = (i) => `BR-SEED-${String(i).padStart(4, '0')}`;

// ---------- Main ----------

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Wipe collections
    await Promise.all([
      User.deleteMany({}),
      Package.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Archive.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('Cleared all collections');

    // ---------- USERS ----------

    const rawUsers = [
      { firstName: 'Daniela', lastName: 'Samonte',   email: 'admin.bali@yopmail.com',  password: 'admin00', role: 'admin'  },
      { firstName: 'Carla',   lastName: 'Abordo',    email: 'staff1.bali@yopmail.com', password: 'staff00', role: 'staff'  },
      { firstName: 'Kimrae',  lastName: 'Jerusalem', email: 'staff2.bali@yopmail.com', password: 'staff00', role: 'staff'  },
      { firstName: 'Claire',  lastName: 'De Guzman', email: 'guest1.bali@yopmail.com', password: 'guest00', role: 'guest'  },
      { firstName: 'Patrick', lastName: 'Sunega',    email: 'guest2.bali@yopmail.com', password: 'guest00', role: 'guest'  },
      { firstName: 'Alberto', lastName: 'Gaji',      email: 'guest3.bali@yopmail.com', password: 'guest00', role: 'guest'  },
      { firstName: 'Khalil',  lastName: 'Espiritu',  email: 'guest4.bali@yopmail.com', password: 'guest00', role: 'guest'  },
      { firstName: 'Anthony', lastName: 'Gipit',     email: 'guest5.bali@yopmail.com', password: 'guest00', role: 'guest'  },
      { firstName: 'Angelo',  lastName: 'Bare',      email: 'guest6.bali@yopmail.com', password: 'guest00', role: 'guest'  },
      { firstName: 'Androi',  lastName: 'Pamisaran', email: 'guest7.bali@yopmail.com', password: 'guest00', role: 'guest'  },
      { firstName: 'Jerome',  lastName: 'Pagacpac',  email: 'guest8.bali@yopmail.com', password: 'guest00', role: 'guest'  },
      { firstName: 'Cheryl',  lastName: 'Tinaan',    email: 'guest9.bali@yopmail.com', password: 'guest00', role: 'guest'  },
      { firstName: 'Buknoy',  lastName: 'Dimaguiba', email: 'guest10.bali@yopmail.com',password: 'guest00', role: 'guest'  },
    ];

    const hashedUsers = await Promise.all(
      rawUsers.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      }))
    );

    const users = await User.insertMany(hashedUsers);

    // Preset reset token for Claire
    const claire = users.find((u) => u.email === 'guest1.bali@yopmail.com');
    claire.resetToken = 'demo-reset-token-123';
    claire.resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await claire.save();

    const admin = users.find((u) => u.role === 'admin');
    const staff = users.filter((u) => u.role === 'staff');
    const guests = users.filter((u) => u.role === 'guest');

    console.log(`Inserted ${users.length} users`);

    // ---------- PACKAGES ----------

    const packages = await Package.insertMany([
      {
        name: 'Day Tour', description: 'Daytime exclusive resort use',
        scheduleType: 'Day Tour', dayType: 'Any', startTime: '9AM', endTime: '5PM',
        baseRate: 7800, includedPax: 10, maxPax: 20, excessPaxRate: 350, bedrooms: 1,
        amenities: ['Pool', 'Kubo', 'Grill Station'],
        inclusions: ['Entrance', 'Use of amenities'],
      },
      {
        name: 'Night Tour', description: 'Overnight exclusive resort use',
        scheduleType: 'Night Tour', dayType: 'Any', startTime: '8PM', endTime: '6AM',
        baseRate: 8800, includedPax: 10, maxPax: 20, excessPaxRate: 350, bedrooms: 2,
        amenities: ['Pool', 'Kubo', 'Grill Station', 'Air-conditioned rooms'],
        inclusions: ['Entrance', 'Use of amenities', 'Overnight stay'],
      },
      {
        name: '21H Weekday', description: '21-hour use (Mon-Fri)',
        scheduleType: '21 Hours', dayType: 'Weekday', startTime: '8PM', endTime: '5PM',
        baseRate: 12800, includedPax: 10, maxPax: 20, excessPaxRate: 350, bedrooms: 2,
        amenities: ['Pool', 'Kubo', 'Grill Station', 'Air-conditioned rooms'],
        inclusions: ['Entrance', 'Use of amenities', 'Overnight stay'],
      },
      {
        name: '21H Weekend', description: '21-hour use (Sat-Sun)',
        scheduleType: '21 Hours', dayType: 'Weekend', startTime: '8PM', endTime: '5PM',
        baseRate: 14800, includedPax: 10, maxPax: 20, excessPaxRate: 350, bedrooms: 2,
        amenities: ['Pool', 'Kubo', 'Grill Station', 'Air-conditioned rooms'],
        inclusions: ['Entrance', 'Use of amenities', 'Overnight stay'],
      },
      {
        name: '20pax (21H)', description: '21-hour use for 20 guests',
        scheduleType: '21 Hours', dayType: 'Any', startTime: '8PM', endTime: '5PM',
        baseRate: 18800, includedPax: 20, maxPax: 30, excessPaxRate: 350, bedrooms: 2,
        amenities: ['Pool', 'Kubo', 'Grill Station', 'Air-conditioned rooms'],
        inclusions: ['Entrance', 'Use of amenities', 'Overnight stay'],
      },
      {
        name: '30pax (21H)', description: '21-hour use for 30 guests',
        scheduleType: '21 Hours', dayType: 'Any', startTime: '8PM', endTime: '5PM',
        baseRate: 25800, includedPax: 30, maxPax: 40, excessPaxRate: 350, bedrooms: 3,
        amenities: ['Pool', 'Kubo', 'Grill Station', 'Air-conditioned rooms'],
        inclusions: ['Entrance', 'Use of amenities', 'Overnight stay'],
      },
    ]);

    console.log(`Inserted ${packages.length} packages`);

    // ---------- BOOKINGS ----------

    const calcPricing = (pkg, guestCount) => {
      const baseRate = pkg.baseRate;
      const excessGuests = Math.max(0, guestCount - pkg.includedPax);
      const excessPaxFee = excessGuests * pkg.excessPaxRate;
      const addOnsFee = 0;
      const securityDeposit = 3000;
      const totalAmount = baseRate + excessPaxFee + addOnsFee + securityDeposit;
      const downPayment = Math.round(totalAmount * 0.5);
      const balanceDue = totalAmount - downPayment;
      return { baseRate, excessPaxFee, addOnsFee, securityDeposit, totalAmount, downPayment, balanceDue };
    };

    const statusHistoryFor = (userId, statuses) =>
      statuses.map((s) => ({
        status: s.status,
        changedBy: userId,
        changedAt: s.at,
        remarks: s.remarks || '',
      }));

    // 25 bookings
    const bookingDefs = [
      // ---- Completed (12) ----
      { guest: 0,  pkg: 0, days: 60, guests: 10, status: 'completed' },
      { guest: 1,  pkg: 1, days: 58, guests: 12, status: 'completed' },
      { guest: 2,  pkg: 2, days: 52, guests: 8,  status: 'completed' },
      { guest: 3,  pkg: 0, days: 48, guests: 10, status: 'completed' },
      { guest: 4,  pkg: 3, days: 45, guests: 15, status: 'completed' },
      { guest: 5,  pkg: 1, days: 40, guests: 10, status: 'completed' },
      { guest: 6,  pkg: 0, days: 35, guests: 14, status: 'completed' },
      { guest: 7,  pkg: 4, days: 30, guests: 22, status: 'completed' },
      { guest: 8,  pkg: 2, days: 25, guests: 10, status: 'completed' },
      { guest: 9,  pkg: 0, days: 20, guests: 12, status: 'completed' },
      { guest: 0,  pkg: 5, days: 15, guests: 28, status: 'completed' },
      { guest: 1,  pkg: 3, days: 10, guests: 12, status: 'completed' },
      // ---- Cancelled (2) ----
      { guest: 2,  pkg: 0, days: 8,  guests: 10, status: 'cancelled' },
      { guest: 3,  pkg: 1, days: 6,  guests: 12, status: 'cancelled' },
      // ---- No-show (1) ----
      { guest: 4,  pkg: 0, days: 4,  guests: 10, status: 'no_show' },
      // ---- Checked-in (2) ----
      { guest: 5,  pkg: 2, days: -1, guests: 10, status: 'checked_in' },
      { guest: 6,  pkg: 1, days: 0,  guests: 12, status: 'checked_in' },
      // ---- Confirmed (3) ----
      { guest: 7,  pkg: 0, days: -7, guests: 10, status: 'confirmed' },
      { guest: 8,  pkg: 3, days: -14, guests: 15, status: 'confirmed' },
      { guest: 9,  pkg: 4, days: -21, guests: 20, status: 'confirmed' },
      // ---- Rescheduled (2) ----
      { guest: 0,  pkg: 1, days: -30, guests: 10, status: 'rescheduled' },
      { guest: 1,  pkg: 0, days: -40, guests: 12, status: 'rescheduled' },
      // ---- Pending (3) ----
      { guest: 2,  pkg: 2, days: -50, guests: 10, status: 'pending' },
      { guest: 3,  pkg: 0, days: -55, guests: 10, status: 'pending' },
      { guest: 4,  pkg: 1, days: -60, guests: 10, status: 'pending' },
    ];

    const bookings = [];
    let idx = 1;

    for (const def of bookingDefs) {
      const pkg = packages[def.pkg];
      const guest = guests[def.guest];
      const pricing = calcPricing(pkg, def.guests);

      const bookingDate =
        def.days >= 0 ? daysAgo(def.days) : daysFromNow(-def.days);

      const created = new Date(bookingDate);
      created.setDate(created.getDate() - 7);

      let booking = {
        bookingRef: ref(idx),
        user: guest._id,
        package: pkg._id,
        bookingDate,
        startTime: pkg.startTime,
        endTime: pkg.endTime,
        guestCount: def.guests,
        addOns: [],
        pricing,
        status: 'pending',
        paymentStatus: 'unpaid',
        depositStatus: 'held',
        isActiveConfirmed: false,
        isArchived: false,
        statusHistory: [],
        createdAt: created,
        updatedAt: created,
      };

      const h = [];
      const at = (offset) => {
        const d = new Date(bookingDate);
        d.setDate(d.getDate() - offset);
        return d;
      };

      h.push({ status: 'pending', changedBy: guest._id, changedAt: at(7), remarks: 'Booking created' });

      if (['completed', 'cancelled', 'no_show', 'checked_in', 'confirmed', 'rescheduled'].includes(def.status)) {
        h.push({ status: 'confirmed', changedBy: staff[0]._id, changedAt: at(6), remarks: 'Booking confirmed' });
      }

      if (['completed', 'checked_in'].includes(def.status)) {
        h.push({ status: 'checked_in', changedBy: staff[0]._id, changedAt: at(0), remarks: 'Guest checked in' });
      }

      if (def.status === 'completed') {
        h.push({ status: 'completed', changedBy: staff[0]._id, changedAt: at(-1), remarks: 'Booking completed' });
        h.push({ status: 'deposit_returned', changedBy: staff[0]._id, changedAt: at(-1), remarks: 'Security deposit returned' });
      }

      if (def.status === 'cancelled') {
        booking.cancelRequested = false;
        booking.cancelStatus = 'approved';
        booking.cancelReason = 'Guest requested cancellation';
        h.push({ status: 'cancel_requested', changedBy: guest._id, changedAt: at(3), remarks: 'Guest requested cancellation' });
        h.push({ status: 'cancelled', changedBy: staff[0]._id, changedAt: at(2), remarks: 'Cancellation approved' });
      }

      if (def.status === 'no_show') {
        booking.depositStatus = 'deducted';
        booking.depositDeduction = 3000;
        booking.depositReason = 'No-show - deposit forfeited';
        h.push({ status: 'no_show', changedBy: staff[0]._id, changedAt: at(0), remarks: 'Guest did not show up' });
      }

      if (def.status === 'rescheduled') {
        booking.rescheduleRequested = false;
        booking.rescheduleStatus = 'approved';
        h.push({ status: 'reschedule_requested', changedBy: guest._id, changedAt: at(4), remarks: 'Requested new date' });
        h.push({ status: 'reschedule_approved', changedBy: staff[0]._id, changedAt: at(3), remarks: 'Reschedule approved' });
      }

      booking.statusHistory = h;

      // Final status
      if (def.status === 'completed') booking.status = 'completed';
      if (def.status === 'cancelled') booking.status = 'cancelled';
      if (def.status === 'no_show') booking.status = 'no_show';
      if (def.status === 'checked_in') booking.status = 'checked_in';
      if (def.status === 'confirmed') booking.status = 'confirmed';
      if (def.status === 'rescheduled') booking.status = 'confirmed';
      if (def.status === 'pending') booking.status = 'pending';

      // Active confirmed only for upcoming / in-progress
      if (['confirmed', 'checked_in', 'rescheduled'].includes(def.status)) {
        booking.isActiveConfirmed = true;
      }

      bookings.push(booking);
      idx++;
    }

    const insertedBookings = await Booking.insertMany(bookings);
    console.log(`Inserted ${insertedBookings.length} bookings`);

    // ---------- PAYMENTS ----------

    const payments = [];

    for (let i = 0; i < insertedBookings.length; i++) {
      const b = insertedBookings[i];
      const def = bookingDefs[i];
      const guest = guests[def.guest];

      const payAt = (offset) => {
        const d = new Date(b.bookingDate);
        d.setDate(d.getDate() - offset);
        return d;
      };

      // Completed / checked_in / cancelled / no_show / confirmed / rescheduled → have down payment
      if (['completed', 'checked_in', 'confirmed', 'rescheduled', 'no_show', 'cancelled'].includes(def.status)) {
        payments.push({
          booking: b._id,
          user: guest._id,
          type: 'down_payment',
          amount: b.pricing.downPayment,
          method: i % 3 === 0 ? 'cash' : 'gcash',
          referenceNo: `DP-${b.bookingRef}`,
          status: 'verified',
          verifiedBy: staff[0]._id,
          verifiedAt: payAt(5),
          createdAt: payAt(5),
          updatedAt: payAt(5),
        });
      }

      // Completed → also balance verified
      if (def.status === 'completed') {
        payments.push({
          booking: b._id,
          user: guest._id,
          type: 'balance',
          amount: b.pricing.balanceDue,
          method: i % 3 === 0 ? 'cash' : 'gcash',
          referenceNo: `BAL-${b.bookingRef}`,
          status: 'verified',
          verifiedBy: staff[0]._id,
          verifiedAt: payAt(1),
          createdAt: payAt(1),
          updatedAt: payAt(1),
        });
        b.paymentStatus = 'paid';
      } else if (['checked_in', 'confirmed', 'rescheduled', 'no_show', 'cancelled'].includes(def.status)) {
        b.paymentStatus = 'partial';
      }

      // Pending bookings → submit a pending payment (unverified)
      if (def.status === 'pending') {
        payments.push({
          booking: b._id,
          user: guest._id,
          type: 'down_payment',
          amount: b.pricing.downPayment,
          method: 'gcash',
          referenceNo: `DP-${b.bookingRef}`,
          status: 'pending',
          createdAt: payAt(3),
          updatedAt: payAt(3),
        });
        b.paymentStatus = 'partial';
      }

      await b.save();
    }

    // Two rejected payments — add extra payments for two completed bookings
    const rejectedTargets = [insertedBookings[0], insertedBookings[1]];
    for (const b of rejectedTargets) {
      payments.push({
        booking: b._id,
        user: b.user,
        type: 'balance',
        amount: 100,
        method: 'gcash',
        referenceNo: `FAKE-${b.bookingRef}`,
        status: 'rejected',
        verifiedBy: staff[0]._id,
        verifiedAt: new Date(),
        rejectionReason: 'Reference number does not match our records',
      });
    }

    await Payment.insertMany(payments);
    console.log(`Inserted ${payments.length} payments`);

    // ---------- ARCHIVES ----------

    // Archive 2 past completed bookings
    const toArchive = [insertedBookings[2], insertedBookings[3]];
    for (const b of toArchive) {
      await Archive.create({
        originalModel: 'bookings',
        originalId: b._id,
        snapshot: b.toObject(),
        reason: 'Record moved to archive (past booking)',
        archivedBy: admin._id,
        isRestored: false,
      });
      b.isArchived = true;
      await b.save();
    }

    // Archive 1 guest
    const guestToArchive = guests[guests.length - 1]; // Buknoy
    await Archive.create({
      originalModel: 'users',
      originalId: guestToArchive._id,
      snapshot: guestToArchive.toObject(),
      reason: 'Account inactive',
      archivedBy: admin._id,
      isRestored: false,
    });
    guestToArchive.isArchived = true;
    await guestToArchive.save();

    console.log('Inserted 3 archives');

    // ---------- AUDIT LOGS ----------

    const logs = [
      { action: 'confirm_booking',       details: 'Confirmed multiple bookings during seed',       targetModel: 'bookings' },
      { action: 'verify_payment',        details: 'Verified down and balance payments during seed', targetModel: 'payments' },
      { action: 'reject_payment',        details: 'Rejected fake reference payments',               targetModel: 'payments' },
      { action: 'archive_record',        details: 'Archived 2 past bookings and 1 user',            targetModel: 'bookings' },
      { action: 'approve_cancel',        details: 'Approved 2 cancellations',                        targetModel: 'bookings' },
      { action: 'approve_reschedule',    details: 'Approved 2 reschedules',                          targetModel: 'bookings' },
      { action: 'mark_no_show',          details: 'Marked 1 no-show booking',                        targetModel: 'bookings' },
      { action: 'record_cash_payment',   details: 'Recorded cash payments',                          targetModel: 'payments' },
      { action: 'create_user',           details: 'Seeded 13 users',                                 targetModel: 'users' },
      { action: 'create_package',        details: 'Seeded 6 packages',                               targetModel: 'packages' },
      { action: 'create_booking',        details: 'Seeded 25 bookings',                              targetModel: 'bookings' },
      { action: 'update_user',           details: 'Updated guest info',                              targetModel: 'users' },
    ];

    await AuditLog.insertMany(
      logs.map((l) => ({
        actor: l.action === 'archive_record' ? admin._id : staff[0]._id,
        action: l.action,
        targetModel: l.targetModel,
        details: l.details,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    console.log(`Inserted ${logs.length} audit log entries`);

    console.log('\n--- SEED COMPLETE ---');
    console.log(`Users:      13`);
    console.log(`Packages:   6`);
    console.log(`Bookings:   ${insertedBookings.length}`);
    console.log(`Payments:   ${payments.length}`);
    console.log(`Archives:   3`);
    console.log(`Audit logs: ${logs.length}`);
    console.log('\nDemo login credentials:');
    console.log('Admin  → admin.bali@yopmail.com  / admin00');
    console.log('Staff  → staff1.bali@yopmail.com / staff00');
    console.log('Guest  → guest1.bali@yopmail.com / guest00');
    console.log('\nReset token for Claire (guest1): demo-reset-token-123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();