import nodemailer from 'nodemailer';

const APP_NAME = 'Lone Star Cowboy Church Finance App';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface InviteEmailData {
  toEmail: string;
  toName: string;
  invitedByName: string;
  role: string;
  departments?: string[];
}

export async function sendInviteEmail(data: InviteEmailData): Promise<boolean> {
  const { toEmail, toName, invitedByName, role, departments } = data;

  const departmentList = departments && departments.length > 0
    ? `<p><strong>You have been granted access to:</strong></p>
       <ul>${departments.map(d => `<li>${d}</li>`).join('')}</ul>`
    : '';

  const roleDescription = {
    SUPER_ADMIN: 'Super Administrator (full access to all features)',
    DEPT_ADMIN: 'Department Administrator (can manage assigned departments)',
    USER: 'User (can view and enter transactions for assigned departments)',
  }[role] || 'User';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { 
          display: inline-block; 
          background-color: #1976d2; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer { padding: 20px; font-size: 12px; color: #666; text-align: center; }
        ul { margin: 10px 0; padding-left: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${APP_NAME}</h1>
        </div>
        <div class="content">
          <h2>Welcome, ${toName}!</h2>
          <p>You have been invited by <strong>${invitedByName}</strong> to join the ${APP_NAME}.</p>
          
          <p><strong>Your role:</strong> ${roleDescription}</p>
          
          ${departmentList}
          
          <h3>How to Access the App:</h3>
          <ol>
            <li>Click the button below to go to the app</li>
            <li>Click "Sign in with Google"</li>
            <li>Use your <strong>${toEmail}</strong> Google Workspace account to sign in</li>
            <li>You'll automatically be granted access based on your assigned role</li>
          </ol>
          
          <p style="text-align: center;">
            <a href="${APP_URL}" class="button">Access Finance App</a>
          </p>
          
          <p><strong>Important:</strong> You must sign in with your <strong>@lonestarcowboychurch.org</strong> Google Workspace account. Personal Gmail accounts will not work.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from ${APP_NAME}.</p>
          <p>If you did not expect this invitation, please contact your administrator.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Welcome to ${APP_NAME}, ${toName}!

You have been invited by ${invitedByName} to join the finance app.

Your role: ${roleDescription}

${departments && departments.length > 0 ? `You have been granted access to:\n${departments.map(d => `- ${d}`).join('\n')}\n` : ''}

How to Access the App:
1. Go to: ${APP_URL}
2. Click "Sign in with Google"
3. Use your ${toEmail} Google Workspace account to sign in
4. You'll automatically be granted access based on your assigned role

Important: You must sign in with your @lonestarcowboychurch.org Google Workspace account. Personal Gmail accounts will not work.

---
This is an automated message from ${APP_NAME}.
If you did not expect this invitation, please contact your administrator.
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `You've been invited to ${APP_NAME}`,
      text: textContent,
      html: htmlContent,
    });
    
    console.log(`Invite email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send invite email:', error);
    return false;
  }
}

export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email service connected successfully');
    return true;
  } catch (error) {
    console.error('Email service connection failed:', error);
    return false;
  }
}
