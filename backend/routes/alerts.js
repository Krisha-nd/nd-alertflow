const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");
const router = express.Router();

// Middleware to check token
router.use((req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Missing authorization token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = user;
    next();
  });
});

// Serve alert data
router.get("/", (req, res) => {
  const alertPath = path.join(__dirname, "../data/alert.json");

  try {
    const data = fs.readFileSync(alertPath, "utf8");

    // Log access
    const logEntry = `${new Date().toISOString()} - ${req.user.username} accessed alert.json\n`;
    fs.appendFileSync(path.join(__dirname, "../logs/access.log"), logEntry);

    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ message: "Error reading alert data" });
  }
});

module.exports = router;
