import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-admin.ts <email> <password>");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    console.log(`Successfully created admin account for: ${admin.email}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating admin:", error.message);
    } else {
      console.error("Error creating admin:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
