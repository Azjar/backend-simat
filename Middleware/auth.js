const jwt = require("jsonwebtoken");
const SECRET_KEY = "RAHASIA_SUPER_UNIK";

module.exports = function (req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Belum login!" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // { id: 1, iat: ..., exp: ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
};
