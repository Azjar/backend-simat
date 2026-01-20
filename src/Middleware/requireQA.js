/** Middleware otorisasi khusus untuk role QA.
 * - Memastikan user memiliki role "qa"
 * - Membatasi endpoint tertentu agar hanya bisa diakses oleh QA
*/
module.exports = function (req, res, next) {
  // Pastikan user sudah terautentikasi
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // Cek role user (selain QA)
  if (req.user.role !== "qa") {
    return res.status(403).json({
      message: "Only QA role can access this resource",
    });
  }

  // User QA → lanjutkan request
  next();
};
