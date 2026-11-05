import validator from 'validator';

/**
 * Sanitize request parameters and body to prevent NoSQL query injection
 */
export const sanitizeData = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

/**
 * Validate registration input
 */
export const validateRegisterInput = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name is required and must be at least 2 characters long'
    });
  }

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  // Prevent client from escalating privilege to admin during public registration
  if (role && role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin accounts cannot be registered via public registration.'
    });
  }

  next();
};

/**
 * Validate login input
 */
export const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }

  next();
};
