const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Check if SMTP environment variables are defined
  const isSmtpConfigured =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (isSmtpConfigured) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const message = {
      from: `${process.env.FROM_NAME || 'JobBoard'} <${process.env.FROM_EMAIL || 'no-reply@jobboard.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message
    };

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } else {
    // Simulated fallback
    console.log('========================================================================');
    console.log(`[SMTP MOCK] Simulated Email Sent Successful!`);
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.message}`);
    console.log('========================================================================');
  }
};

module.exports = sendEmail;
