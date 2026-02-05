const bcrypt = require("bcryptjs"); // hash & compare password
const jwt = require("jsonwebtoken"); // JWT
const SECRET_KEY = process.env.SECRET_KEY;
const {
  getUsersByRole,
  findUserByUsername,
  getSafeUserById,
  findUserById,
  isUsernameTaken,
  updateUserById,
} = require("../Services/userServices");

// =========================
// LOGIN USER
// =========================
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

  return res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,        // WAJIB (HTTPS Railway)
      sameSite: "none",    // WAJIB (beda domain)
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    })
    .json({ message: "Login Successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

// =========================
// LOGOUT USER
// =========================
exports.logout = (req, res) => {
  return res.clearCookie("token").json({ message: "Logout Successful" });
};

// =========================
// GET CURRENT USER INFO
// =========================
exports.me = async (req, res) => {
  try {
    const user = await getSafeUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      loggedIn: true,
      userId: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

// =========================
// GET ALL DEVELOPERS
// =========================
exports.getDevelopers = async (req, res) => {
  try {
    const developers = await getUsersByRole("dev");
    return res.json(developers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to retrieve developer data" });
  }
};

// =========================
// UPDATE USER PROFILE
// (username and/or password)
// =========================
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { username, currentPassword, newPassword, confirmPassword } = req.body;

  try {
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {};

    // UPDATE USERNAME
    if (username && username !== user.username) {
      const taken = await isUsernameTaken(username, userId);
      if (taken) {
        return res.status(409).json({ message: "Username already taken" });
      }
      updateData.username = username;
    }

    // UPDATE PASSWORD
    const wantChangePassword = currentPassword || newPassword || confirmPassword;

    if (wantChangePassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All password fields are required" });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Password confirmation does not match" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }

      const isMatch = bcrypt.compareSync(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      const isSame = bcrypt.compareSync(newPassword, user.password);
      if (isSame) {
        return res.status(400).json({
          message: "New password must be different from the current password",
        });
      }

      updateData.password = bcrypt.hashSync(newPassword, 10);
    }

    // PREVENT EMPTY UPDATE
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No changes detected" });
    }

    await updateUserById(userId, updateData);

    // logout only if password is changed
    if (updateData.password) {
      res.clearCookie("token");
      return res.json({
        message: "Profile updated successfully. Please log in again",
      });
    }

    return res.json({ message: "Username updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};
