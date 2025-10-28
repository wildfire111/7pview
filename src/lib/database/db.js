// lib/db.js
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

// reuse across dev hot reloads
const globalForPg = globalThis;

export const pool =
    globalForPg.pgPool ||
    new Pool({
        connectionString: process.env.DATABASE_URL,
        // if your provider requires TLS, uncomment:
        // ssl: { rejectUnauthorized: false }
    });

if (!globalForPg.pgPool) globalForPg.pgPool = pool;

// tiny helper
export function query(text, params) {
    return pool.query(text, params);
}
