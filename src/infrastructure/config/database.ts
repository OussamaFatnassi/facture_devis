import { prisma } from "../persistence/prisma";

export async function pingDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Database connection established");
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1);
  }
}
