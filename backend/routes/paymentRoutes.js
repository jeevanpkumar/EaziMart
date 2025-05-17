const express = require("express");
const { stripe } = require("../lib/stripe.js");
const { protect } = require("../middleware/authMiddleware.js");
const Checkout = require("../models/Checkout");

const router = express.Router();

router.post("/create-stripe-session", protect, async (req, res) => {
  try {
    const { products, checkoutId } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    if (!checkoutId) {
      return res.status(400).json({ error: "Missing checkoutId" });
    }

    const checkout = await Checkout.findById(checkoutId);
    if (!checkout) {
      return res.status(404).json({ error: "Checkout not found" });
    }

    let totalAmount = 0;

    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // Stripe uses cents
      totalAmount += amount * product.quantity;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&checkout_id=${checkoutId}`,
      cancel_url: `${process.env.FRONTEND_URL}/purchase-cancel`,
      metadata: {
        userId: req.user._id.toString(),
        checkoutId: checkoutId,
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    res.status(200).json({ id: session.id, url: session.url, totalAmount: totalAmount / 100 });

  } catch (error) {
    console.error("Error processing Stripe session:", error);
    res.status(500).json({ message: "Error processing Stripe session", error: error.message });
  }
});

module.exports = router;

