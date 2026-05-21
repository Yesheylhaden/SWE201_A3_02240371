const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

const bookValidation = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('author').notEmpty().withMessage('Author is required').trim(),
  body('isbn').optional(),
  body('publication_year').optional().isInt({ min: 1000, max: new Date().getFullYear() }),
  body('status').optional().isIn(['available', 'borrowed', 'reserved']),
  validateRequest
];

const categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required').trim(),
  validateRequest
];

const userValidation = [
  body('username').notEmpty().withMessage('Username is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validateRequest
];

module.exports = {
  validateRequest,
  bookValidation,
  categoryValidation,
  userValidation
};
