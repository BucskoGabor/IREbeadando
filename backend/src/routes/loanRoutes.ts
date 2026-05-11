import { Router, Response } from "express";
import { IsNull, LessThan } from "typeorm";
import { AppDataSource } from "../data-source";
import { Loan } from "../entity/Loan";
import { Item } from "../entity/Item";
import { Member } from "../entity/Member";
import { Setting } from "../entity/Setting";
import { AuthRequest, authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

const loanRepo = () => AppDataSource.getRepository(Loan);
const itemRepo = () => AppDataSource.getRepository(Item);
const memberRepo = () => AppDataSource.getRepository(Member);
const settingRepo = () => AppDataSource.getRepository(Setting);

router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { memberId, itemId } = req.body;

    if (!memberId || !itemId) {
      res.status(400).json({ message: "Tag azonosító és tétel azonosító megadása kötelező" });
      return;
    }

    const member = await memberRepo().findOne({ where: { id: memberId } });
    if (!member) {
      res.status(404).json({ message: "Tag nem található" });
      return;
    }
    if (!member.active) {
      res.status(400).json({ message: "Inaktív tag nem kölcsönözhet" });
      return;
    }

    const item = await itemRepo().findOne({ where: { id: itemId } });
    if (!item) {
      res.status(404).json({ message: "Tétel nem található" });
      return;
    }
    if (item.status !== "available") {
      res.status(400).json({ message: "A tétel jelenleg nem elérhető kölcsönzésre" });
      return;
    }

    const maxLoansSetting = await settingRepo().findOne({
      where: { key: "max_loans_per_member" },
    });
    const maxLoans = maxLoansSetting ? parseInt(maxLoansSetting.value) : 6;

    const activeLoansCount = await loanRepo().count({
      where: { memberId, returnDate: IsNull() },
    });

    if (activeLoansCount >= maxLoans) {
      res.status(400).json({
        message: `A tag elérte a maximális kölcsönzési limitet (${maxLoans} tétel)`,
      });
      return;
    }

    const loan = loanRepo().create({
      memberId,
      itemId,
      loanDate: new Date(),
      returnDate: null,
    });

    item.status = "borrowed";
    await itemRepo().save(item);

    const savedLoan = await loanRepo().save(loan);

    const fullLoan = await loanRepo().findOne({
      where: { id: savedLoan.id },
      relations: ["member", "item"],
    });

    if (!fullLoan) {
      res.status(500).json({ message: "Sikerült a kölcsönzés, de hiba történt az adatok betöltésekor" });
      return;
    }

    res.status(201).json({
      id: fullLoan.id,
      loanDate: fullLoan.loanDate,
      returnDate: fullLoan.returnDate,
      member: {
        id: fullLoan.member.id,
        name: fullLoan.member.name
      },
      item: {
        id: fullLoan.item.id,
        title: fullLoan.item.title,
        type: fullLoan.item.type
      }
    });
  } catch (error) {
    console.error("Error creating loan:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

router.put("/:id/return", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await loanRepo().findOne({
      where: { id: parseInt(req.params.id as string) },
      relations: ["item", "member"],
    });

    if (!loan) {
      res.status(404).json({ message: "Kölcsönzés nem található" });
      return;
    }

    if (loan.returnDate !== null) {
      res.status(400).json({ message: "Ez a kölcsönzés már le van zárva" });
      return;
    }

    loan.returnDate = new Date();
    await loanRepo().save(loan);

    const item = await itemRepo().findOne({ where: { id: loan.itemId } });
    if (item) {
      item.status = "available";
      await itemRepo().save(item);
    }

    res.json({
      id: loan.id,
      loanDate: loan.loanDate,
      returnDate: loan.returnDate
    });
  } catch (error) {
    console.error("Error returning loan:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

router.get("/overdue", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const overdueSetting = await settingRepo().findOne({
      where: { key: "overdue_days" },
    });
    const overdueDays = overdueSetting ? parseInt(overdueSetting.value) : 30;

    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - overdueDays);

    const overdueLoans = await loanRepo().find({
      where: {
        returnDate: IsNull(),
        loanDate: LessThan(overdueDate),
      },
      relations: ["member", "item"],
      order: { loanDate: "ASC" },
    });

    const result = overdueLoans.map((loan) => {
      const now = new Date();
      const loanDate = new Date(loan.loanDate);
      const diffTime = Math.abs(now.getTime() - loanDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const delayDays = diffDays - overdueDays;

      return {
        id: loan.id,
        loanDate: loan.loanDate,
        returnDate: loan.returnDate,
        member: {
          id: loan.member.id,
          name: loan.member.name,
          idCardNumber: loan.member.idCardNumber
        },
        item: {
          id: loan.item.id,
          title: loan.item.title,
          author: loan.item.author,
          type: loan.item.type
        },
        totalDays: diffDays,
        delayDays,
        overdueDaysConfig: overdueDays,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching overdue loans:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

router.get("/member/:memberId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await loanRepo().find({
      where: { memberId: parseInt(req.params.memberId as string) },
      relations: ["item"],
      order: { loanDate: "DESC" },
    });
    res.json(loans.map(l => ({
      id: l.id,
      loanDate: l.loanDate,
      returnDate: l.returnDate,
      item: {
        id: l.item.id,
        title: l.item.title,
        type: l.item.type
      }
    })));
  } catch (error) {
    console.error("Error fetching member loans:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

router.get("/item/:itemId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await loanRepo().findOne({
      where: { itemId: parseInt(req.params.itemId as string), returnDate: IsNull() },
      relations: ["member", "item"],
    });

    if (!loan) {
      res.status(404).json({ message: "Nincs aktív kölcsönzés ehhez a tételhez" });
      return;
    }

    res.json({
      id: loan.id,
      loanDate: loan.loanDate,
      returnDate: loan.returnDate,
      member: {
        id: loan.member.id,
        name: loan.member.name
      },
      item: {
        id: loan.item.id,
        title: loan.item.title
      }
    });
  } catch (error) {
    console.error("Error fetching loan by item:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

export default router;
