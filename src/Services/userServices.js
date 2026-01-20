const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// =========================
// GET USERS BY ROLE
// =========================
const getUsersByRole = async (role) => {
  return prisma.user.findMany({
    where: { role },
    select: { id: true, username: true },
  });
};

// =========================
// FIND USER BY USERNAME (for login)
// =========================
const findUserByUsername = async (username) => {
  return prisma.user.findUnique({
    where: { username },
  });
};

// =========================
// GET SAFE USER (for get current user info)
// =========================
const getSafeUserById = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      role: true,
    },
  });
};

// =========================
// GET FULL USER (for updateProfile checks)
// =========================
const findUserById = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
};

// =========================
// CHECK USERNAME UNIQUENESS (exclude current user)
// =========================
const isUsernameTaken = async (username, userIdToExclude) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      username,
      NOT: { id: userIdToExclude },
    },
  });

  return !!existingUser;
};

// =========================
// UPDATE USER DATA
// =========================
const updateUserById = async (userId, updateData) => {
  return prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
};

module.exports = {
  getUsersByRole,
  findUserByUsername,
  getSafeUserById,
  findUserById,
  isUsernameTaken,
  updateUserById,
};
