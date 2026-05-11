import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { seed } from "./seed";
import authRoutes from "./routes/authRoutes";
import memberRoutes from "./routes/memberRoutes";
import itemRoutes from "./routes/itemRoutes";
import loanRoutes from "./routes/loanRoutes";
import settingRoutes from "./routes/settingRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(async () => {
    console.log("Adatbázis kapcsolat létrejött");
    await seed();

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get("/", (req, res) => {
      res.send(`
        <h1>Könyvtár Backend fut</h1>
        <p>A felhasználói felületet itt éred el: <a href="http://localhost:4200">http://localhost:4200</a></p>
      `);
    });

    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/members", memberRoutes);
    app.use("/api/items", itemRoutes);
    app.use("/api/loans", loanRoutes);
    app.use("/api/settings", settingRoutes);
    app.use("/api/dashboard", dashboardRoutes);

    app.get("/api/health", (_req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    app.listen(PORT, () => {
      console.log(`Szerver elindult: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Adatbázis kapcsolat hiba:", error);
  });
