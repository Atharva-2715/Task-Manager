const sanitizeHtml = require('sanitize-html');

const sanitizeField = (value = '') =>
  sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();

module.exports = (req, res, next) => {
  const errors = [];
  const title = typeof req.body.title === 'string' ? req.body.title : '';
  const description =
    typeof req.body.description === 'string' ? req.body.description : '';

  const sanitizedTitle = sanitizeField(title);
  const sanitizedDescription = sanitizeField(description);

  if (!sanitizedTitle) {
    errors.push('Title is required.');
  } else if (sanitizedTitle.length > 100) {
    errors.push('Title must be 100 characters or fewer.');
  }

  if (!sanitizedDescription) {
    errors.push('Description is required.');
  } else if (sanitizedDescription.length > 500) {
    errors.push('Description must be 500 characters or fewer.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  req.body.title = sanitizedTitle;
  req.body.description = sanitizedDescription;

  return next();
};

