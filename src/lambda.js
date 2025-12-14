const serverlessExpress = require("@vendia/serverless-express");
const { app } = require("./app");
const { closePoolIfIdle } = require("./db");

let handler;

exports.handler = async (event, context) => {
    // Important pour Lambda : ne pas attendre les callbacks
    context.callbackWaitsForEmptyEventLoop = false;

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