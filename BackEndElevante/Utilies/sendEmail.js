// utils/sendEmail.js
import nodemailer from 'nodemailer';

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    secure: true,
    tls: { rejectUnauthorized: false },
  });

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"Elevante Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text:  html.replace(/<[^>]*>/g, ''),
    };
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email error:', error.message);
    throw new Error(`Email send failed: ${error.message}`);
  }
};
export default sendEmail;
