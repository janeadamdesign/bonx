const serverless = require(serverless-http);
const lambdaServer = require('../../src/newServer');

module.exports.handler(serverless(lambdaServer));