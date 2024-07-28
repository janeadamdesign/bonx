// Module imports
import React, { useState, useEffect, useRef } from "react";
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import {
  Stripe,
  StripeCardElement,
  StripeElements,
  loadStripe,
} from "@stripe/stripe-js";
import { PaymentIntentResult } from "@stripe/stripe-js";


interface StripeModuleProps {
  gigaTotal: number | null;
  setGigaTotal: React.Dispatch<React.SetStateAction<number | null>>;
  submitFormTrigger: number;
  setSubmitFormTrigger: React.Dispatch<React.SetStateAction<number>>;
  setPaymentState: React.Dispatch<React.SetStateAction<string>>;
}

interface StripeModuleContentProps {
  gigaTotal: number | null;
  setGigaTotal: React.Dispatch<React.SetStateAction<number | null>>;
  submitFormTrigger: number;
  setSubmitFormTrigger: React.Dispatch<React.SetStateAction<number>>;
  setPaymentState: React.Dispatch<React.SetStateAction<string>>;
}

function StripeModule(props: StripeModuleProps): React.ReactElement {
  const stripePublicKey: string =
    "pk_test_51PKfLNRwMlFpLQQhoFJkkAdUm5YOAEIuk7rrUo1LBVq6ixnbEiFqFS3M3dDYnxYqWkNPCJxh3RBAI8js2NcRVkC500lx5scgRo";
  const stripePromise: Promise<Stripe | null> = loadStripe(stripePublicKey);
  return (
    <Elements stripe={stripePromise}>
      <StripeModuleContent
        gigaTotal={props.gigaTotal}
        setGigaTotal={props.setGigaTotal}
        submitFormTrigger={props.submitFormTrigger}
        setSubmitFormTrigger={props.setSubmitFormTrigger}
        setPaymentState={props.setPaymentState}
      />
    </Elements>
  );
}

function StripeModuleContent(
  props: StripeModuleContentProps
): React.ReactElement {
  // Logic to access the useStripe / useElements hook
  const stripe: Stripe | null = useStripe();
  const elements: StripeElements | null = useElements();

  /* Logic to:
  - POST {amount} to Express server requesting create Payment Intent; amount taken from props.
  - Retrieve client_secret from Express server upon succesful Payment Intent creation
  - Store the client_secret as state in React for later injection into payment confirmation code 
  - Execute this on component load using dependency array
  - edited HTTP request url to reflect netlify fx
  */
  const localUrl: string = "http://192.168.1.159:4242";
  const netlifyUrl: string = "https://bonx.janeadamdesign.dev/.netlify/functions/lambdaServer"
  const [clientSecret, setClientSecret]: [string | null, React.Dispatch<React.SetStateAction<string | null>>] = useState<string | null>(null);
  const createPaymentIntent = async (amount: number): Promise<void> => {
    try {
      const response: Response = await fetch(
        `${netlifyUrl}/create-payment-intent`, // using local ip
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }), // shorthand for amount: amount
        }
      );
      if (response) {
        console.log(`there is a response, typeof: ${typeof response}`);
      }
      const data: any = await response.json();
      if (data.client_secret) {
        console.log(
          `client_secret extant, typeof: ${typeof data.client_secret}`
        );
        setClientSecret(data.client_secret);
      }
    } catch (error) {
      console.error(`Error: ${JSON.stringify(error)}`);
    }
  };
  useEffect((): void => {
    if (props.gigaTotal) {
      createPaymentIntent(props.gigaTotal);
    }
  }, [props.gigaTotal]);

  // Logic to attempt payment
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    console.log(`Payment submission attempt starting...`);
    if (!stripe || !elements) {
      console.error("Stripe or Elements has not yet loaded");
      return;
    }
    const cardElement: StripeCardElement | null =
      elements.getElement(CardElement);

    if (clientSecret && cardElement) {
      const { error, paymentIntent }: PaymentIntentResult = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        console.error(`error: ${JSON.stringify(error)}`); // Decline errors appear here. Unclear if this is due to test implementation
        props.setPaymentState("failed: check card details")
      } else if (paymentIntent) {
        console.log(`Payment Intent object retrieved`);
        if (paymentIntent?.status) {
          switch (paymentIntent.status) {
            case "succeeded": // Payment success, manually hide UI.
              props.setPaymentState("success!");
              break;
            case "requires_action": // 3D-Secure etc
              alert(`Customer verification required`);
              break;
            case "requires_payment_method": //i.e. payment failure
              alert(
                `Payment failure: Decline or Bad Details. Re-enter card details`
              );
              break;
            case "processing": // not relevant to card payments, this only happens for Direct Debits etc
              break;
            case "canceled": // not relevant to our code as we go straight from requires payment method to confirmation attempt. no way of cancelling prior to submitting
              break;
            default:
              console.log(`paymentIntent.status other`);
          }
        }
      } else {
        console.log(`No payment intent object retrieved`);
      }
    } else {
      console.log(
        `some kind of issue with clientSecret or cardElement loading`
      );
    }
  };

  // Logic to trigger form submit from button outside of container
  const paymentFormRef: React.RefObject<HTMLButtonElement | null> =
    useRef<HTMLButtonElement | null>(null);

  useEffect((): void => {
    if (!paymentFormRef.current) return;
    if (props.submitFormTrigger > 0) {
      paymentFormRef.current.click();
      props.setPaymentState("processing")
      props.setSubmitFormTrigger(0);
    }
  }, [paymentFormRef.current, props.submitFormTrigger]);

  const cardElementOptions: {} = {
    hidePostalCode: true,
    iconStyle: "solid",
    style: {
      base: {
        color: "#000000",
        iconColor: "#666ee8",
        fontSize: "18px",
        fontFamily: "Arial, Helvetica, sans-serif",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <div id="card-element-crush">
        <CardElement options={cardElementOptions} />
      </div>
      <button
        type="submit"
        disabled={!stripe}
        ref={paymentFormRef as React.RefObject<HTMLButtonElement>}
        className="hidden-button"
      >
        pay!
      </button>
    </form>
  );
}

export default StripeModule;
