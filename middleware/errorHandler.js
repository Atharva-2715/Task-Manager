module.exports = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message =
    status === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message;

  return res.status(status).json({ error: message });
};

