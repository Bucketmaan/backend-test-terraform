import pg from "pg";
import { getConfig } from "./config.js";

const config = getConfig();

const pool = new pg.Pool({
    host: config.pgHost,
    port: config.pgPort,
    user: config.pgUser,
    password: config.pgPassword,
    database: config.pgDatabase,
    max: config.pgMaxConnections || 10,
    idleTimeoutMillis: config.pgIdleTimeoutMillis || 30000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    // Don't exit - let the server continue running
    console.log("Connection error, but server will continue running");
});

export const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("executed query", { text, duration, rows: res.rowCount });
    return res;
};

export const getClient = async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;

    // set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
        console.error("A client has been checked out for more than 5 seconds!");
        console.error(
            `The last executed query on this client was: ${client.lastQuery}`
        );
    }, 5000);

    // monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
        client.lastQuery = args;
        return query.apply(client, args);
    };

    client.release = () => {
        // clear our timeout
        clearTimeout(timeout);
        // set the methods back to their old un-monkey-patched version
        client.query = query;
        client.release = release;
        return release.apply(client);
    };

    return client;
};
