// Imports
import express, { Router, Express } from "express";
import bodyParser from "body-parser";
import stripePackage from "stripe";
import cors from "cors";
import serverless from "serverless-http";

// Declaration of server
const lambdaServer: Express = express();
const router: Router = Router();

//middleware
lambdaServer.use(
  cors({
    origin: "*", // Currently a wildcard. Can be replaced with client origin
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
lambdaServer.use(bodyParser.json());

// router
router.get("/", (req, res) => {
  res.send("Hello from lambdaServer!");
});
lambdaServer.use("/.netlify/functions/lambdaServer/", router);

//export
export const handler = serverless(lambdaServer);
