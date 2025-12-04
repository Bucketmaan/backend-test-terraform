export const getConfig = () => {
    return {
        pgHost: process.env.PG_HOST || "localhost",
        pgPort: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432,
        pgUser: process.env.PG_USER || "user",
        pgPassword: process.env.PG_PASSWORD || "password",
        pgDatabase: process.env.PG_DATABASE || "mydatabase",
        pgMaxConnections: process.env.PG_MAX_CONNECTIONS
            ? parseInt(process.env.PG_MAX_CONNECTIONS)
            : 10,
        pgIdleTimeoutMillis: process.env.PG_IDLE_TIMEOUT_MILLIS
            ? parseInt(process.env.PG_IDLE_TIMEOUT_MILLIS)
            : 30000,
    };
};
