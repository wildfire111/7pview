import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const globalForPg = globalThis;

export const pool =
    globalForPg.pgPool ||
    new Pool({
        connectionString: process.env.DATABASE_URL,
    });

if (!globalForPg.pgPool) globalForPg.pgPool = pool;

export function query(text, params) {
    return pool.query(text, params);
}
