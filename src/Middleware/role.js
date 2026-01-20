/** Mengecek role user dari req.user
 * - Jika role sesuai → lanjut
 * - Jika tidak → tolak akses
 */
module.exports = function (...allowedRoles) {
  return (req, res, next) => {
    // Ambil role user dari hasil decode JWT
    const userRole = req.user?.role;

    // Jika user belum login atau role tidak diizinkan
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Not authorized to access this resource",
      });
    }

    // Role sesuai → lanjutkan request
    next();
  };
};
