import { Router, Response } from "express";
import { AppDataSource } from "../data-source";
import { Setting } from "../entity/Setting";
import { AuthRequest, authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);
const settingRepo = () => AppDataSource.getRepository(Setting);

router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await settingRepo().find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba" });
  }
});

router.put("/:key", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== "admin") {
      res.status(403).json({ message: "Csak admin módosíthatja a beállításokat" });
      return;
    }
    const { value } = req.body;
    if (value === undefined) {
      res.status(400).json({ message: "Érték megadása kötelező" });
      return;
    }
    const setting = await settingRepo().findOne({ where: { key: req.params.key as string } });
    if (!setting) {
      res.status(404).json({ message: "Beállítás nem található" });
      return;
    }
    setting.value = String(value);
    const saved = await settingRepo().save(setting);
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: "Szerverhiba" });
  }
});

export default router;
