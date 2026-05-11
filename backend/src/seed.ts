import bcrypt from "bcryptjs";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { Setting } from "./entity/Setting";

export async function seed() {
  const userRepo = AppDataSource.getRepository(User);
  const settingRepo = AppDataSource.getRepository(Setting);

  // Seed admin user
  const adminExists = await userRepo.findOne({ where: { username: "admin" } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = userRepo.create({
      username: "admin",
      password: hashedPassword,
      role: "admin",
    });
    await userRepo.save(admin);
    console.log("Admin felhasználó létrehozva (admin / admin123)");
  }

  // Seed default settings
  const settings = [
    { key: "max_loans_per_member", value: "6", description: "Maximális kölcsönözhető tételek száma tagonként" },
    { key: "overdue_days", value: "30", description: "Késésnek számító napok száma" },
  ];

  for (const s of settings) {
    const exists = await settingRepo.findOne({ where: { key: s.key } });
    if (!exists) {
      await settingRepo.save(settingRepo.create(s));
      console.log(`Beállítás létrehozva: ${s.key} = ${s.value}`);
    }
  }
}
