const unauthorizedResponse = (res) =>
  res
    .status(401)
    .json({ error: 'Unauthorized access. Please provide valid credentials.' });

module.exports = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Basic ')) {
    return unauthorizedResponse(res);
  }

  try {
    const base64Credentials = header.split(' ')[1];
    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [username, password] = decoded.split(':');

    if (username !== 'admin' || password !== 'password123') {
      return unauthorizedResponse(res);
    }

    return next();
  } catch (error) {
    return unauthorizedResponse(res);
  }
};

