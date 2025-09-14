import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, './.env') });

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
  throw new Error('Missing SMTP environment variables');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT, 10),
  secure: SMTP_SECURE === 'true',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = async (to: string, otp: string, magicLink: string) => {
  const subject = 'Verify your email address';
  const html = `
    <h1>Welcome to VU Auth Portal</h1>
    <p>Please use the following OTP to verify your email address:</p>
    <h2>${otp}</h2>
    <p>Or, click the magic link below to verify:</p>
    <a href="${magicLink}">Verify Email</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(to, subject, html);
};
