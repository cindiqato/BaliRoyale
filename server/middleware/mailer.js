const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

if (!GMAIL_USER || !GMAIL_PASS) {
  console.log('WARNING: GMAIL_USER or GMAIL_PASS not set in .env');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

// Verify connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.log('SMTP connection error:', err.message);
  } else {
    console.log('SMTP ready — emails can be sent');
  }
});

const sendBookingEmail = async ({ to, subject, html }) => {
  console.log('--- sendBookingEmail called ---');
  console.log('  to:', to);
  console.log('  subject:', subject);

  try {
    const info = await transporter.sendMail({
      from: `"Bali Royale" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent:', info.response);
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
};

module.exports = sendBookingEmail;