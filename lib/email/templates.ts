/**
 * Email Templates
 * Reusable email templates for various use cases
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Booking Confirmation Email Template
 */
export function getBookingConfirmationTemplate(data: {
  name: string;
  date: string;
  time: string;
  meetingType: string;
  meetingLink?: string;
  phoneNumber?: string;
}): EmailTemplate {
  const { name, date, time, meetingType, meetingLink, phoneNumber } = data;
  
  return {
    subject: `Booking Confirmed: ${meetingType} Meeting on ${date}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #0066cc; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      <p>Your meeting has been confirmed. Here are the details:</p>
      <div class="details">
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Type:</strong> ${meetingType}</p>
        ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
        ${phoneNumber ? `<p><strong>Phone:</strong> ${phoneNumber}</p>` : ''}
      </div>
      ${meetingLink ? `<a href="${meetingLink}" class="button">Join Meeting</a>` : ''}
      <p>If you need to reschedule or cancel, please contact us at support@aias-platform.com</p>
    </div>
    <div class="footer">
      <p>AIAS Platform - AI Automation Solutions</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `
Booking Confirmed!

Hi ${name},

Your meeting has been confirmed. Here are the details:

Date: ${date}
Time: ${time}
Type: ${meetingType}
${meetingLink ? `Meeting Link: ${meetingLink}` : ''}
${phoneNumber ? `Phone: ${phoneNumber}` : ''}

${meetingLink ? `Join Meeting: ${meetingLink}` : ''}

If you need to reschedule or cancel, please contact us at support@aias-platform.com

---
AIAS Platform - AI Automation Solutions
This is an automated email. Please do not reply.
    `.trim(),
  };
}

/**
 * Lead Generation PDF Email Template
 */
export function getLeadGenPDFTemplate(data: {
  name: string;
  pdfUrl?: string;
}): EmailTemplate {
  const { name, pdfUrl } = data;
  
  return {
    subject: 'Your Free System Prompts Guide is Ready!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Guide is Ready!</h1>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      <p>Thank you for your interest! Your free <strong>Master System Prompts Guide</strong> is ready for download.</p>
      <p>This comprehensive 10-page guide covers:</p>
      <ul>
        <li>Understanding system prompts</li>
        <li>Best practices and patterns</li>
        <li>Advanced techniques</li>
        <li>Workflow automation prompts</li>
        <li>Security and compliance</li>
        <li>And much more!</li>
      </ul>
      ${pdfUrl ? `<a href="${pdfUrl}" class="button">Download Your Guide</a>` : '<p><strong>Your PDF is attached to this email.</strong></p>'}
      <p>If you have any questions, feel free to reply to this email or visit our help center.</p>
      <p>Happy automating!</p>
    </div>
    <div class="footer">
      <p>AIAS Platform - AI Automation Solutions</p>
      <p>This is an automated email. You can reply if you have questions.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `
Your Guide is Ready!

Hi ${name},

Thank you for your interest! Your free Master System Prompts Guide is ready for download.

This comprehensive 10-page guide covers:
- Understanding system prompts
- Best practices and patterns
- Advanced techniques
- Workflow automation prompts
- Security and compliance
- And much more!

${pdfUrl ? `Download: ${pdfUrl}` : 'Your PDF is attached to this email.'}

If you have any questions, feel free to reply to this email or visit our help center.

Happy automating!

---
AIAS Platform - AI Automation Solutions
    `.trim(),
  };
}

/**
 * Welcome Email Template
 */
export function getWelcomeEmailTemplate(data: {
  name: string;
  loginUrl: string;
}): EmailTemplate {
  const { name, loginUrl } = data;
  
  return {
    subject: 'Welcome to AIAS Platform!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to AIAS Platform!</h1>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      <p>Welcome to AIAS Platform! We're excited to have you on board.</p>
      <p>Get started by exploring our features:</p>
      <ul>
        <li>Build AI workflows</li>
        <li>Create custom automations</li>
        <li>Integrate with your favorite tools</li>
        <li>Scale your business with AI</li>
      </ul>
      <a href="${loginUrl}" class="button">Get Started</a>
      <p>If you have any questions, our support team is here to help!</p>
    </div>
    <div class="footer">
      <p>AIAS Platform - AI Automation Solutions</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `
Welcome to AIAS Platform!

Hi ${name},

Welcome to AIAS Platform! We're excited to have you on board.

Get started by exploring our features:
- Build AI workflows
- Create custom automations
- Integrate with your favorite tools
- Scale your business with AI

Get Started: ${loginUrl}

If you have any questions, our support team is here to help!

---
AIAS Platform - AI Automation Solutions
    `.trim(),
  };
}

/**
 * Password Reset Email Template
 */
export function getPasswordResetTemplate(data: {
  name: string;
  resetUrl: string;
  expiresIn: string;
}): EmailTemplate {
  const { name, resetUrl, expiresIn } = data;
  
  return {
    subject: 'Reset Your Password',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <div class="warning">
        <p><strong>Important:</strong> This link will expire in ${expiresIn}.</p>
        <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
      </div>
    </div>
    <div class="footer">
      <p>AIAS Platform - AI Automation Solutions</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `
Password Reset Request

Hi ${name},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

Important: This link will expire in ${expiresIn}.

If you didn't request this, please ignore this email or contact support if you have concerns.

---
AIAS Platform - AI Automation Solutions
This is an automated email. Please do not reply.
    `.trim(),
  };
}
