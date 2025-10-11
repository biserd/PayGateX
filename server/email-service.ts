import nodemailer from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"PayGate x402" <${process.env.GMAIL_USER}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export async function sendNewUserNotification(username: string, email: string): Promise<boolean> {
  const adminEmail = 'hello@paygate402.com';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 New User Registration</h1>
        </div>
        <div class="content">
          <p>Hello Admin,</p>
          <p>A new user has registered on PayGate x402!</p>
          
          <div class="info-box">
            <p style="margin: 5px 0;"><strong>Username:</strong> ${username}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>You can view user activity and engagement metrics in the admin dashboard.</p>
          
          <div class="footer">
            <p>PayGate x402 - x402 Payment Required Proxy Platform</p>
            <p>This is an automated notification from your PayGate x402 platform</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
New User Registration - PayGate x402

Username: ${username}
Email: ${email}
Registration Date: ${new Date().toLocaleString()}

You can view user activity and engagement metrics in the admin dashboard.

---
PayGate x402 - x402 Payment Required Proxy Platform
  `;

  return sendEmail({
    to: adminEmail,
    subject: `New User Registration: ${username}`,
    text: textContent,
    html: htmlContent,
  });
}

export async function sendContactFormNotification(
  name: string, 
  email: string, 
  subject: string, 
  message: string
): Promise<boolean> {
  const adminEmail = 'hello@paygate402.com';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">📧 New Contact Form Submission</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You've received a new message from the PayGate x402 contact form.</p>
          
          <div class="info-box">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
            <p style="margin: 5px 0;"><strong>Received:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="message-box">
            <h3 style="margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="margin-top: 20px;">
            <strong>Reply to:</strong> 
            <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
          </p>
          
          <div class="footer">
            <p>PayGate x402 - x402 Payment Required Proxy Platform</p>
            <p>This is an automated notification from your contact form</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
New Contact Form Submission - PayGate x402

Name: ${name}
Email: ${email}
Subject: ${subject}
Received: ${new Date().toLocaleString()}

Message:
${message}

---
Reply to: ${email}
PayGate x402 - x402 Payment Required Proxy Platform
  `;

  return sendEmail({
    to: adminEmail,
    subject: `Contact Form: ${subject}`,
    text: textContent,
    html: htmlContent,
  });
}
