const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const router = express.Router();

const users = JSON.parse(fs.readFileSync("./users.json", "utf8"));

router.post("/", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
});

module.exports = router;
