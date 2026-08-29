/**
 * Express Validator & Input Sanitizer Middleware
 * Ensures all user-supplied data is validated and sanitized against XSS/injection attacks.
 */

const { body, query, validationResult } = require('express-validator');

// Helper to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

const registrationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters')
    .escape(),
  body('email')
    .trim()
    .isEmail().withMessage('A valid email address is required')
    .normalizeEmail(),
  body('role')
    .trim()
    .isIn(['Participant', 'Team Lead', 'AI/ML Developer', 'Backend Architect', 'Frontend Specialist', 'UI/UX Designer', 'Judge'])
    .withMessage('Invalid role selected'),
  body('skills')
    .optional()
    .customSanitizer(value => {
      if (Array.isArray(value)) return value.map(v => String(v).trim());
      if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
      return [];
    }),
  body('interests')
    .optional()
    .customSanitizer(value => {
      if (Array.isArray(value)) return value.map(v => String(v).trim());
      if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
      return [];
    }),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
    .escape(),
  validate
];

const checkInRules = [
  body('identifier')
    .trim()
    .notEmpty().withMessage('QR code badge string or email identifier is required')
    .escape(),
  validate
];

const announcementRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 150 }).withMessage('Title must be under 150 characters')
    .escape(),
  body('message')
    .trim()
    .notEmpty().withMessage('Message content is required')
    .isLength({ max: 1000 }).withMessage('Message must be under 1000 characters')
    .escape(),
  body('category')
    .trim()
    .isIn(['Urgent', 'Info', 'Workshop', 'Schedule', 'General'])
    .withMessage('Invalid category'),
  validate
];

const projectRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Project title is required')
    .isLength({ max: 150 }).withMessage('Title must be under 150 characters')
    .escape(),
  body('track')
    .trim()
    .notEmpty().withMessage('Track is required')
    .escape(),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description must be under 1000 characters')
    .escape(),
  body('repoUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Repository URL must be a valid URL'),
  body('demoUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Demo URL must be a valid URL'),
  validate
];

const judgingRules = [
  body('projectId')
    .trim()
    .notEmpty().withMessage('Project ID is required')
    .escape(),
  body('rubric.innovation')
    .isInt({ min: 1, max: 10 }).withMessage('Innovation score must be an integer between 1 and 10'),
  body('rubric.techComplexity')
    .isInt({ min: 1, max: 10 }).withMessage('Technical Complexity score must be an integer between 1 and 10'),
  body('rubric.uiUx')
    .isInt({ min: 1, max: 10 }).withMessage('UI/UX score must be an integer between 1 and 10'),
  body('rubric.impact')
    .isInt({ min: 1, max: 10 }).withMessage('Impact score must be an integer between 1 and 10'),
  body('rubric.presentation')
    .isInt({ min: 1, max: 10 }).withMessage('Presentation score must be an integer between 1 and 10'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 800 }).withMessage('Feedback cannot exceed 800 characters')
    .escape(),
  validate
];

module.exports = {
  registrationRules,
  checkInRules,
  announcementRules,
  projectRules,
  judgingRules
};
