const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;
const JWT_SECRET = "nd-cloud-sre"; // secret for token signing

app.use(cors());
app.use(express.json());

// Paths
const USERS_FILE = path.join(__dirname, "data/users.json");
const ALERT_FILE = path.join(__dirname, "data/alert.json");
const LOG_FILE = path.join(__dirname, "data/logs.txt");

// Load users
let users = [];
try {
  const raw = fs.readFileSync(USERS_FILE, "utf8");
  users = JSON.parse(raw);
} catch (err) {
  console.error("Error reading users.json:", err);
}

// Helper to log activity
const logActivity = (type, details) => {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${type.toUpperCase()} - ${details}\n`;
  fs.appendFile(LOG_FILE, logLine, (err) => {
    if (err) console.error("Failed to write log:", err);
  });
};

// Login route
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    logActivity("login-fail", `username=${username}`);
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username: user.username, name: user.name }, JWT_SECRET, {
    expiresIn: "1h",
  });

  logActivity("login-success", `username=${username}`);
  res.json({ token, name: user.name });
});

// Middleware to decode token (not strictly needed for you, but it's in place if needed)
const decodeToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// GET all alerts (no token required)
app.get("/api/alerts", (req, res) => {
  fs.readFile(ALERT_FILE, "utf8", (err, data) => {
    if (err) return res.sendStatus(500);

    try {
      const parsed = JSON.parse(data);
      res.json(parsed);
    } catch (e) {
      res.status(500).json({ message: "Parsing error" });
    }
  });
});

// GET single alert by ID (also logs the fetch)
app.get("/api/alerts/:id", (req, res) => {
  const id = req.params.id;
  const username = req.query.user || "unauthenticated";
  const alertPath = path.join(__dirname, "data/alert.json");
  const logPath = path.join(__dirname, "logs.txt");

  fs.readFile(alertPath, "utf8", (err, data) => {
    if (err) return res.sendStatus(500);

    try {
      const allAlerts = JSON.parse(data).alerts;
      const single = allAlerts.find(a => a.id === id);
      if (!single) return res.status(404).json({ message: "Alert not found" });

      const timestamp = new Date().toISOString();
      const logLine = `[${timestamp}] ALERT-FETCH - username=${username} alertId=${id}\n`;
      fs.appendFile(logPath, logLine, () => {
        res.json(single); // log failure won’t block response
      });
    } catch (e) {
      res.status(500).json({ message: "Parsing error" });
    }
  });
});



// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "build", "index.html"))
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
