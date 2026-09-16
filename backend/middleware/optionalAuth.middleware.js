const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.schema");

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};

module.exports = optionalAuth;
