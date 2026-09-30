import { db } from '../data/db.js';
import { sendBroadcastEmail } from '../services/emailService.js';

export const sendBroadcast = async (req, res) => {
  try {
    const { event_id, subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message body are required.' });
    }

    let recipients = [];
    let eventName = 'All Festival Participants';

    if (event_id && event_id !== 'all') {
      const event = db.getEventById(event_id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found.' });
      }
      eventName = event.name;
      const regs = db.getEventRegistrations(event_id).filter((r) => r.status !== 'cancelled');
      recipients = regs.map((r) => ({ email: r.student_email, name: r.student_name }));
    } else {
      // All registered students across events
      const regs = db.getAllRegistrations().filter((r) => r.status !== 'cancelled');
      const emailMap = new Map();
      regs.forEach((r) => {
        if (!emailMap.has(r.student_email.toLowerCase())) {
          emailMap.set(r.student_email.toLowerCase(), { email: r.student_email, name: r.student_name });
        }
      });
      // Also add registered user accounts
      db.getAllUsers()
        .filter((u) => u.role === 'student')
        .forEach((u) => {
          if (!emailMap.has(u.email.toLowerCase())) {
            emailMap.set(u.email.toLowerCase(), { email: u.email, name: u.name });
          }
        });
      recipients = Array.from(emailMap.values());
    }

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients found for this broadcast target.' });
    }

    const logs = await sendBroadcastEmail({
      toList: recipients,
      eventName,
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.json({
      message: `Email sent successfully to ${recipients.length} participant(s).`,
      recipientCount: recipients.length,
      logsCount: logs.length,
    });
  } catch (err) {
    console.error('sendBroadcast error:', err);
    return res.status(500).json({ error: 'Failed to broadcast email.' });
  }
};

export const getEmailLogs = async (req, res) => {
  try {
    const logs = db.getAllEmailLogs();
    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve email logs.' });
  }
};

export const getMyInbox = async (req, res) => {
  try {
    const logs = db.getUserEmailLogs(req.user.email);
    return res.json({ emails: logs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch your festival inbox.' });
  }
};

export const sendTestEmail = async (req, res) => {
  try {
    const targetEmail = req.body.to || req.user?.email;
    if (!targetEmail) {
      return res.status(400).json({ error: 'Recipient email address is required.' });
    }

    const testRecord = await sendEmail({
      to: targetEmail,
      recipientName: req.user?.name || 'Festival Participant',
      subject: "🎉 COLORIDO '26: Test Email Notification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; background: #FAF8F5; padding: 24px; border-radius: 12px; border: 2px solid #121217;">
          <h2 style="color: #E91E63; margin-top: 0;">COLORIDO '26 Email System Working!</h2>
          <p>Hello <strong>${req.user?.name || 'Participant'}</strong>,</p>
          <p>This is a live test verifying that festival updates, entry passes, and achievement certificates will be delivered directly to your inbox.</p>
          <div style="background: #121217; color: white; padding: 12px 20px; border-radius: 8px; font-weight: bold; text-align: center; margin: 20px 0;">
            ✓ SMTP Dispatch Verified &amp; Active
          </div>
          <p style="font-size: 11px; color: #777;">Sent by COLORIDO '26 Festival Organizing Committee.</p>
        </div>
      `,
      text: "COLORIDO '26 Email System is operational. Test notification delivered successfully.",
      type: 'test_notification',
    });

    return res.json({
      message: `Test email sent to ${targetEmail}`,
      status: testRecord.status,
      log: testRecord,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send test email: ' + err.message });
  }
};
