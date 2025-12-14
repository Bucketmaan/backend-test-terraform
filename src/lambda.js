const serverlessExpress = require("@vendia/serverless-express");
const { app } = require("./app");
const { initDb, closePoolIfIdle } = require("./db");

let handler;

exports.handler = async (event, context) => {
    // Important pour Lambda : ne pas attendre les callbacks
    context.callbackWaitsForEmptyEventLoop = false;

    // Initialiser la base de données au premier appel
    try {
        await initDb();
    } catch (err) {
        console.error('Database initialization failed:', err);
    }

    // Enlever le stage prefix (/dev) du rawPath pour API Gateway HTTP v2
    if (event.rawPath && event.rawPath.startsWith("/dev/")) {
        event.rawPath = event.rawPath.substring(4); // Enlève "/dev"
    }
    if (event.requestContext?.http?.path && event.requestContext.http.path.startsWith("/dev/")) {
        event.requestContext.http.path = event.requestContext.http.path.substring(4);
    }

    // Initialiser le handler une seule fois (réutilisable entre invocations)
    if (!handler) {
        handler = serverlessExpress({ app });
    }

    try {
        return await handler(event, context);
    } finally {
        // Fermer les connexions inactives
        await closePoolIfIdle();
    }
};