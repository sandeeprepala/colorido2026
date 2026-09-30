import express from 'express';
import { requireAuth, requireAdmin, requireVolunteerOrAdmin, optionalAuth } from '../middleware/auth.js';
import { registerRealtimeClient } from '../services/realtimeService.js';

// Controllers
import * as authCtrl from '../controllers/authController.js';
import * as eventsCtrl from '../controllers/eventsController.js';
import * as regCtrl from '../controllers/registrationsController.js';
import * as stallsCtrl from '../controllers/stallsController.js';
import * as lbCtrl from '../controllers/leaderboardsController.js';
import * as discCtrl from '../controllers/discussionController.js';
import * as certCtrl from '../controllers/certificatesController.js';
import * as emailCtrl from '../controllers/emailController.js';
import * as adminCtrl from '../controllers/adminController.js';
import * as chatCtrl from '../controllers/chatController.js';

const router = express.Router();

// Realtime SSE endpoint
router.get('/realtime/events', registerRealtimeClient);

// Auth
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', requireAuth, authCtrl.getMe);
router.put('/auth/profile', requireAuth, authCtrl.updateProfile);

// Events (Volunteer + Admin can create, edit, delete events)
router.get('/events', eventsCtrl.getEvents);
router.get('/events/:id', optionalAuth, eventsCtrl.getEventById);
router.post('/events', requireVolunteerOrAdmin, eventsCtrl.createEvent);
router.put('/events/:id', requireVolunteerOrAdmin, eventsCtrl.updateEvent);
router.delete('/events/:id', requireVolunteerOrAdmin, eventsCtrl.deleteEvent);

// Registrations (Volunteer + Admin can view and update registration status)
router.post('/events/:eventId/register', requireAuth, regCtrl.registerForEvent);
router.get('/registrations/my', requireAuth, regCtrl.getMyRegistrations);
router.get('/registrations/verify/:token', regCtrl.verifyQrToken); // Public QR scan verify
router.get('/registrations/:id', requireAuth, regCtrl.getRegistrationById);
router.get('/admin/registrations', requireVolunteerOrAdmin, regCtrl.getAdminRegistrations);
router.put('/admin/registrations/:id/status', requireVolunteerOrAdmin, regCtrl.updateRegistrationStatus);
router.delete('/registrations/:id', requireAuth, regCtrl.cancelRegistration);

// Volunteer Gate Check-In & Attendee Roster
router.post('/volunteer/checkin', requireVolunteerOrAdmin, regCtrl.checkInAttendee);
router.get('/volunteer/attendees', requireVolunteerOrAdmin, regCtrl.getVolunteerAttendees);

// Stalls (STRICTLY Admin Only - Volunteer has no access)
router.get('/stalls', optionalAuth, stallsCtrl.getStalls);
router.post('/stalls/apply', requireAuth, stallsCtrl.applyForStall);
router.get('/stalls/my', requireAuth, stallsCtrl.getMyStallApplications);
router.get('/admin/stalls/applications', requireAdmin, stallsCtrl.getAllStallApplications);
router.put('/admin/stalls/applications/:id/status', requireAdmin, stallsCtrl.reviewStallApplication);
router.put('/admin/stalls/:stallId', requireAdmin, stallsCtrl.updateStallAdmin);

// Leaderboards (Volunteer + Admin can create & update leaderboards/scores)
router.get('/leaderboards', lbCtrl.getAllLeaderboards);
router.get('/leaderboards/:eventId', lbCtrl.getLeaderboardByEvent);
router.post('/admin/leaderboards', requireVolunteerOrAdmin, lbCtrl.createLeaderboard);
router.put('/admin/leaderboards/:id/status', requireVolunteerOrAdmin, lbCtrl.updateLeaderboardStatus);
router.put('/admin/leaderboards/:id/entry', requireVolunteerOrAdmin, lbCtrl.saveLeaderboardEntry);
router.put('/admin/leaderboards/:id/teams/:entryId/points', requireVolunteerOrAdmin, lbCtrl.adjustLeaderboardPoints);
router.delete('/admin/leaderboards/:id/entry/:entryId', requireVolunteerOrAdmin, lbCtrl.deleteLeaderboardEntry);
router.put('/volunteer/leaderboards/:id/status', requireVolunteerOrAdmin, lbCtrl.updateLeaderboardStatus);
router.put('/volunteer/leaderboards/:id/entry', requireVolunteerOrAdmin, lbCtrl.saveLeaderboardEntry);
router.put('/volunteer/leaderboards/:id/teams/:entryId/points', requireVolunteerOrAdmin, lbCtrl.adjustLeaderboardPoints);

// Discussion (Delete message is STRICTLY Admin Only)
router.get('/discussion', discCtrl.getDiscussion);
router.post('/discussion', requireAuth, discCtrl.postMessage);
router.delete('/admin/discussion/:id', requireAdmin, discCtrl.deleteMessage);

// Certificates (Volunteer + Admin can view and generate certificates)
router.get('/certificates/my', requireAuth, certCtrl.getMyCertificates);
router.get('/certificates/verify/:certificateId', certCtrl.verifyCertificate); // Public verify
router.get('/admin/certificates', requireVolunteerOrAdmin, certCtrl.getAllAdminCertificates);
router.post('/admin/certificates/generate', requireVolunteerOrAdmin, certCtrl.generateCertificates);

// Email Broadcast (Volunteer + Admin can send broadcasts and view email logs)
router.post('/admin/email/send', requireVolunteerOrAdmin, emailCtrl.sendBroadcast);
router.get('/admin/email/logs', requireVolunteerOrAdmin, emailCtrl.getEmailLogs);
router.get('/email/inbox/my', requireAuth, emailCtrl.getMyInbox);

// Admin dashboard overview
router.get('/admin/stats', requireAdmin, adminCtrl.getAdminStats);

// RAG Chatbot
router.post('/chat', chatCtrl.handleChatMessage);
router.post('/admin/chat/sync', requireAdmin, chatCtrl.reindexRag);

// Cloudinary Public Config (exposes cloud name for CDN delivery)
router.get('/config/cloudinary', (req, res) => {
  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  });
});

export default router;
