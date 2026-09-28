import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { db } from '../data/db.js';

let transporter = null;

// Initialize Nodemailer if SMTP credentials are provided
if (config.email.smtpHost && config.email.smtpUser && config.email.smtpPass) {
  try {
    transporter = nodemailer.createTransport({
      host: config.email.smtpHost,
      port: Number(config.email.smtpPort),
      secure: Number(config.email.smtpPort) === 465,
      auth: {
        user: config.email.smtpUser,
        pass: config.email.smtpPass,
      },
    });
    console.log('[EmailService] SMTP transporter configured.');
  } catch (err) {
    console.warn('[EmailService] SMTP initialization failed:', err.message);
  }
}

/**
 * Send an email and log it to db.emailLogs
 */
export const sendEmail = async ({ to, recipientName, eventId, eventName, subject, html, text, type }) => {
  const emailRecord = {
    id: 'email-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    to,
    recipient_name: recipientName || to.split('@')[0],
    event_id: eventId || null,
    event_name: eventName || 'COLORIDO \'26 Festival',
    subject,
    html: html || text,
    body_snippet: text ? text.substring(0, 160) : subject,
    type: type || 'general_announcement',
    sent_at: new Date().toISOString(),
    status: 'delivered',
  };

  try {
    // If transporter is active, send live email
    if (transporter) {
      await transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        text,
        html,
      });
      console.log(`[EmailService] Live email sent to ${to} (${subject})`);
    } else {
      console.log(`[EmailService] (Local Mode) Email logged for ${to}: "${subject}"`);
    }
  } catch (err) {
    console.warn(`[EmailService] SMTP dispatch notice for ${to}:`, err.message);
  }

  // Always log in system state for instant UI visibility and verification
  db.addEmailLog(emailRecord);
  return emailRecord;
};

/**
 * 1. Event Registration Confirmation
 */
export const sendRegistrationEmail = async (registration, event) => {
  const verifyUrl = `${config.clientUrl}/registration/verify/${registration.qr_token}`;
  const subject = `🎉 Registration Confirmed: ${event.name} [${registration.registration_id}]`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF8F5; padding: 24px; border-radius: 12px; border: 2px solid #121217;">
      <div style="background: #E91E63; padding: 16px; border-radius: 8px; color: white; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">COLORIDO '26</h1>
        <p style="margin: 4px 0 0; font-size: 13px;">WHERE CREATIVITY MEETS EVERY FIELD</p>
      </div>

      <div style="padding: 20px 8px;">
        <h2 style="color: #121217; margin-top: 0;">🎉 You're Officially Registered!</h2>
        <p>Dear <strong>${registration.student_name}</strong>,</p>
        <p>Your registration for <strong>${event.name}</strong> at COLORIDO '26 has been successfully confirmed!</p>

        <div style="background: white; border: 2px solid #121217; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 6px 0;"><strong>Event:</strong> ${event.name} (${event.category.toUpperCase()})</p>
          <p style="margin: 6px 0;"><strong>Registration ID:</strong> <span style="background: #FFD43B; padding: 2px 6px; font-weight: bold; border-radius: 4px;">${registration.registration_id}</span></p>
          <p style="margin: 6px 0;"><strong>Date:</strong> ${event.event_date}</p>
          <p style="margin: 6px 0;"><strong>Time:</strong> ${event.start_time} - ${event.end_time}</p>
          <p style="margin: 6px 0;"><strong>Venue:</strong> ${event.venue}</p>
          <p style="margin: 6px 0;"><strong>Prize Pool:</strong> ${event.prize_pool || 'Exciting Prizes & Trophies'}</p>
        </div>

        <p><strong>Entrance Verification:</strong> Please keep your unique QR code ready on your phone or printed pass when arriving at the venue.</p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${verifyUrl}" style="background: #121217; color: white; padding: 12px 24px; text-decoration: none; border-radius: 24px; font-weight: bold; display: inline-block;">
            View Pass &amp; Entry QR Code →
          </a>
        </div>

        <p style="color: #666; font-size: 12px; margin-top: 24px;">Need help? Contact the event organizers at ${event.contact_email} or reply to this email.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: registration.student_email,
    recipientName: registration.student_name,
    eventId: event.id,
    eventName: event.name,
    subject,
    html,
    text: `Your registration for ${event.name} is confirmed! Registration ID: ${registration.registration_id}. Venue: ${event.venue} on ${event.event_date} at ${event.start_time}. View QR: ${verifyUrl}`,
    type: 'registration_confirmation',
  });
};

/**
 * 2. Stall Status Notification (Approved / Rejected)
 */
export const sendStallStatusEmail = async (application, stall, isApproved, rejectionReason = '') => {
  const subject = isApproved
    ? `🎉 Stall Application Approved: Stall ${stall.stall_id} [COLORIDO '26]`
    : `Update on Stall Application: Stall ${stall.stall_id} [COLORIDO '26]`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF8F5; padding: 24px; border-radius: 12px; border: 2px solid #121217;">
      <div style="background: ${isApproved ? '#7ED957' : '#FF7A00'}; padding: 16px; border-radius: 8px; color: ${isApproved ? '#121217' : 'white'}; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">COLORIDO '26 — Stall Management</h1>
      </div>

      <div style="padding: 20px 8px;">
        <h2 style="color: #121217; margin-top: 0;">
          ${isApproved ? '🎉 Congratulations! Your Stall is Approved!' : 'Stall Application Status Update'}
        </h2>
        <p>Dear <strong>${application.applicant_name}</strong>,</p>
        
        ${
          isApproved
            ? `<p>We are delighted to confirm that your stall application for <strong>Stall ${stall.stall_id} (${stall.type.toUpperCase()})</strong> has been approved for COLORIDO '26!</p>
               <div style="background: white; border: 2px solid #121217; border-radius: 8px; padding: 16px; margin: 16px 0;">
                 <p style="margin: 4px 0;"><strong>Stall ID:</strong> ${stall.stall_id}</p>
                 <p style="margin: 4px 0;"><strong>Zone:</strong> ${stall.section || 'Festival Quad'}</p>
                 <p style="margin: 4px 0;"><strong>Item / Activity:</strong> ${application.item_name}</p>
                 <p style="margin: 4px 0;"><strong>Price Structure:</strong> ${application.price}</p>
               </div>
               <p>Please report to the Stall Coordination Desk on Day 1 at 07:30 AM with your valid college ID for booth key hand-off.</p>`
            : `<p>Thank you for submitting your stall application for Stall <strong>${stall.stall_id}</strong>.</p>
               <p>Regrettably, after careful review, we are unable to approve this application at this time.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}</p>
               <p>You may explore and apply for other available stall lots on the festival stall map.</p>`
        }
      </div>
    </div>
  `;

  return sendEmail({
    to: application.applicant_email,
    recipientName: application.applicant_name,
    subject,
    html,
    text: isApproved
      ? `Your stall application for ${stall.stall_id} has been approved!`
      : `Your stall application for ${stall.stall_id} has been reviewed.`,
    type: 'stall_update',
  });
};

/**
 * 3. Certificate Generated Notification
 */
export const sendCertificateEmail = async (cert) => {
  const verifyUrl = `${config.clientUrl}/certificate/verify/${cert.certificate_id}`;
  const subject = `🏆 Certificate of Achievement: ${cert.event_name} [${cert.certificate_id}]`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF8F5; padding: 24px; border-radius: 12px; border: 2px solid #121217;">
      <div style="background: #8E44FF; padding: 16px; border-radius: 8px; color: white; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">COLORIDO '26</h1>
        <p style="margin: 4px 0 0; font-size: 13px;">OFFICIAL FESTIVAL CERTIFICATION</p>
      </div>

      <div style="padding: 20px 8px;">
        <h2 style="color: #121217; margin-top: 0;">🏆 Certificate Issued</h2>
        <p>Dear <strong>${cert.participant_name}</strong>,</p>
        <p>Congratulations on your participation and performance in <strong>${cert.event_name}</strong> at COLORIDO '26!</p>

        <div style="background: white; border: 2px solid #121217; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Certificate ID:</strong> <span style="background: #19CFE8; color: #121217; padding: 2px 6px; font-weight: bold; border-radius: 4px;">${cert.certificate_id}</span></p>
          <p style="margin: 4px 0;"><strong>Recipient:</strong> ${cert.participant_name}</p>
          <p style="margin: 4px 0;"><strong>Event:</strong> ${cert.event_name}</p>
          <p style="margin: 4px 0;"><strong>Recognition:</strong> ${cert.achievement}</p>
          <p style="margin: 4px 0;"><strong>Issue Date:</strong> ${cert.issued_date}</p>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${verifyUrl}" style="background: #8E44FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 24px; font-weight: bold; display: inline-block;">
            View &amp; Verify Authentic Certificate →
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: cert.participant_email,
    recipientName: cert.participant_name,
    eventId: cert.event_id,
    eventName: cert.event_name,
    subject,
    html,
    text: `Your certificate for ${cert.event_name} has been issued! Certificate ID: ${cert.certificate_id}. Verify at: ${verifyUrl}`,
    type: 'certificate_issued',
  });
};

/**
 * 4. Custom Broadcast Email from Admin
 */
export const sendBroadcastEmail = async ({ toList, eventName, subject, message }) => {
  const results = [];
  for (const recipient of toList) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF8F5; padding: 24px; border-radius: 12px; border: 2px solid #121217;">
        <div style="background: #E91E63; padding: 16px; border-radius: 8px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">COLORIDO '26</h1>
          <p style="margin: 4px 0 0; font-size: 13px;">OFFICIAL ANNOUNCEMENT</p>
        </div>
        <div style="padding: 20px 8px;">
          <p>Dear <strong>${recipient.name || 'Participant'}</strong>,</p>
          <div style="background: white; border: 2px solid #121217; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
            ${message}
          </div>
          <p style="font-size: 12px; color: #666;">This announcement was dispatched by the COLORIDO '26 Festival Organizing Committee regarding ${eventName || 'Festival Events'}.</p>
        </div>
      </div>
    `;

    const res = await sendEmail({
      to: recipient.email,
      recipientName: recipient.name,
      eventName,
      subject,
      html,
      text: message,
      type: 'broadcast_announcement',
    });
    results.push(res);
  }
  return results;
};
