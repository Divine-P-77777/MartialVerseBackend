

// Header-based auth middleware
exports.verifyFrontendSecret = (req, res, next) => {
  const secret = req.headers['x-frontend-secret'];
  const email = req.headers['x-user-email']?.toLowerCase().trim();

  if (!secret || secret !== process.env.FRONTEND_SECRET) {
    return res.status(403).json({ error: 'Forbidden: Invalid frontend secret' });
  }

  if (!email) {
    return res.status(401).json({ error: 'Missing x-user-email header' });
  }

  req.user = { email }; // assign user to request whose value is object of email 
  next();
}
