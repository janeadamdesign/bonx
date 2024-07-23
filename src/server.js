// Module Imports
const express = require("express");
const bodyParser = require("body-parser");
const stripePackage = require("stripe");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "*", // Replace with your client origin
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const secretStripeKey =
  "sk_test_51PKfLNRwMlFpLQQhlspLqt0zpDLuALXbGrGC9PLe38SmLn7FvOf0V5GE9D2DZWKRkQWzfAgJcKoULY2RBcKy7e5k00EsCsvTQM";

const stripe = new stripePackage(secretStripeKey, {
  apiVersion: "2024-04-10",
});

const secretWebhooksKey = "placeholderMustBeLocalisedToEachEndpoint";
const secretWebhooksCLI =
  "whsec_9f7fb8fa70ed88d76abd4541d4eb10b10d10e61d76d58119e36e85fa70655109"; // This is your Stripe CLI webhook secret for testing your endpoint locally.

async function createPaymentIntent(req, res) {
  const { amount } = req.body;
  console.log(`received createPaymentIntent request; amount: ${amount}`);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // shorthand for amount: amount,
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

// N.B. Development server webhooks have to be triggered manually through CLI. No live endpoint for Stripe to address server.
async function handleWebhook(req, res) {
  let sig = [];
  if (req.headers && req.headers["stripe-signature"]) {
    sig = req.headers["stripe-signature"];
  } else return;
  let event;
  try {
    // Verify the webhook signature using the raw body
    event = stripe.webhooks.constructEvent(req.body, sig, secretWebhooksCLI);
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }
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
  res.status(200).send({ received: true });
}

app.post(
  "/create-payment-intent",
  bodyParser.json({ type: "application/json" }),
  createPaymentIntent
);
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

app.listen(4242, () => console.log("Server running on port 4242"));
