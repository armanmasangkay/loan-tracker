import "dotenv/config";
import { db } from "../src/lib/db";
import { users } from "../src/lib/db/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  const passwordHash = await bcrypt.hash("password", 12);

  try {
    await db.insert(users).values({
      username: "admin",
      displayName: "Administrator",
      passwordHash,
      role: "admin",
      isActive: true,
    });

    console.log("Created admin user:");
    console.log("  Username: admin");
    console.log("  Password: password");
    console.log("");
    console.log("Please change the password after first login!");
  } catch (error) {
    // Check if user already exists
    const existing = await db.query.users.findFirst();
    if (existing) {
      console.log("Database already seeded.");
    } else {
      throw error;
    }
  }

  console.log("Done!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
