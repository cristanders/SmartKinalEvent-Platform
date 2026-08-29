const request = require('supertest');
const app = require('../../src/app');
const dataStore = require('../../src/services/dataStore');

describe('Integration API Endpoint Tests', () => {

  beforeEach(() => {
    dataStore.reset();
  });

  describe('MODULE 1: Registration & Check-in API', () => {
    test('POST /api/register - successfully registers participant and returns QR image', async () => {
      const payload = {
        name: 'Test Runner',
        email: 'test.runner@smartkinal.org',
        role: 'Frontend Specialist',
        skills: 'JavaScript, TailwindCSS',
        interests: 'UI/UX',
        bio: 'Integration test runner profile'
      };

      const res = await request(app)
        .post('/api/register')
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.participant).toBeDefined();
      expect(res.body.data.qrDataUrl).toMatch(/^data:image\/png;base64,/);
    });

    test('POST /api/register - returns 400 validation error for invalid email', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ name: 'Bad Email', email: 'not-an-email', role: 'Team Lead' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('POST /api/checkin - validates check-in for registered participant', async () => {
      const res = await request(app)
        .post('/api/checkin')
        .send({ identifier: 'SKEP-usr-101-8A7F' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.participant.checkedIn).toBe(true);
    });
  });

  describe('MODULE 2: Matchmaking API', () => {
    test('GET /api/matchmaking - returns list of matched candidates', async () => {
      const res = await request(app)
        .get('/api/matchmaking?userId=usr-101');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.matches)).toBe(true);
    });
  });

  describe('MODULE 3: Live Announcements API', () => {
    test('POST /api/announcements - publishes new broadcast alert', async () => {
      const res = await request(app)
        .post('/api/announcements')
        .send({
          title: 'Test Broadcast Alert',
          category: 'Urgent',
          message: 'This is an urgent test broadcast message for all attendees.'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Broadcast Alert');
    });
  });

  describe('MODULE 4: Secure Judging Portal & Projects API', () => {
    test('POST /api/projects - creates a new project submission', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({
          title: 'Smart City Sensor Network',
          track: 'IoT & Smart Cities',
          description: 'Distributed IoT telemetry network with cloud analytics.'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
    });

    test('POST /api/judging - submits rubric scores and calculates weighted total', async () => {
      const res = await request(app)
        .post('/api/judging')
        .send({
          projectId: 'proj-01',
          judgeName: 'Test Judge',
          rubric: {
            innovation: 8,
            techComplexity: 9,
            uiUx: 7,
            impact: 8,
            presentation: 9
          },
          feedback: 'Great presentation and technical depth.'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.calculatedScore).toBeDefined();
    });
  });

  describe('MODULE 5: Leaderboard & Analytics API', () => {
    test('GET /api/leaderboard - returns ranked leaderboard', async () => {
      const res = await request(app).get('/api/leaderboard');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET /api/analytics - returns complete dashboard metrics', async () => {
      const res = await request(app).get('/api/analytics');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.metrics.totalRegistrations).toBeGreaterThan(0);
    });
  });
});
