// StripePayment.js
import React, { useState } from "react";
import { Button, Card } from "antd";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { Endpoint } from "../../helper/enpoint";

const stripePromise = loadStripe("your_publishable_key_here");

const StripePaymentForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { data: clientSecret } = await axios.post(
        `${Endpoint()}/create-payment-intent`,
        {
          amount: Math.round(amount * 100),
        }
      );

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (error) {
        onError(error.message);
      } else if (paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      onError("An error occurred while processing your payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </Card>
      <Button
        type="primary"
        htmlType="submit"
        loading={isProcessing}
        disabled={!stripe}
        block
      >
        Pay {amount.toFixed(2)}€
      </Button>
    </form>
  );
};

export default StripePaymentForm;