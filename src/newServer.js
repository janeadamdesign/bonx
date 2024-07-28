/* Module Imports
- We're using require() rather than import syntax as we are using CommonJS for Node.JS rather than ES Modules, the latter more commonly used in browsers / React etc according to ECMAScript 2015.
- express: this is how we declare our app as an express server with app = express(), populated by the express server methods like .use(), .post(). 
  - .post() declares logic for how our server RESPONSDS to a POST method http request.
    - It needs a minimum of two arguments, the first being the path on which the POST request will be received, the second being a reference to a handler function—i.e. what should be done in response to the POST request.
    - When there are three arguments given the second refers to the middleware. Middleware can change the res & req objects passed to the next function. The default res object contains methods the handler fn can use to response to the http request.
- bodyParser: the middleware we use to parse the data. Parses the data of the req object.
  -   bodyParser.json({ type: "application/json" })
    - converts the raw data of the req.body to JSON javascript object if matches the type header
  -   bodyParser.raw({ type: "application/json" })
    - leaves the raw data of the req.body as is if it matches the type header 
- stripePackage for loading our stripe package
- cors = Cross-Origin Resource Sharing:
  - Middleware security protocol which allows servers to specify who can access their assets and under what conditions. */
const express = require("express");
const bodyParser = require("body-parser");
const stripePackage = require("stripe");
const cors = require("cors");

// Declares our app as an express server with access to express methods
const newServer = express();

/* .use() method:
    - Used to apply middleware to any or all of the routes to be declared later with .post
    - If no route given, the middleware is applied universally, as in our use case.
    - If our req object doesn't meet the criteria of the CORS middleware then the CORS middleware changes the headers such that the browser itself doesn't allow the client-side javascript to process the reponse data object. The data still passes through the logic of our server (I think) */
newServer.use(
  cors({
    origin: "*", // Currently a wildcard. Can be replaced with client origin
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// troubleshooting GET
newServer.get("/", (req, res) => {
  res.send("Hello from lambdaServer!");
});

/* Payment Intent Functionality: 
    - Payment Intents is the core functionality by which Stripe payments are created and processed.
    - Our client-side JS sends a payment intent request to our Express server. The data package simply contains the amount of the payment. It is sent by the client-side js to our /create-payment-intent path.
    - Our createPaymentIntent function sends our secretStripeKey and the amount to the Stripe server. Doing so creates a Payment Intent object on their server which includes a Client Secret Key.
    - The Client Secret Key is essentially the reference to the payment intent, which exists on the Stripe server, not on our Express server.
    - Our Express server responds to the client-side js by sending the Client Secret Key. 
    - With the Client Secret Key, the client-side js communicates with the Stripe server to actuate the payment. 
    - The only functionality that strictly requires the Express server is the creation of the payment intent. */
// Our API key for Stripe
const secretStripeKey =
  "sk_test_51PKfLNRwMlFpLQQhlspLqt0zpDLuALXbGrGC9PLe38SmLn7FvOf0V5GE9D2DZWKRkQWzfAgJcKoULY2RBcKy7e5k00EsCsvTQM";
// Initialises a new stripePackage with our API key and apiVersion
const stripe = new stripePackage(secretStripeKey, {
  apiVersion: "2024-04-10",
});
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
newServer.post(
  "/create-payment-intent",
  bodyParser.json({ type: "application/json" }),
  createPaymentIntent
);

/* The purpose of the webhook functionality is to allow the Stripe server to update our Express server with respect to what is happening with the Payment Intent as is being processed between the client-side JS and the stripe server. In real a real life use case our switch statement below would do things like send our emails to the customer, despatch stock, but most importantly keep a record of the payment and update records accordingly. */

// These are the keys used for handling the webhook. CLI is for demo version listening on port 4242.
const secretWebhooksKey = "placeholderMustBeLocalisedToEachEndpoint";
const secretWebhooksCLI =
  "whsec_9f7fb8fa70ed88d76abd4541d4eb10b10d10e61d76d58119e36e85fa70655109"; // This is your Stripe CLI webhook secret for testing your endpoint locally.

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
newServer.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

// This app.listen is for when we are running our server locally and responding to it with CLI. In this case our app still communicates with the Stripe server for the purposes of creating paymentIntents (or at least mock payment intents) but does not receive any webhooks back as it is only a local server. We have to simulate the webhook responses using CLI.
// app.listen(4242, () => console.log("Server running on port 4242"));

// Instead we are going to export it as a module so it can be wrapped with lambda
module.exports = newServer;
