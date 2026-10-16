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

// ---------- Date helpers ----------

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

const utcMidnight = (date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

// Generates a booking reference identical in format to the live system:
// BR-{6-digit timestamp slice}-{6-char alnum}
const generateRef = () => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const stamp = String(Date.now()).slice(-6);
  return `BR-${stamp}-${random}`;
};

// ---------- Main seed ----------

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

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

    const HOLD_MINUTES = 15;

    const bookingDefs = [
      // ---------- COMPLETED (12) ----------
      { guest: 0, pkg: 0, days: -60, guests: 10, status: 'completed', payment: 'full_paid',  deposit: 'returned' },
      { guest: 1, pkg: 1, days: -58, guests: 12, status: 'completed', payment: 'full_paid',  deposit: 'returned' },
      { guest: 2, pkg: 2, days: -52, guests: 8,  status: 'completed', payment: 'full_paid',  deposit: 'returned' },
      { guest: 3, pkg: 0, days: -48, guests: 10, status: 'completed', payment: 'full_paid',  deposit: 'deducted', depositAmount: 500, depositReason: 'Broken glassware' },
      { guest: 4, pkg: 3, days: -45, guests: 15, status: 'completed', payment: 'full_paid',  deposit: 'returned' },
      { guest: 5, pkg: 1, days: -40, guests: 10, status: 'completed', payment: 'full_paid',  deposit: 'returned' },
      { guest: 6, pkg: 0, days: -35, guests: 14, status: 'completed', payment: 'full_paid',  deposit: 'returned' },
      { guest: 7, pkg: 4, days: -30, guests: 22, status: 'completed', payment: 'full_paid',  deposit: 'deducted', depositAmount: 1000, depositReason: 'Broken table' },
      { guest: 8, pkg: 2, days: -25, guests: 10, status: 'completed', payment: 'full_paid',  deposit: 'returned' },
      { guest: 9, pkg: 0, days: -20, guests: 12, status: 'completed', payment: 'full_paid',  deposit: 'returned' },
      { guest: 0, pkg: 5, days: -15, guests: 28, status: 'completed', payment: 'full_paid',  deposit: 'returned' },
      { guest: 1, pkg: 3, days: -10, guests: 12, status: 'completed', payment: 'full_paid',  deposit: 'returned' },

      // ---------- CANCELLED WITH REFUND (3) ----------
      { guest: 2, pkg: 0, days: -8,  guests: 10, status: 'cancelled', payment: 'refunded', cancelReason: 'Change of plans' },
      { guest: 3, pkg: 1, days: -6,  guests: 12, status: 'cancelled', payment: 'refunded', cancelReason: 'Family emergency' },
      { guest: 4, pkg: 2, days: -5,  guests: 10, status: 'cancelled', payment: 'refunded', cancelReason: 'Weather concerns' },

      // ---------- CANCELLED NO PAYMENT (1) ----------
      { guest: 5, pkg: 0, days: -4, guests: 10, status: 'cancelled', payment: 'unpaid', cancelReason: 'Found another venue' },

      // ---------- NO-SHOW (1) ----------
      { guest: 6, pkg: 1, days: -3, guests: 10, status: 'no_show', payment: 'down_paid', deposit: 'deducted', depositAmount: 3000, depositReason: 'No-show - deposit forfeited' },

      // ---------- CHECKED-IN (2) ----------
      { guest: 7, pkg: 3, days: 0,  guests: 15, status: 'checked_in', payment: 'full_paid', deposit: 'held' },
      { guest: 8, pkg: 1, days: 0,  guests: 10, status: 'checked_in', payment: 'full_paid', deposit: 'held' },

      // ---------- CONFIRMED (4) ----------
      { guest: 9, pkg: 0, days: 7,  guests: 10, status: 'confirmed', payment: 'full_paid', deposit: 'held' },
      { guest: 0, pkg: 2, days: 12, guests: 10, status: 'confirmed', payment: 'down_paid', deposit: 'held' },
      { guest: 1, pkg: 0, days: 18, guests: 12, status: 'confirmed', payment: 'down_paid', deposit: 'held' },
      { guest: 2, pkg: 4, days: 25, guests: 20, status: 'confirmed', payment: 'down_paid', deposit: 'held' },

      // ---------- RESCHEDULED (1) ----------
      { guest: 3, pkg: 3, days: 30, guests: 12, status: 'confirmed', payment: 'full_paid', deposit: 'held', rescheduled: true },

      // ---------- PENDING WITH ACTIVE HOLD (1) ----------
      { guest: 4, pkg: 2, days: 40, guests: 10, status: 'pending', payment: 'hold_active' },

      // ---------- PAYMENT TIMEOUT (1) ----------
      { guest: 5, pkg: 0, days: 45, guests: 10, status: 'payment_timeout', payment: 'expired' },

      // ---------- PENDING WITH PAYMENT SUBMITTED (1) ----------
      { guest: 6, pkg: 1, days: 50, guests: 10, status: 'pending', payment: 'payment_submitted' },
    ];

    const insertedBookings = [];

    for (const def of bookingDefs) {
      const pkg = packages[def.pkg];
      const guest = guests[def.guest];
      const pricing = calcPricing(pkg, def.guests);

      const bookingDate =
        def.days >= 0 ? daysFromNow(def.days) : daysAgo(-def.days);
      const bookingDateUTC = utcMidnight(bookingDate);

      const created = new Date(bookingDateUTC);
      created.setDate(created.getDate() - 7);

      const bookingRef = generateRef();

      const booking = {
        bookingRef,
        user: guest._id,
        package: pkg._id,
        bookingDate: bookingDateUTC,
        startTime: pkg.startTime,
        endTime: pkg.endTime,
        guestCount: def.guests,
        addOns: [],
        pricing,
        status: def.status,
        paymentStatus: 'unpaid',
        depositStatus: def.deposit || 'held',
        depositDeduction: def.depositAmount || 0,
        depositReason: def.depositReason || undefined,
        isSlotBlocked: false,
        isActiveConfirmed: false,
        isArchived: false,
        statusHistory: [],
        createdAt: created,
        updatedAt: created,
      };

      const at = (offsetDays, hours = 12) => {
        const d = new Date(bookingDateUTC);
        d.setDate(d.getDate() + offsetDays);
        d.setHours(hours, 0, 0, 0);
        return d;
      };

      const h = [];
      h.push({
        status: 'pending',
        changedBy: guest._id,
        changedAt: at(-7),
        remarks: 'Booking created. Payment due within 15 minutes.',
      });

      const paymentsForBooking = [];

      if (def.payment === 'full_paid' || def.payment === 'down_paid' || def.payment === 'refunded') {
        h.push({
          status: 'payment_submitted',
          changedBy: guest._id,
          changedAt: at(-7, 13),
          remarks: 'Down payment submitted. Awaiting staff verification.',
        });
        h.push({
          status: 'confirmed',
          changedBy: staff[0]._id,
          changedAt: at(-6),
          remarks: 'Auto-confirmed after verification of down payment',
        });

        paymentsForBooking.push({
          type: 'down_payment',
          amount: pricing.downPayment,
          method: def.pkg % 2 === 0 ? 'gcash' : 'bank',
          status: 'verified',
          submittedAt: at(-7, 13),
          verifiedAt: at(-6),
        });

        if (def.payment === 'full_paid') {
          paymentsForBooking.push({
            type: 'balance',
            amount: pricing.balanceDue,
            method: def.pkg % 2 === 0 ? 'bank' : 'gcash',
            status: 'verified',
            submittedAt: at(-2),
            verifiedAt: at(-1),
          });
        }
      }

      if (def.status === 'checked_in' || def.status === 'completed') {
        h.push({
          status: 'checked_in',
          changedBy: staff[0]._id,
          changedAt: at(0, 14),
          remarks: 'Guest checked in',
        });
      }

      if (def.status === 'completed') {
        h.push({
          status: 'completed',
          changedBy: staff[0]._id,
          changedAt: at(1, 9),
          remarks: 'Booking completed. Full payment settled.',
        });
        if (def.deposit === 'returned') {
          h.push({
            status: 'deposit_returned',
            changedBy: staff[0]._id,
            changedAt: at(1, 11),
            remarks: 'Security deposit returned',
          });
        } else if (def.deposit === 'deducted') {
          h.push({
            status: 'deposit_deducted',
            changedBy: staff[0]._id,
            changedAt: at(1, 11),
            remarks: `Deducted ₱${def.depositAmount}: ${def.depositReason}`,
          });
        }
      }

      if (def.status === 'cancelled') {
        h.push({
          status: 'cancel_requested',
          changedBy: guest._id,
          changedAt: at(-5, 10),
          remarks: def.cancelReason || 'No reason provided',
        });
        h.push({
          status: 'cancelled',
          changedBy: staff[0]._id,
          changedAt: at(-4, 10),
          remarks: 'Cancellation approved',
        });
      }

      if (def.status === 'no_show') {
        h.push({
          status: 'no_show',
          changedBy: staff[0]._id,
          changedAt: at(0, 20),
          remarks: 'Guest did not show up',
        });
        h.push({
          status: 'deposit_deducted',
          changedBy: staff[0]._id,
          changedAt: at(0, 20),
          remarks: 'Deposit forfeited',
        });
      }

      if (def.rescheduled) {
        h.push({
          status: 'reschedule_requested',
          changedBy: guest._id,
          changedAt: at(-3),
          remarks: `Requested new date: ${bookingDateUTC.toDateString()}`,
        });
        h.push({
          status: 'reschedule_approved',
          changedBy: staff[0]._id,
          changedAt: at(-2),
          remarks: 'Reschedule approved',
        });
      }

      if (def.payment === 'payment_submitted') {
        h.push({
          status: 'payment_submitted',
          changedBy: guest._id,
          changedAt: at(0),
          remarks: 'Down payment submitted. Awaiting staff verification.',
        });
      }

      if (def.payment === 'expired') {
        h.push({
          status: 'payment_timeout',
          changedAt: at(0, 1),
          remarks: 'Payment not submitted within 15 minutes',
        });
      }

      booking.statusHistory = h;

      if (['confirmed', 'checked_in'].includes(def.status)) {
        booking.isSlotBlocked = true;
        booking.isActiveConfirmed = true;
      }
      if (def.status === 'pending' && def.payment === 'hold_active') {
        booking.isSlotBlocked = true;
        booking.expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
      }
      if (def.status === 'pending' && def.payment === 'payment_submitted') {
        booking.isSlotBlocked = true;
      }

      if (def.payment === 'full_paid') booking.paymentStatus = 'paid';
      else if (def.payment === 'down_paid') booking.paymentStatus = 'partial';
      else if (def.payment === 'refunded') booking.paymentStatus = 'refunded';
      else if (def.payment === 'payment_submitted') booking.paymentStatus = 'partial';

      booking._paymentsToInsert = paymentsForBooking;
      booking._bookingRef = bookingRef;

      insertedBookings.push(booking);
    }

    // Insert bookings + their payments
    const savedBookings = [];
    for (const b of insertedBookings) {
      const paymentsToInsert = b._paymentsToInsert;
      const bookingRef = b._bookingRef;
      delete b._paymentsToInsert;
      delete b._bookingRef;

      const saved = await Booking.insertMany([b]);
      const savedBooking = saved[0];

      for (const p of paymentsToInsert) {
        await Payment.create({
          booking: savedBooking._id,
          user: savedBooking.user,
          type: p.type,
          amount: p.amount,
          method: p.method,
          referenceNo: `${p.type === 'down_payment' ? 'DP' : 'BAL'}-${bookingRef}`,
          status: p.status,
          verifiedBy: staff[0]._id,
          verifiedAt: p.verifiedAt,
          createdAt: p.submittedAt,
          updatedAt: p.verifiedAt,
        });
      }

      if (
        savedBooking.status === 'cancelled' &&
        savedBooking.paymentStatus === 'refunded'
      ) {
        const totalVerified = paymentsToInsert.reduce(
          (sum, p) => sum + p.amount,
          0
        );
        if (totalVerified > 0) {
          await Payment.create({
            booking: savedBooking._id,
            user: savedBooking.user,
            type: 'refund',
            amount: totalVerified,
            method: paymentsToInsert[0].method,
            referenceNo: `REF-${bookingRef}`,
            status: 'verified',
            verifiedBy: staff[0]._id,
            verifiedAt: new Date(),
          });
        }
      }

      savedBookings.push(savedBooking);
    }

    console.log(`Inserted ${savedBookings.length} bookings`);

    // ---------- ARCHIVES ----------

    const toArchive = [savedBookings[2], savedBookings[3]];
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
      { action: 'confirm_booking',     details: 'Auto-confirmed multiple bookings after payment verification', targetModel: 'bookings' },
      { action: 'verify_payment',      details: 'Verified multiple down and balance payments during setup',    targetModel: 'payments' },
      { action: 'reject_payment',      details: 'Rejected fake reference payments',                            targetModel: 'payments' },
      { action: 'archive_record',      details: 'Archived 2 past bookings and 1 user',                         targetModel: 'bookings' },
      { action: 'approve_cancel',      details: 'Approved 4 cancellations',                                    targetModel: 'bookings' },
      { action: 'issue_refund',        details: 'Issued refunds to 3 cancelled bookings with payments',        targetModel: 'payments' },
      { action: 'approve_reschedule',  details: 'Approved 1 reschedule',                                       targetModel: 'bookings' },
      { action: 'record_cash_payment', details: 'Recorded cash balance payments',                              targetModel: 'payments' },
      { action: 'create_user',         details: 'Added 13 users',                                              targetModel: 'users' },
      { action: 'create_package',      details: 'Added 6 packages',                                            targetModel: 'packages' },
      { action: 'create_booking',      details: 'Added 25 bookings',                                           targetModel: 'bookings' },
      { action: 'update_user',         details: 'Updated guest contact info',                                  targetModel: 'users' },
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

    // ---------- Report ----------

    const counts = {
      users: await User.countDocuments(),
      packages: await Package.countDocuments(),
      bookings: await Booking.countDocuments(),
      payments: await Payment.countDocuments(),
      archives: await Archive.countDocuments(),
      auditlogs: await AuditLog.countDocuments(),
    };

    console.log('\n--- SEED COMPLETE ---');
    console.log(`Users:      ${counts.users}`);
    console.log(`Packages:   ${counts.packages}`);
    console.log(`Bookings:   ${counts.bookings}`);
    console.log(`Payments:   ${counts.payments}`);
    console.log(`Archives:   ${counts.archives}`);
    console.log(`Audit logs: ${counts.auditlogs}`);
    console.log('\nDemo login credentials:');
    console.log('Admin  → admin.bali@yopmail.com  / admin00');
    console.log('Staff  → staff1.bali@yopmail.com / staff00');
    console.log('Guest  → guest1.bali@yopmail.com / guest00');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();