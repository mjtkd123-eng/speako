import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("speako1234", 10);

  await prisma.user.upsert({
    where: { email: "tutor@speako.one" },
    update: { role: "TUTOR", passwordHash },
    create: {
      email: "tutor@speako.one",
      name: "Alex Kim",
      phone: "010-1000-1000",
      passwordHash,
      role: "TUTOR",
    },
  });

  await prisma.user.upsert({
    where: { email: "student@speako.one" },
    update: { role: "USER", passwordHash },
    create: {
      email: "student@speako.one",
      name: "민지",
      phone: "010-2000-2000",
      passwordHash,
      role: "USER",
    },
  });

  console.log("Seeded tutor@speako.one / student@speako.one (password: speako1234)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
