const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const inviteController = require('../controllers/inviteController');
const workoutController = require('../controllers/workoutController');
const sessionController = require('../controllers/sessionController');
const { auth, authorize } = require('../middleware/auth');

// --- Auth Routes ---
router.post('/auth/register-master', authController.registerMaster);
router.post('/auth/login', authController.login);

// --- Invite Routes (Brand Admin only) ---
router.post('/invites/generate', auth, authorize('BRAND_ADMIN'), inviteController.generateInvite);
router.post('/invites/register-trainer', inviteController.registerTrainer);

// --- Workout Management ---
// Trainers/Admins can assign workouts
router.post('/workouts/assign', auth, authorize('BRAND_ADMIN', 'TRAINER'), workoutController.createAssignedWorkout);
// Members can create personal plans
router.post('/plans', auth, authorize('MEMBER'), workoutController.createPersonalPlan);
// Member fetches their assigned workouts
router.get('/workouts/assigned/me', auth, authorize('MEMBER'), workoutController.getMyAssignedWorkouts);

// --- Session Tracking (Universal for those working out) ---
router.post('/sessions/start', auth, sessionController.startSession);
router.post('/sessions/:sessionId/log', auth, sessionController.logSet);
router.post('/sessions/:sessionId/finish', auth, sessionController.finishSession);

module.exports = router;
