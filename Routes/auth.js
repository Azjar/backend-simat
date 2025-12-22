const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../Middleware/auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const SECRET_KEY = process.env.SECRET_KEY;

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: "User tidak ditemukan" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

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

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logout berhasil" });
});

// CEK LOGIN
router.get("/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      role: true,
    },
  });

  res.json({
    loggedIn: true,
    userId: user.id,
    username: user.username,
    role: user.role,
  });
});



module.exports = router;
