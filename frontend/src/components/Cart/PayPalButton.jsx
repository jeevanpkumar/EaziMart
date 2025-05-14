import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalButton = ({ amount, onSuccess, onError }) => {
  return (
    <PayPalScriptProvider
      options={{
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order
            .create({
              purchase_units: [
                {
                  amount: {
                    currency_code: "USD",
                    value: parseFloat(amount).toFixed(2),
                  },
                },
              ],
            })
            .then((orderId) => {
              return orderId;
            });
        }}
        onApprove={(data, actions) => {
          return actions.order
            .capture()
            .then(onSuccess)
            .catch((err) => {
              console.error("Capture Error:", err);
              alert(`Capture Error: ${err.message}`);
              onError(err);
            });
        }}
        onError={(err) => {
          console.error("PayPal Button Error:", err);
          alert(`PayPal Button Error: ${err.message}`);
          onError(err);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;