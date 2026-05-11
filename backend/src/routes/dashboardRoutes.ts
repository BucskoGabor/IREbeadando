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

router.get("/stats", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalMembers = await memberRepo().count({ where: { active: true } });
    const totalItems = await itemRepo().count({ where: { status: "available" } });
    const activeLoans = await loanRepo().count({ where: { returnDate: IsNull() } });

    // Calculate overdue count
    const overdueSetting = await settingRepo().findOne({ where: { key: "overdue_days" } });
    const overdueDays = overdueSetting ? parseInt(overdueSetting.value) : 30;
    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - overdueDays);

    const overdueLoansCount = await loanRepo().count({
      where: {
        returnDate: IsNull(),
        loanDate: LessThan(overdueDate),
      },
    });

    // Get recent loans
    const recentLoans = await loanRepo().find({
      relations: ["member", "item"],
      order: { loanDate: "DESC" },
      take: 5
    });

    res.json({
      totalMembers,
      totalItemsAvailable: totalItems,
      activeLoans,
      overdueLoans: overdueLoansCount,
      recentActivity: recentLoans.map(l => ({
        id: l.id,
        loanDate: l.loanDate,
        memberName: l.member.name,
        itemTitle: l.item.title,
        returned: l.returnDate !== null
      }))
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Szerverhiba" });
  }
});

export default router;
