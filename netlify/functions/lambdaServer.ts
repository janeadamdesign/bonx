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

const secretStripeKey: string = process.env.SECRET_STRIPE_KEY as string;
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

// Webhooks
const secretWebhooksKey = process.env.SECRET_WEBHOOKS_KEY as string;
async function handleWebhook(req: Request, res: Response): Promise<void> {
  let sig: string | string[] = [];
  if (req.headers && req.headers["stripe-signature"]) {
    sig = req.headers["stripe-signature"];
  } else return;
  let event: Stripe.Event | null = null;
  try {
    // Verify the webhook signature using the raw body
    event = stripe.webhooks.constructEvent(req.body, sig, secretWebhooksKey);
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }
  if (event) {
    switch (
      event.type // In a real integration this would offer merchant backend fx like despatching products
    ) {
      case "payment_intent.created":
        console.log(`Payment Intent created`);
        break;
      case "payment_intent.requires_action":
        console.log(`Action required`);
        break;
      case "payment_intent.processing":
        console.log(`Processing`);
        break;
      case "payment_intent.succeeded":
        console.log(`Success!`);
        break;
      case "payment_intent.payment_failed":
        console.log(`Failed!`);
        break;
      default:
        console.log("Something's gone wrong: default case");
    }
  }
  res.status(200).send({ received: true });
}
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

// First argument refers to where server is LISTENING not posting. Redirection necessary because relative paths ordinarily assume listening at the root of the domain.
lambdaServer.use("/.netlify/functions/lambdaServer/", router);

//export
export const handler = serverless(lambdaServer);

/* Redacted keys: these are replaced with environment variables supplied from Netlify. No need to actually remove from javascript as not real security concern
- const secretStripeKey: string =
  "sk_test_51PKfLNRwMlFpLQQhlspLqt0zpDLuALXbGrGC9PLe38SmLn7FvOf0V5GE9D2DZWKRkQWzfAgJcKoULY2RBcKy7e5k00EsCsvTQM";
const secretWebhooksCLI =
  "whsec_9f7fb8fa70ed88d76abd4541d4eb10b10d10e61d76d58119e36e85fa70655109"; // This is your Stripe CLI webhook secret for testing your endpoint locally.
    const secretWebhooksKey = "whsec_IMyPfHI2HMhZT8pF93gCpYLQ6ym0dh6C"; */
