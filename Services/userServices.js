const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getUsersByRole = async (role) => {
  return prisma.user.findMany({
    where: { role },
    select: {
      id: true,
      username: true
    }
  });
};

module.exports = {
  getUsersByRole
};
