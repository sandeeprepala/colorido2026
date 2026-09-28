import express from 'express';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
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

const router = express.Router();

// Realtime SSE endpoint
router.get('/realtime/events', registerRealtimeClient);

// Auth
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', requireAuth, authCtrl.getMe);
router.put('/auth/profile', requireAuth, authCtrl.updateProfile);

// Events
router.get('/events', eventsCtrl.getEvents);
router.get('/events/:id', optionalAuth, eventsCtrl.getEventById);
router.post('/events', requireAdmin, eventsCtrl.createEvent);
router.put('/events/:id', requireAdmin, eventsCtrl.updateEvent);
router.delete('/events/:id', requireAdmin, eventsCtrl.deleteEvent);

// Registrations
router.post('/events/:eventId/register', requireAuth, regCtrl.registerForEvent);
router.get('/registrations/my', requireAuth, regCtrl.getMyRegistrations);
router.get('/registrations/verify/:token', regCtrl.verifyQrToken); // Public QR scan verify
router.get('/registrations/:id', requireAuth, regCtrl.getRegistrationById);
router.get('/admin/registrations', requireAdmin, regCtrl.getAdminRegistrations);
router.put('/admin/registrations/:id/status', requireAdmin, regCtrl.updateRegistrationStatus);
router.delete('/registrations/:id', requireAuth, regCtrl.cancelRegistration);

// Stalls
router.get('/stalls', optionalAuth, stallsCtrl.getStalls);
router.post('/stalls/apply', requireAuth, stallsCtrl.applyForStall);
router.get('/stalls/my', requireAuth, stallsCtrl.getMyStallApplications);
router.get('/admin/stalls/applications', requireAdmin, stallsCtrl.getAllStallApplications);
router.put('/admin/stalls/applications/:id/status', requireAdmin, stallsCtrl.reviewStallApplication);
router.put('/admin/stalls/:stallId', requireAdmin, stallsCtrl.updateStallAdmin);

// Leaderboards
router.get('/leaderboards', lbCtrl.getAllLeaderboards);
router.get('/leaderboards/:eventId', lbCtrl.getLeaderboardByEvent);
router.post('/admin/leaderboards', requireAdmin, lbCtrl.createLeaderboard);
router.put('/admin/leaderboards/:id/status', requireAdmin, lbCtrl.updateLeaderboardStatus);
router.put('/admin/leaderboards/:id/entry', requireAdmin, lbCtrl.saveLeaderboardEntry);
router.put('/admin/leaderboards/:id/teams/:entryId/points', requireAdmin, lbCtrl.adjustLeaderboardPoints);
router.delete('/admin/leaderboards/:id/entry/:entryId', requireAdmin, lbCtrl.deleteLeaderboardEntry);

// Discussion
router.get('/discussion', discCtrl.getDiscussion);
router.post('/discussion', requireAuth, discCtrl.postMessage);
router.delete('/admin/discussion/:id', requireAdmin, discCtrl.deleteMessage);

// Certificates
router.get('/certificates/my', requireAuth, certCtrl.getMyCertificates);
router.get('/certificates/verify/:certificateId', certCtrl.verifyCertificate); // Public verify
router.get('/admin/certificates', requireAdmin, certCtrl.getAllAdminCertificates);
router.post('/admin/certificates/generate', requireAdmin, certCtrl.generateCertificates);

// Email
router.post('/admin/email/send', requireAdmin, emailCtrl.sendBroadcast);
router.get('/admin/email/logs', requireAdmin, emailCtrl.getEmailLogs);
router.get('/email/inbox/my', requireAuth, emailCtrl.getMyInbox);

// Admin dashboard overview
router.get('/admin/stats', requireAdmin, adminCtrl.getAdminStats);

export default router;
