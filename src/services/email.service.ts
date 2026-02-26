import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBookingEmails = async (booking: any) => {

  const html = `
    <h2>Booking Confirmed</h2>
    <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
    <p><strong>Date:</strong> ${booking.bookingDate}</p>
    <p><strong>Amount:</strong> ₹${booking.totalAmount}</p>
  `;

  // Customer email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: booking.email,
    subject: "Booking Confirmed",
    html,
  });

  // Admin email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: "New Booking Received",
    html,
  });
};