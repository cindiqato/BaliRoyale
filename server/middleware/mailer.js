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

// Verify connection on startup — silent on success
transporter.verify((err) => {
  if (err) {
    console.log('SMTP connection error:', err.message);
  }
});

const sendBookingEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Bali Royale" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
};

module.exports = sendBookingEmail;