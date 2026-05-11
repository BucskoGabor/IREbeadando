import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Member } from "./Member";
import { Item } from "./Item";

@Entity("loans")
export class Loan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  memberId!: number;

  @Column()
  itemId!: number;

  @ManyToOne(() => Member, (member) => member.loans)
  @JoinColumn({ name: "memberId" })
  member!: Member;

  @ManyToOne(() => Item, (item) => item.loans)
  @JoinColumn({ name: "itemId" })
  item!: Item;

  @Column({ type: "datetime" })
  loanDate!: Date;

  @Column({ type: "datetime", nullable: true })
  returnDate!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
