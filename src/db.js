const { Pool } = require("pg");

let pool;
let lastActivity = Date.now();
const IDLE_TIMEOUT = 60000; // 60 secondes

function getPool() {
    if (!pool) {
        pool = new Pool({
            host: process.env.PG_HOST,
            port: Number(process.env.PG_PORT || 5432),
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            database: process.env.PG_DATABASE,
            ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : false,
            // Optimisations pour Lambda
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
            max: 2 // Limiter les connexions simultanées
        });

        // Gérer les erreurs du pool
        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
        });
    }

    lastActivity = Date.now();
    return pool;
}

// Fermer le pool si inactif
async function closePoolIfIdle() {
    if (pool && (Date.now() - lastActivity) > IDLE_TIMEOUT) {
        try {
            await pool.end();
            pool = null;
            console.log('Database pool closed due to inactivity');
        } catch (err) {
            console.error('Error closing pool:', err);
        }
    }
}

module.exports = { getPool, closePoolIfIdle };