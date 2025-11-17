const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../Middleware/auth");

const SECRET_KEY = "RAHASIA_SUPER_UNIK";

// Dummy users (sementara, sebelum pakai DB)
const users = [
  {
    id: 1,
    username: "qa",
    password: bcrypt.hashSync("qa123456", 10),
    role: "qa",
  },
  {
    id: 2,
    username: "dev",
    password: bcrypt.hashSync("dev123456", 10),
    role: "developer",
  },
];

// LOGIN
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // cari user berdasarkan username
  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ message: "User tidak ditemukan" });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Password salah" });
  }

  // simpan id + role ke dalam token
  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET_KEY,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
  }).json({
    message: "Login berhasil",
  });
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logout berhasil" });
});

// CEK LOGIN
router.get("/me", authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);

  res.json({
    loggedIn: true,
    userId: req.user.id,
    username: user.username,  // ⬅️ tambah ini
    role: req.user.role,
  });
});


module.exports = router;
