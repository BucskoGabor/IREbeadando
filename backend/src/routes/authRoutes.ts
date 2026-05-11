import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { AuthRequest, authMiddleware, JWT_SECRET } from "../middleware/auth";

const router = Router();
const userRepo = () => AppDataSource.getRepository(User);

router.post("/login", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Felhasználónév és jelszó megadása kötelező" });
      return;
    }

    const user = await userRepo().findOne({ where: { username } });
    if (!user) {
      res.status(401).json({ message: "Hibás felhasználónév vagy jelszó" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: "Hibás felhasználónév vagy jelszó" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

router.post("/register", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== "admin") {
      res.status(403).json({ message: "Csak admin hozhat létre új felhasználót" });
      return;
    }

    const { username, password, role } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Felhasználónév és jelszó megadása kötelező" });
      return;
    }

    const existing = await userRepo().findOne({ where: { username } });
    if (existing) {
      res.status(409).json({ message: "Ez a felhasználónév már foglalt" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepo().create({
      username,
      password: hashedPassword,
      role: role || "employee",
    });

    const saved = await userRepo().save(user);
    res.status(201).json({
      id: saved.id,
      username: saved.username,
      role: saved.role,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await userRepo().findOne({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ message: "Felhasználó nem található" });
      return;
    }
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba" });
  }
});

export default router;
