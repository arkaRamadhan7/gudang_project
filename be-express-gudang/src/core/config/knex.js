import { config } from "dotenv";
import knex from "knex";

config(); // load .env dulu

// Ambil NODE_ENV dengan default
const env = process.env.NODE_ENV || "development";

// Import knexfile setelah env terbaca
import knexConfig from "../../../knexfile.js";

export const db = knex(knexConfig[env]);
