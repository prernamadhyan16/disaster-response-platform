function authMiddleware(req, res, next) {
  // This is a placeholder. In a real app, you would validate a JWT
  // and get user info from it.
  const user = {
    id: 'test-user-123',
    role: 'admin',
    username: 'TestUser'
  };
  req.user = user;
  next();
}

// For our placeholder, optional auth is the same as required auth.
authMiddleware.optional = authMiddleware;

module.exports = authMiddleware;
