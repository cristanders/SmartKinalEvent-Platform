/**
 * Unified API Router
 * Handles endpoints for all five core platform modules.
 */

const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const qrService = require('../services/qrService');
const matchmakingEngine = require('../services/matchmakingEngine');
const scoringEngine = require('../services/scoringEngine');
const {
  registrationRules,
  checkInRules,
  announcementRules,
  projectRules,
  judgingRules
} = require('../middleware/validator');

// Helper to broadcast Socket.io events
const broadcastEvent = (req, eventName, data) => {
  const io = req.app.get('io');
  if (io) {
    io.emit(eventName, data);
  }
};

// ==========================================
// MODULE 1: Registration & Check-in Simulator
// ==========================================

/**
 * POST /api/register
 * Registers a new participant and generates unique QR code badge Data URL.
 */
router.post('/register', registrationRules, async (req, res, next) => {
  try {
    const existing = dataStore.getParticipants().find(
      p => p.email.toLowerCase() === req.body.email.toLowerCase()
    );
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "A participant with this email address is already registered."
      });
    }

    const participant = dataStore.addParticipant(req.body);
    const qrDataUrl = await qrService.generateQRCodeDataURL(participant.qrCode);

    broadcastEvent(req, 'analytics:update', scoringEngine.generateOrganizerAnalytics(dataStore));

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      data: {
        participant,
        qrDataUrl
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/participants
 * List registered participants.
 */
router.get('/participants', (req, res) => {
  const participants = dataStore.getParticipants();
  res.json({
    success: true,
    count: participants.length,
    data: participants
  });
});

/**
 * POST /api/checkin
 * Check-in validation simulator accepting QR code code string or email.
 */
router.post('/checkin', checkInRules, (req, res, next) => {
  try {
    const { identifier } = req.body;
    const result = dataStore.checkInParticipant(identifier);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }

    const analyticsData = scoringEngine.generateOrganizerAnalytics(dataStore);
    broadcastEvent(req, 'checkin:success', {
      participant: result.participant,
      alreadyCheckedIn: result.alreadyCheckedIn,
      timestamp: new Date().toISOString()
    });
    broadcastEvent(req, 'analytics:update', analyticsData);

    res.json({
      success: true,
      alreadyCheckedIn: result.alreadyCheckedIn,
      message: result.alreadyCheckedIn ? "Participant is already checked in!" : "Check-in successful!",
      participant: result.participant
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// MODULE 2: Smart Team Matchmaking
// ==========================================

/**
 * GET /api/matchmaking
 * Calculates skill complementarity & compatibility matches.
 */
router.get('/matchmaking', (req, res, next) => {
  try {
    const { userId, role, skill, minMatch } = req.query;
    const participants = dataStore.getParticipants();

    // Default seeker or current user
    let seeker = participants.find(p => p.id === userId);
    if (!seeker) {
      // Fallback seeker profile if none provided
      seeker = {
        id: "temp-seeker",
        name: "Guest Seeker",
        role: role || "Team Lead",
        skills: skill ? [skill] : ["Node.js", "Express", "TailwindCSS"],
        interests: ["Smart Cities", "AI Analytics"]
      };
    }

    const matches = matchmakingEngine.findMatches(seeker, participants, {
      roleFilter: role,
      skillFilter: skill,
      minMatch: Number(minMatch) || 0
    });

    res.json({
      success: true,
      seeker,
      matchCount: matches.length,
      matches
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// MODULE 3: Live Announcements & Broadcasts
// ==========================================

/**
 * GET /api/announcements
 * Retrieves list of active broadcasts.
 */
router.get('/announcements', (req, res) => {
  const announcements = dataStore.getAnnouncements();
  res.json({
    success: true,
    data: announcements
  });
});

/**
 * POST /api/announcements
 * Organizers post a live broadcast alert.
 */
router.post('/announcements', announcementRules, (req, res, next) => {
  try {
    const newBroadcast = dataStore.addAnnouncement(req.body);

    // Broadcast instantly to all connected clients via Socket.io
    broadcastEvent(req, 'announcement:new', newBroadcast);

    res.status(201).json({
      success: true,
      message: "Broadcast published successfully",
      data: newBroadcast
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// MODULE 4: Secure Judging Portal
// ==========================================

/**
 * GET /api/projects
 * Returns list of projects ready for evaluation.
 */
router.get('/projects', (req, res) => {
  const projects = dataStore.getProjects();
  res.json({
    success: true,
    data: projects
  });
});

/**
 * POST /api/projects
 * Register a new hackathon project submission.
 */
router.post('/projects', projectRules, (req, res, next) => {
  try {
    const project = dataStore.addProject(req.body);
    const analyticsData = scoringEngine.generateOrganizerAnalytics(dataStore);
    
    broadcastEvent(req, 'projects:update', dataStore.getProjects());
    broadcastEvent(req, 'analytics:update', analyticsData);

    res.status(201).json({
      success: true,
      message: "Project submitted successfully",
      data: project
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/judging
 * Submit or update a rubric score evaluation.
 */
router.post('/judging', judgingRules, (req, res, next) => {
  try {
    const scoreEntry = dataStore.addJudgingScore(req.body);

    const analyticsData = scoringEngine.generateOrganizerAnalytics(dataStore);
    broadcastEvent(req, 'leaderboard:update', analyticsData.leaderboard);
    broadcastEvent(req, 'analytics:update', analyticsData);

    res.status(201).json({
      success: true,
      message: "Evaluation score submitted successfully",
      data: scoreEntry,
      calculatedScore: scoringEngine.calculateRubricScore(scoreEntry.rubric)
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// MODULE 5: Live Leaderboard & Organizer Analytics
// ==========================================

/**
 * GET /api/leaderboard
 * Returns real-time ranked leaderboard.
 */
router.get('/leaderboard', (req, res) => {
  const projects = dataStore.getProjects();
  const scores = dataStore.getJudgingScores();
  const leaderboard = scoringEngine.generateLeaderboard(projects, scores);

  res.json({
    success: true,
    data: leaderboard
  });
});

/**
 * GET /api/analytics
 * Returns complete Organizer Dashboard analytics & metrics.
 */
router.get('/analytics', (req, res) => {
  const analyticsData = scoringEngine.generateOrganizerAnalytics(dataStore);
  res.json({
    success: true,
    data: analyticsData
  });
});

module.exports = router;
