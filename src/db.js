const { Pool } = require("pg");

let pool;

function getPool() {
    if (!pool) {
        pool = new Pool({
        host: process.env.PG_HOST,
        port: Number(process.env.PG_PORT || 5432),
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
        ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : false
        });
    }
    return pool;
}

module.exports = { getPool };