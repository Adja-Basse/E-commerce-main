const nodemailer = require('nodemailer');
const logger = require('../../../../shared/utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  async init() {
    try {
      // Create Ethereal Test Account if config is not provided
      // In production, use env vars
      const host = process.env.EMAIL_HOST;
      const port = process.env.EMAIL_PORT;
      const user = process.env.EMAIL_USER;
      const pass = process.env.EMAIL_PASS;

      if (!host || !user) {
        // Fallback to generating a test account
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        logger.info('Email Service initialized with Ethereal Test Account:', {
          user: testAccount.user,
          pass: testAccount.pass
        });
      } else {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port == 465,
          auth: { user, pass }
        });
        logger.info('Email Service initialized with Config');
      }
    } catch (error) {
      logger.error('Failed to initialize Email Service:', error);
    }
  }

  async sendEmail(to, subject, text, html) {
    if (!this.transporter) await this.init();

    try {
      const info = await this.transporter.sendMail({
        from: '"Ecommerce Backend" <no-reply@ecommerce.com>',
        to,
        subject,
        text,
        html
      });

      logger.info('Email sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      logger.info('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      // Don't throw, just log
    }
  }

  async sendWelcomeEmail(userData) {
    const subject = 'Welcome to Ecommerce App!';
    const text = `Hello ${userData.firstName}, welcome to our platform!`;
    const html = `<h1>Welcome ${userData.firstName}!</h1><p>We are glad to have you.</p>`;
    return this.sendEmail(userData.email, subject, text, html);
  }

  async sendOrderConfirmationEmail(orderData) {
    const subject = `Order Confirmation #${orderData.orderNumber}`;
    const text = `Your order of ${orderData.totalAmount} has been confirmed.`;
    const html = `<h1>Order Confirmed</h1><p>Order #${orderData.orderNumber}</p><p>Total: ${orderData.totalAmount}</p>`;
    // Note: User Email is usually in orderData or needs to be fetched. 
    // Usually events contain ample data. We'll assume email is passed or we'd need to look it up.
    // Simplifying assumption: event data has userEmail or we skip for now.
    // For this POC, let's log if email is missing.
    if (orderData.userEmail) {
        return this.sendEmail(orderData.userEmail, subject, text, html);
    } else {
        logger.warn('No email found in order data, skipping email');
    }
  }
}

module.exports = new EmailService();
