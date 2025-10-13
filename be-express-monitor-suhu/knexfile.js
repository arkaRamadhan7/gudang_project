import { config } from "dotenv";
import knex from "knex";

config(); // Load .env

const env = process.env.NODE_ENV || "development";

const knexConfig = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "gudang",
      charset: "utf8mb4"
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: "./src/migrations",
      extension: "js",
      loadExtensions: [".js"]
    }
  },
  production: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "gudang"
    },
    migrations: {
      directory: "./src/migrations",
      extension: "js"
    }
  }
};

export default knexConfig;
