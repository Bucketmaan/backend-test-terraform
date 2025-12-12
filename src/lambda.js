const serverlessExpress = require("@vendia/serverless-express");
const { app } = require("./app");

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const handler = serverlessExpress({ app });
    return handler(event, context);
};