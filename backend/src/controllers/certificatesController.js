import { v4 as uuidv4 } from 'uuid';
import { db } from '../data/db.js';
import { sendCertificateEmail } from '../services/emailService.js';

export const getMyCertificates = async (req, res) => {
  try {
    const certs = db.getUserCertificates(req.user.id, req.user.email);
    return res.json({ certificates: certs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve certificates.' });
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const cert = db.getCertificateById(certificateId);

    if (!cert) {
      return res.status(404).json({
        verified: false,
        error: 'Certificate not found. This certificate ID is not in our authentic festival registry.',
      });
    }

    return res.json({
      verified: true,
      certificate_id: cert.certificate_id,
      participant_name: cert.participant_name,
      participant_email: cert.participant_email,
      event_name: cert.event_name,
      achievement: cert.achievement,
      issued_date: cert.issued_date,
      organizer_signature: cert.organizer_signature,
      status: 'AUTHENTIC & VERIFIED',
    });
  } catch (err) {
    return res.status(500).json({ verified: false, error: 'Verification error.' });
  }
};

export const generateCertificates = async (req, res) => {
  try {
    const { event_id, participant_id, achievement } = req.body;

    if (!event_id) {
      return res.status(400).json({ error: 'Event ID is required.' });
    }

    const event = db.getEventById(event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    let targetRegistrations = db.getEventRegistrations(event_id).filter(
      (r) => r.status !== 'cancelled'
    );

    if (participant_id && participant_id !== 'all') {
      targetRegistrations = targetRegistrations.filter(
        (r) => r.student_id === participant_id || r.id === participant_id || r.registration_id === participant_id
      );
    }

    if (targetRegistrations.length === 0) {
      return res.status(400).json({ error: 'No eligible participants found for certificate generation.' });
    }

    const generated = [];
    const today = new Date().toISOString().split('T')[0];

    for (const reg of targetRegistrations) {
      // Check if certificate already exists
      const existing = db.getAllCertificates().find(
        (c) => c.registration_id === reg.id || (c.participant_email === reg.student_email && c.event_id === event.id)
      );

      if (existing) {
        generated.push(existing);
        continue;
      }

      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const certId = `CERT-COL26-${randomSuffix}`;

      const certRecord = {
        id: 'cert-' + uuidv4(),
        certificate_id: certId,
        registration_id: reg.id,
        event_id: event.id,
        event_name: event.name,
        participant_name: reg.student_name,
        participant_email: reg.student_email,
        achievement: achievement || 'Certificate of Active Participation & Excellence',
        issued_date: today,
        organizer_signature: `${event.contact_name || 'Festival Convener'} & Cultural Dean`,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      db.createCertificate(certRecord);
      generated.push(certRecord);

      // Trigger automatic email dispatch with verification link
      sendCertificateEmail(certRecord).catch((e) =>
        console.warn('Certificate email error:', e.message)
      );
    }

    return res.status(201).json({
      message: `Successfully generated and dispatched ${generated.length} certificate(s)!`,
      count: generated.length,
      certificates: generated,
    });
  } catch (err) {
    console.error('generateCertificates error:', err);
    return res.status(500).json({ error: 'Failed to generate certificates.' });
  }
};

export const getAllAdminCertificates = async (req, res) => {
  try {
    const certs = db.getAllCertificates();
    return res.json({ certificates: certs });
  } catch (err) {
    console.error('getAllAdminCertificates error:', err);
    return res.status(500).json({ error: 'Failed to retrieve certificates.' });
  }
};
