import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";

@Entity("settings")
export class Setting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, unique: true })
  key!: string;

  @Column({ type: "varchar", length: 255 })
  value!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description!: string | null;
}
