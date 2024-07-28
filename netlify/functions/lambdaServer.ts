// Imports
import express, { Router, Express } from "express";
import bodyParser from "body-parser";
import stripePackage from "stripe";
import cors from "cors";
import serverless from "serverless-http";

// Declaration of server
const lambdaServer: Express = express();
const router: Router = Router();

router.get("/", (req, res) => {
  res.send("Hello from lambdaServer!");
});

lambdaServer.use("/lambdaServer/", router);

export const handler = serverless(lambdaServer);
