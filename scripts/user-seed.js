const prisma = require("../utils/prisma");
const bcrypt = require("bcrypt");

async function main() {
  const passwordQA = await bcrypt.hash("qa123", 10);
  const passwordDev = await bcrypt.hash("dev123", 10);

  await prisma.user.createMany({
    data: [
      {
        username: "qa1",
        password: passwordQA,
        role: "qa",
      },
      {
        username: "dev1",
        password: passwordDev,
        role: "dev",
      },
    ], 
  });

  console.log("User dummy berhasil dibuat");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
