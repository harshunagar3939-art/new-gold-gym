const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return req.headers["x-admin-key"] || null;
}

async function protect(req, res, next) {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (token === process.env.ADMIN_KEY) {
      req.user = { id: "legacy-admin", role: "admin", name: "Admin" };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

module.exports = { protect, adminOnly };
