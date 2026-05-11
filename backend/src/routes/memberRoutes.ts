import { Router, Response } from "express";
import { Like, IsNull } from "typeorm";
import { AppDataSource } from "../data-source";
import { Member } from "../entity/Member";
import { Loan } from "../entity/Loan";
import { AuthRequest, authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

const memberRepo = () => AppDataSource.getRepository(Member);
const loanRepo = () => AppDataSource.getRepository(Loan);

// GET /api/members - List members with optional search
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, showInactive } = req.query;
    const queryBuilder = memberRepo().createQueryBuilder("member");

    if (showInactive !== "true") {
      queryBuilder.where("member.active = :active", { active: true });
    }

    if (search) {
      const searchStr = `%${(search as string).toLowerCase()}%`;
      queryBuilder.andWhere(
        "(LOWER(member.name) LIKE :search OR LOWER(member.idCardNumber) LIKE :search OR CAST(member.id AS TEXT) = :exactSearch)",
        { search: searchStr, exactSearch: search }
      );
    }

    queryBuilder.orderBy("member.name", "ASC");
    const members = await queryBuilder.getMany();
    res.json(members.map(m => ({
      id: m.id,
      name: m.name,
      phone: m.phone,
      idCardNumber: m.idCardNumber,
      address: m.address,
      active: m.active,
      createdAt: m.createdAt
    })));
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

// GET /api/members/:id - Get member details with active loans
router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const member = await memberRepo().findOne({
      where: { id: parseInt(req.params.id as string) },
    });

    if (!member) {
      res.status(404).json({ message: "Tag nem található" });
      return;
    }

    const activeLoans = await loanRepo().find({
      where: { memberId: member.id, returnDate: IsNull() },
      relations: ["item"],
      order: { loanDate: "DESC" },
    });

    // Filter for truly null returnDate (active loans)
    const filteredLoans = activeLoans.filter((l) => l.returnDate === null);

    res.json({
      id: member.id,
      name: member.name,
      phone: member.phone,
      idCardNumber: member.idCardNumber,
      address: member.address,
      active: member.active,
      createdAt: member.createdAt,
      activeLoans: filteredLoans.map(l => ({
        id: l.id,
        loanDate: l.loanDate,
        returnDate: l.returnDate,
        item: {
          id: l.item.id,
          title: l.item.title,
          type: l.item.type
        }
      }))
    });
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

// POST /api/members - Create new member
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, idCardNumber, address } = req.body;

    if (!name || !phone || !idCardNumber || !address) {
      res.status(400).json({ message: "Minden mező kitöltése kötelező" });
      return;
    }

    const existing = await memberRepo().findOne({ where: { idCardNumber } });
    if (existing) {
      res.status(409).json({ message: "Ez a személyigazolvány szám már regisztrálva van" });
      return;
    }

    const member = memberRepo().create({ name, phone, idCardNumber, address });
    const saved = await memberRepo().save(member);
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating member:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

// PUT /api/members/:id - Update member
router.put("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const member = await memberRepo().findOne({
      where: { id: parseInt(req.params.id as string) },
    });

    if (!member) {
      res.status(404).json({ message: "Tag nem található" });
      return;
    }

    const { name, phone, idCardNumber, address, active } = req.body;

    if (idCardNumber && idCardNumber !== member.idCardNumber) {
      const existing = await memberRepo().findOne({ where: { idCardNumber } });
      if (existing) {
        res.status(409).json({ message: "Ez a személyigazolvány szám már regisztrálva van" });
        return;
      }
    }

    member.name = name || member.name;
    member.phone = phone || member.phone;
    member.idCardNumber = idCardNumber || member.idCardNumber;
    member.address = address || member.address;
    if (active !== undefined) member.active = active;

    const saved = await memberRepo().save(member);
    res.json(saved);
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

// DELETE /api/members/:id - Soft delete (deactivate)
router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const member = await memberRepo().findOne({
      where: { id: parseInt(req.params.id as string) },
    });

    if (!member) {
      res.status(404).json({ message: "Tag nem található" });
      return;
    }

    member.active = false;
    await memberRepo().save(member);
    res.json({ message: "Tag sikeresen inaktiválva" });
  } catch (error) {
    console.error("Error deactivating member:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

export default router;
