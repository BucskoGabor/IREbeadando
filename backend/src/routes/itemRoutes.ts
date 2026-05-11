import { Router, Response } from "express";
import { AppDataSource } from "../data-source";
import { Item } from "../entity/Item";
import { Loan } from "../entity/Loan";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { IsNull } from "typeorm";

const router = Router();
router.use(authMiddleware);

const itemRepo = () => AppDataSource.getRepository(Item);
const loanRepo = () => AppDataSource.getRepository(Loan);

// GET /api/items - List items with search and filters
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, type, status } = req.query;
    const queryBuilder = itemRepo().createQueryBuilder("item");

    if (search) {
      const searchStr = `%${(search as string).toLowerCase()}%`;
      queryBuilder.where(
        "(LOWER(item.title) LIKE :search OR LOWER(item.author) LIKE :search)",
        { search: searchStr }
      );
    }

    if (type) {
      queryBuilder.andWhere("item.type = :type", { type });
    }

    if (status) {
      queryBuilder.andWhere("item.status = :status", { status });
    }

    queryBuilder.orderBy("item.title", "ASC");
    const items = await queryBuilder.getMany();
    res.json(items.map(i => ({
      id: i.id,
      title: i.title,
      author: i.author,
      type: i.type,
      acquisitionDate: i.acquisitionDate,
      status: i.status
    })));
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

// GET /api/items/:id - Get item details with current loan info
router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await itemRepo().findOne({
      where: { id: parseInt(req.params.id as string) },
    });

    if (!item) {
      res.status(404).json({ message: "Tétel nem található" });
      return;
    }

    let currentLoan = null;
    if (item.status === "borrowed") {
      const loan = await loanRepo().findOne({
        where: { itemId: item.id, returnDate: IsNull() },
        relations: ["member"],
      });
      if (loan) {
        currentLoan = {
          id: loan.id,
          loanDate: loan.loanDate,
          member: {
            id: loan.member.id,
            name: loan.member.name,
            idCardNumber: loan.member.idCardNumber,
          },
        };
      }
    }

    res.json({
      id: item.id,
      title: item.title,
      author: item.author,
      type: item.type,
      acquisitionDate: item.acquisitionDate,
      status: item.status,
      currentLoan
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

// POST /api/items - Create new item
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, author, type, acquisitionDate } = req.body;

    if (!title || !author || !type || !acquisitionDate) {
      res.status(400).json({ message: "Minden mező kitöltése kötelező" });
      return;
    }

    const validTypes = ["book", "cd", "cassette", "sheet_music"];
    if (!validTypes.includes(type)) {
      res.status(400).json({ message: "Érvénytelen típus. Lehetséges értékek: book, cd, cassette, sheet_music" });
      return;
    }

    const item = itemRepo().create({
      title,
      author,
      type,
      acquisitionDate,
      status: "available",
    });

    const saved = await itemRepo().save(item);
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

// PUT /api/items/:id - Update item
router.put("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await itemRepo().findOne({
      where: { id: parseInt(req.params.id as string) },
    });

    if (!item) {
      res.status(404).json({ message: "Tétel nem található" });
      return;
    }

    const { title, author, type, acquisitionDate, status } = req.body;
    item.title = title || item.title;
    item.author = author || item.author;
    item.type = type || item.type;
    item.acquisitionDate = acquisitionDate || item.acquisitionDate;
    if (status) item.status = status;

    const saved = await itemRepo().save(item);
    res.json(saved);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

// DELETE /api/items/:id - Scrap item (status change)
router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await itemRepo().findOne({
      where: { id: parseInt(req.params.id as string) },
    });

    if (!item) {
      res.status(404).json({ message: "Tétel nem található" });
      return;
    }

    if (item.status === "borrowed") {
      res.status(400).json({ message: "Kikölcsönzött tételt nem lehet selejtezni" });
      return;
    }

    item.status = "scrapped";
    await itemRepo().save(item);
    res.json({ message: "Tétel sikeresen selejtezve" });
  } catch (error) {
    console.error("Error scrapping item:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

export default router;
