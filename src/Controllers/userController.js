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


exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // 1️⃣ Validasi input
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      message: "Semua field wajib diisi",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "Konfirmasi password tidak cocok",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      message: "Password baru minimal 8 karakter",
    });
  }

  try {
    // 2️⃣ Ambil user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // 3️⃣ Cek password lama
    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Password lama salah",
      });
    }

    // 4️⃣ Cegah password sama
    const isSamePassword = bcrypt.compareSync(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "Password baru tidak boleh sama dengan password lama",
      });
    }

    // 5️⃣ Hash password baru
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // 6️⃣ Update DB
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // 7️⃣ Logout (invalidate token)
    res.clearCookie("token");

    return res.json({
      message: "Password berhasil diubah, silakan login ulang",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal mengubah password",
    });
  }
};