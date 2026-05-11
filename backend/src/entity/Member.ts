import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Loan } from "./Loan";

@Entity("members")
export class Member {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 50 })
  phone!: string;

  @Column({ type: "varchar", length: 50, unique: true })
  idCardNumber!: string;

  @Column({ type: "varchar", length: 500 })
  address!: string;

  @Column({ type: "boolean", default: true })
  active!: boolean;

  @OneToMany(() => Loan, (loan) => loan.member)
  loans!: Loan[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
