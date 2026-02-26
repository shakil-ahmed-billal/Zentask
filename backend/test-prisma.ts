import { prisma } from "./src/app/lib/prisma";

async function test() {
  try {
    console.log("Testing Prisma connection...");
    const userCount = await prisma.user.count();
    console.log("Total users:", userCount);

    const users = await prisma.user.findMany({
      take: 1,
    });
    console.log("Sample user:", JSON.stringify(users, null, 2));

    const leaders = await prisma.user.findMany({
      where: { role: "LEADER" },
    });
    console.log("Leaders found:", leaders.length);
  } catch (err) {
    console.error("Prisma test failed:", err);
  } finally {
    process.exit(0);
  }
}

test();
