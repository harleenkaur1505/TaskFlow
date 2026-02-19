const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return res.status(400).json({
      error: {
        message: messages.join('. '),
        code: 'VALIDATION_ERROR',
        status: 400,
      },
    });
  }

  next();
};

module.exports = validate;
