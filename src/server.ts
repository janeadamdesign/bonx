// Module Imports
import express, { Request, Response } from "express";
import stripePackage from "stripe";
import bodyParser from "body-parser";

// Not strictly necessary to be an object
interface PaymentIntentRequestBody {
  amount: number;
}

// N.B. NOT EVERYTHING IN DOCUMENTATION HEREIN CAN BE GUARANTEED ACCURATE

/* The three lines of code declared below establish an express server on a js.node runtime environment. An express server, once deployed, runs continuously.

The function call express() creates an instance of an Express application:
- This instance, stored in the variable "app", is used to configure the server, set up routes, middleware, and eventually to listen for incoming requests.

Body Parser is a middleware function:
- When HTTP requests are sent over the network, they are transmitted as strings. 
- They must be stringified by the sender, then parsed by the receiver.
- .use() is a fundamental method belonging to the application instance initialised by express() which creates a middleware 'stack'. This stack is a series of operations that are in between the incoming HTTP request (req) and the response (res).
- bodyParser.json() thus becomes an intermediatry which automatically parses incoming requests with JSON payloads. It looks at the raw data in the HTTP request body and converts it into a JavaScript object accessible through req.body. Without parsing req.body is undefined.

.listen() is a method which instructs the server to begin listening:
- It takes two arguments, the port number to begin listening on and a callback function to call when the server is succesfully listening.
- Port numbers pertain to the computer and its operating system on which the server application is actually running. It is a form of local address. Virtualised operating systems have their own set of ports. 
    -- On a local network, they would be addressable as ${localIpAddress}:${portNumber}
    -- On the internet, they can be addressable as ${publicIpAddress}:${portNumber} or ${domainName}:${portNumber} */
const app: express.Express = express();
app.use(bodyParser.json());
app.listen(4242, () => console.log("Server running on port 4242"));

/* A secret api key is used in the server side processing. 
- It must be private as this is the api key used to directly charge cards.
- With this key a malicious actor could create fraudulent charges on any payment information coming in to our server.
- Or, for example, they could access account settings and redirect all payments to their own account.
- Given that this is just a demonstration server and not a real account, we have included the secret key in our express.js source code.
- However, in real conditions we would store the key as an environment variable (.env) which is stored on the operating system which is actually running the server. 
- The key would be injected into the variable at runtime, and not stored on the javascript code. 
- Although express.js servers' source code is not published publically, it is still preferable from the perspective of security to have the secret api key stored in configuration files exterior to the project directory.*/

const secretStripeKey: string =
  "sk_test_51PKfLNRwMlFpLQQhlspLqt0zpDLuALXbGrGC9PLe38SmLn7FvOf0V5GE9D2DZWKRkQWzfAgJcKoULY2RBcKy7e5k00EsCsvTQM";


/* stripePackage is a collection of functions and classes designed to interact with Stripe's services on the node.js backend:
- Creating Payment Intents
- Charging Cards
- Refunding Charges
 */
const stripe: stripePackage = new stripePackage(secretStripeKey, {
  apiVersion: "2024-04-10",
});

/* .post() is a method used to define what should be done when the server receives a HTTP POST request at a specific route (URL path). 
- It takes minimum two arguments, the route and the callback function. 
- If it takes more than two arguments, all of the argument in between are middleware functions.
- It automatically passes two arguments onto the callback function:
    - The first is of type Request, which includes properties containing data from the incoming HTTP request and a set of methods to manipulate the data.
    - The second is of type Response, which is a standardised set of methods used to construct and send a response back to the client. This does not refer to a response object which is later returned from the function to respond to the HTTP request. Rather, it uses methods from the Response object, like res.status and res.send, to send information back to the client that made the HTTP request.
- These two object arguments are CREATED by Express everytime there is a new HTTP request. They are passed into the callback function as references, and remain mutable within each HTTP request cycle. So methods like res.status can mutate the content of the response object before finally sending with res.send. For every HTTP request we call a function which initialises object arguments then passes them to a callback function that it, itself, takes as an argument. */

/* Our first .post() method here establishes functionality for creating a payment intent.
PAYMENT INTENT: https://docs.stripe.com/payments/paymentintents/lifecycle?locale=en-GB;
- A payment intent is a singular attempt at taking a payment with its own lifecycle. It is created BEFORE the user has entered any details. It is created on the basis of the client-side merchant website simply informing Stripe of the amount / currency. It proceeds through the following states:
    - requires_payment_method: The Payment Intent needs a payment method to be attached. User must enter card details
    - requires_confirmation: The Payment Intent needs to be confirmed to proceed with the payment. This might include things like checking stock. This is OPTIONAL stage. In most integrations, this state is skipped because payment method information is submitted at the same time that the payment is confirmed. 'Confirmation' must always happen, but most integrations do not leave payment intent in a state where it has the payment method but is still waiting for confirmation. Confirmation is solely confirmed by front-end, doesn't involve communication with Stripe and webhook events.  
    - requires_action: Additional user action is required (e.g., 3D Secure authentication). I'm not sure how this is triggered - whether it requires communication with bank, or whether it's just on the basis of the BIN. Not sure if this is strictly before or after 'confirmation' takes place - i.e. whether the payment requires_action in order for the payment to no longer require confirmation, or whether this is an entirely separate stage.
    - processing:  The payment is being processed.
    - succeeded: The payment has succeeded.
    - cancelled: You can cancel a PaymentIntent at any point before it’s in a processing or succeeded state. Cancelling it invalidates the PaymentIntent for future payment attempts, and can’t be undone. If any funds have been held, cancellation releases them.
    - requires_capture: The payment needs to be manually captured (if using manual capture). Example: pre-authorised charge 
    - If a payment fails for any reason it returns to requires-payment-method state.
- A typical Payment Intent object contains fields such as:
    - id: A unique identifier for the Payment Intent.
    - amount: The amount intended to be collected by this Payment Intent.
    - currency: The currency in which the payment is to be made.
    - status: Current status of the payment (e.g., requires_payment_method, succeeded).
    - client_secret: A unique key needed to finalize the payment on the client side securely.
    - created: Timestamp when the Payment Intent was created.
    - Many other fields related to payment methods, capture method, confirmation method, etc.
- Our callback function destructures the amount variabled from the parsed req.body and then try{} to create a Payment Intent on the basis of the paymentIntents.create() method being being supplied with the {amount: number, currency: string} argument.
- res.status(code: number) sets the HTTP status code for the response. This mutates the response object internal to the HTTP request cycle instance but external to the callback function. Universal status codes: 200 = success; 500 = internal server error. It is automatically set to 200 when initialised.
- The .send() method can be called directly on res as well as chained to .status(). This is because .status() simply mutates the object which still possesses .send() as one of its methods. 
- The argument passed to .send() is the Response Body. In Express, the .send() method can take strings, objects, arrays to send as response body. If you pass an object or array, it will automatically use JSON.stringify() to convert it to a string. Passing numbers is not recommended as this will be interpreted as a status code by the recipient. If you pass a string as an argument, the HTTP response will have 'Content-Type': 'text/html' as a header; if you pass an array or object 'Content-Type': 'application/json';
- If for any reason unsuccesful, our callback fn sends status(500) and an error message as its response body.
- If successful, our callback fn sends status(200) and the client_secret api key to the front-end integration. The client-secret api key is used by the front-end to interact directly with Stripe; our server does not handle the customer's payment details.

While it is common for servers to create a database of Payment Intents it is not necessary. stripe.paymentIntents.create first constructs the Payment Intent object on our server, THEN CREATES IT ON THE STRIPE NETWORK. Once the client_secret api key is sent as a HTTPS response to the frontend, the Payment Intent object created within the .post callback function is dissolved. The purpose of storing in database is for records, accounting, security, and for the merchant themselves to track the lifecycle of the Payment Intent.

Stripe communicates back to our server using webhooks. We must create a webhook endpoint. Stripe sends out a webhook every time the status of the payment intent changes. Once payment intent created and client_secret sent to frontend there is a triangle of server >> frontend >> stripe >> server >> frontend >> stripe

In our integration we'll need to deal with webhooks for:
    case "payment_intent.created":              =>  state = requires_payment_method
    case "payment_intent.requires_action":      =>  state = requires_action
    case "payment_intent.processing":           =>  state = processing
    case "payment_intent.succeeded":            =>  state = succeeded
    case "payment_intent.payment_failed":       =>  state = requires_payment_method


*/

const secretWebhooksKey: string = "placeholderMustBeLocalisedToEachEndpoint";
const secretWebhooksCLI: string = "whsec_9f7fb8fa70ed88d76abd4541d4eb10b10d10e61d76d58119e36e85fa70655109" // This is your Stripe CLI webhook secret for testing your endpoint locally.

async function createPaymentIntent(req: Request, res: Response): Promise<void> {
  const { amount }: PaymentIntentRequestBody = req.body;
  try {
    const paymentIntent: stripePackage.PaymentIntent =
      await stripe.paymentIntents.create({
        amount, // shorthand for amount: amount,
        currency: "eur",
      });
    res.status(200).send(paymentIntent.client_secret);
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
}
async function handleWebhook(req: Request, res: Response): Promise<void> {
  let sig: string | string[];
  if (req.headers && req.headers["stripe-signature"]) {
    sig = req.headers["stripe-signature"];
  } else return;
  let event: stripePackage.Event;
  try {
    // Verify the webhook signature using the raw body
    event = stripe.webhooks.constructEvent(req.body, sig, secretWebhooksCLI);
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }
  switch (event.type) { // In a real integration this would offer merchant backend fx like despatching products
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
      alert("Message from server.tsx: Success!");
      break;
    case "payment_intent.payment_failed":
      console.log(`Failed!`);
      alert("Message from server.tsx: Failed!");
      break;
  }
  res.status(200).send({ received: true });
}

// posting Create Payment Intent
app.post("/create-payment-intent", createPaymentIntent);
/* posting Webhook: bodyParser.raw overrides bodyParser.json and gives us access to raw HTTP request data; necessary for signature verification. To verify the signature, you need to compute a hash using the exact raw payload and compare it with the signature sent by Stripe. If the payload is modified in any way (e.g., by JSON parsing), the hash will not match, and verification will fail. */
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

