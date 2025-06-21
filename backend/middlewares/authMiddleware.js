module.exports = (req, res, next) => {
  const user = {
    id: 'netrunnerX',
    role: 'admin'
  };
  req.user = user;
  next();
};
