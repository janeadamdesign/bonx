// Imports
import express, { Router, Express, Request, Response } from "express";
import bodyParser from "body-parser";
import stripePackage, { Stripe } from "stripe";
import cors from "cors";
import serverless from "serverless-http";

// Declaration of express server & router
const lambdaServer: Express = express();
const router: Router = Router();

// Middleware
lambdaServer.use(
  cors({
    origin: "*", // Currently a wildcard. Can be replaced with client origin
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// GET for troubleshooting
router.get("/", (req: Request, res: Response): void => {
  res.send("Hello from lambdaServer!");
});

// Payment Intents
const secretStripeKey: string =
  "sk_test_51PKfLNRwMlFpLQQhlspLqt0zpDLuALXbGrGC9PLe38SmLn7FvOf0V5GE9D2DZWKRkQWzfAgJcKoULY2RBcKy7e5k00EsCsvTQM";
const stripe: stripePackage = new stripePackage(secretStripeKey, {
  apiVersion: "2024-04-10",
});
async function createPaymentIntent(req: Request, res: Response) {
  const { amount }: { amount: number } = req.body;
  console.log(`received createPaymentIntent request; amount: ${amount}`);
  try {
    const paymentIntent: Stripe.PaymentIntent =
      await stripe.paymentIntents.create({
        amount,
        currency: "eur",
      });
    if (paymentIntent?.client_secret) {
      console.log(
        `client_secret extant, typeof: ${typeof paymentIntent?.client_secret}`
      );
    }
    res.status(200).send({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}
router.post(
  "/create-payment-intent",
  bodyParser.json({ type: "application/json" }),
  createPaymentIntent
);

// First argument refers to where server is LISTENING not posting. Redirection necessary because relative paths ordinarily assume listening at the root of the domain.
lambdaServer.use("/.netlify/functions/lambdaServer/", router);

//export
export const handler = serverless(lambdaServer);
