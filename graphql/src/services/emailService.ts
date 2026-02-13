import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const APP_NAME = 'Lone Star Cowboy Church Finance App';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    console.log(`Creating email transporter - Host: ${process.env.SMTP_HOST}, Port: ${process.env.SMTP_PORT}, User: ${process.env.SMTP_USER}`);

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: false,
      maxConnections: 1,
      socketTimeout: 30000,
      greetingTimeout: 15000,
    } as any);
  }
  return transporter;
}

export interface InvitePermission {
  departmentId: string;
  departmentName: string;
  accessLevel: 'VIEW' | 'EDIT' | 'ADMIN';
}

export interface InviteEmailData {
  toEmail: string;
  toName: string;
  invitedByName: string;
  role: string;
  permissions?: InvitePermission[];
}

export async function sendInviteEmail(data: InviteEmailData): Promise<boolean> {
  const { toEmail, toName, invitedByName, role, permissions } = data;

  const isProduction = process.env.NODE_ENV === 'production';
  const appUrl = isProduction
    ? 'https://finapp.lonestarcowboychurch.org'
    : (process.env.APP_URL || 'http://localhost:5173');

  const permissionRows = permissions && permissions.length > 0
    ? permissions.map(p => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${p.departmentName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <span style="background-color: ${p.accessLevel === 'ADMIN' ? '#d32f2f' : p.accessLevel === 'EDIT' ? '#1976d2' : '#2e7d32'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
              ${p.accessLevel}
            </span>
          </td>
        </tr>
      `).join('')
    : '';

  const permissionTable = permissions && permissions.length > 0
    ? `
      <div style="margin: 24px 0;">
        <p style="margin-bottom: 12px; color: #555;"><strong>You have been granted access to:</strong></p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px 12px; background-color: #f5f5f5; color: #666; font-weight: 600;">Department</th>
              <th style="text-align: left; padding: 8px 12px; background-color: #f5f5f5; color: #666; font-weight: 600;">Access Level</th>
            </tr>
          </thead>
          <tbody>
            ${permissionRows}
          </tbody>
        </table>
      </div>
    `
    : '';

  const roleDescription = {
    SUPER_ADMIN: 'Super Administrator (Full System Access)',
    DEPT_ADMIN: 'Department Administrator (Manage assigned departments)',
    USER: 'Standard User (View/Edit approved departments)',
  }[role] || 'Standard User';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f6f8; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: #1a237e; color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
        .content { padding: 40px 30px; }
        .welcome-text { font-size: 18px; color: #1a237e; margin-top: 0; }
        .info-box { background-color: #f8f9fa; border-left: 4px solid #1a237e; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0; }
        .button { 
          display: inline-block; 
          background-color: #1a237e; 
          color: white !important; 
          padding: 14px 30px; 
          text-decoration: none; 
          border-radius: 6px;
          margin: 30px 0;
          font-weight: 600;
          text-align: center;
          box-shadow: 0 2px 4px rgba(26, 35, 126, 0.3);
        }
        .footer { padding: 30px; background-color: #f4f6f8; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #e0e0e0; }
        .steps { margin: 20px 0; padding-left: 20px; }
        .steps li { margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div style="padding: 20px;">
        <div class="container">
          <div class="header">
            <h1>Lone Star Cowboy Church</h1>
            <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">FINANCE APP</div>
          </div>
          <div class="content">
            <h2 class="welcome-text">Welcome, ${toName}!</h2>
            <p>You have been invited by <strong>${invitedByName}</strong> to join the Finance App.</p>
            
            <div class="info-box">
              <div style="margin-bottom: 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Assigned Role</div>
              <div style="font-size: 16px; font-weight: 600; color: #333;">${roleDescription}</div>
            </div>
            
            ${permissionTable}
            
            <h3 style="color: #444; font-size: 16px; margin-top: 30px;">Getting Started:</h3>
            <ol class="steps">
              <li>Click the button below to access the application</li>
              <li>Select <strong>"Sign in with Google"</strong></li>
              <li>Use your <strong>${toEmail}</strong> account</li>
            </ol>
            
            <div style="text-align: center;">
              <a href="${appUrl}" class="button">Access Finance App</a>
            </div>

            <h3 style="color: #444; font-size: 16px; margin-top: 30px;">Install as Desktop App (Optional)</h3>
            <p style="color: #555;">For the best experience, you can install FinApp as a desktop application:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Chrome / Edge:</strong></p>
              <ol style="margin: 0; padding-left: 20px; color: #555;">
                <li>Log in to FinApp using the button above</li>
                <li>Look for the install icon (+) in your browser's address bar</li>
                <li>Click "Install" to add FinApp to your desktop</li>
              </ol>
              
              <p style="margin: 15px 0 10px 0;"><strong>Safari (Mac):</strong></p>
              <ol style="margin: 0; padding-left: 20px; color: #555;">
                <li>Log in to FinApp using the button above</li>
                <li>Go to File → Add to Dock</li>
              </ol>
            </div>

            <p style="font-size: 13px; color: #666;">
              The desktop app launches in its own window, works offline for viewing data, 
              and provides quick access from your desktop or taskbar.
            </p>
            
            <p style="font-size: 13px; color: #666; background-color: #fff3cd; padding: 10px; border-radius: 4px; text-align: center;">
              <strong>Note:</strong> You must sign in with your @lonestarcowboychurch.org Google Workspace account. Personal Gmail accounts will not work.
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Lone Star Cowboy Church. All rights reserved.</p>
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textPermissions = permissions && permissions.length > 0
    ? `\nGRANTED ACCESS:\n${permissions.map(p => `- ${p.departmentName} [${p.accessLevel}]`).join('\n')}\n`
    : '';

  const textContent = `
Welcome to ${APP_NAME}, ${toName}!

You have been invited by ${invitedByName} to join the finance app.

ROLE: ${roleDescription}
${textPermissions}
HOW TO ACCESS:
1. Go to: ${appUrl}
2. Click "Sign in with Google"
3. Use your ${toEmail} account

Note: You must sign in with your @lonestarcowboychurch.org Google Workspace account.

---

INSTALL AS DESKTOP APP (Optional)
For the best experience, you can install FinApp as a desktop application:

Chrome / Edge:
1. Log in to FinApp using the link above
2. Look for the install icon (+) in your browser's address bar
3. Click "Install" to add FinApp to your desktop

Safari (Mac):
1. Log in to FinApp using the link above
2. Go to File → Add to Dock

The desktop app launches in its own window, works offline for viewing data,
and provides quick access from your desktop or taskbar.

---
© ${new Date().getFullYear()} Lone Star Cowboy Church Finance App
  `;

  try {
    const fromAddress = process.env.SMTP_FROM || 'finapp@lonestarcowboychurch.org';
    console.log(`Sending invite email to ${toEmail} from ${fromAddress}`);

    const info = await getTransporter().sendMail({
      from: `"${APP_NAME}" <${fromAddress}>`,
      to: toEmail,
      subject: `You've been invited to ${APP_NAME}`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`Invite email sent to ${toEmail}, messageId: ${info.messageId}, response: ${info.response}`);
    return true;
  } catch (error) {
    console.error('Failed to send invite email:', error);
    return false;
  }
}

export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await getTransporter().verify();
    console.log('Email service connected successfully');
    return true;
  } catch (error) {
    console.error('Email service connection failed:', error);
    return false;
  }
}
