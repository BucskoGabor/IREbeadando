import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { User } from "./entity/User";
import { Member } from "./entity/Member";
import { Item } from "./entity/Item";
import { Loan } from "./entity/Loan";
import { Setting } from "./entity/Setting";

const entities = [User, Member, Item, Loan, Setting];

const isPostgres = process.env.DB_TYPE === "postgres";

const postgresConfig: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "konyvtar",
  synchronize: true,
  logging: false,
  entities,
};

const sqliteConfig: DataSourceOptions = {
  type: "better-sqlite3",
  database: process.env.DB_PATH || "database.sqlite",
  synchronize: true,
  logging: false,
  entities,
};

export const AppDataSource = new DataSource(
  isPostgres ? postgresConfig : sqliteConfig
);
