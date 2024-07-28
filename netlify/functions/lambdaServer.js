// Refer to ../../src/newServer for explanation of app
// Imports
const express = require("express");
const bodyParser = require("body-parser");
const stripePackage = require("stripe");
const cors = require("cors");
const serverless = require("serverless-http");


// Declaration of server
const lambdaServer = express()


// troubleshooting GET
lambdaServer.get("/", (req, res) => {
    res.send("Hello from lambdaServer!");
  });


module.exports.handler = serverless(lambdaServer);