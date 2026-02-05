const jwt = require("jsonwebtoken"); // Library untuk verifikasi JSON Web Token (JWT)
const SECRET_KEY = process.env.SECRET_KEY; // Secret key untuk verifikasi token



//   Middleware autentikasi berbasis JWT (cookie-based).
//   Melindungi endpoint yang membutuhkan login
//   Menentukan role & identitas user (QA / DEV / dll)
module.exports = function (req, res, next) {
  // Ambil token dari cookie
  const token = req.cookies.token;

  // Jika token tidak ada, user dianggap belum login
  if (!token) {
    return res.status(401).json({
      message: "You are not logged in!",
    });
  }

  try {
    // Verifikasi token dan decode payload
    const decoded = jwt.verify(token, SECRET_KEY);

    req.user = decoded; // Simpan data user ke request object

    next(); // Lanjutkan ke middleware / controller berikutnya
  } catch (err) {
    // Token tidak valid / expired
    return res.status(401).json({
      message: "Token is invalid ",
    });
  }
};
