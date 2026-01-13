const userService = require("../Services/userServices");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getDevelopers = async (req, res) => {
  try {
    const developers = await userService.getUsersByRole("dev");
    res.json(developers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data developer" });
  }
};


exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const {
    username,
    currentPassword,
    newPassword,
    confirmPassword,
  } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const updateData = {};

    /* =======================
       UPDATE USERNAME
    ======================= */
    if (username && username !== user.username) {
      
      //  CHECK USERNAME UNIQUENESS
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Username already taken",
        });
      }

      updateData.username = username;
    }

    /* =======================
       UPDATE PASSWORD
    ======================= */
    const wantChangePassword =
      currentPassword || newPassword || confirmPassword;

    if (wantChangePassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          message: "All password fields are required",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          message: "Password confirmation does not match",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          message: "New password must be at least 8 characters",
        });
      }

      const isMatch = bcrypt.compareSync(
        currentPassword,
        user.password
      );

      if (!isMatch) {
        return res.status(401).json({
          message: "Current password is incorrect",
        });
      }

      const isSame = bcrypt.compareSync(
        newPassword,
        user.password
      );

      if (isSame) {
        return res.status(400).json({
          message: "New password must be different from the current password",
        });
      }

      updateData.password = bcrypt.hashSync(newPassword, 10);
    }

    /* =======================
       PREVENT EMPTY UPDATE
    ======================= */
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No changes detected",
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // logout only if password is changed
    if (updateData.password) {
      res.clearCookie("token");
      return res.json({
        message: "Profile updated successfully. Please log in again",
      });
    }

    return res.json({
      message: "Username updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

