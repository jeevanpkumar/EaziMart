const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ GET /api/checkout/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }
    res.status(200).json(checkout);
  } catch (error) {
    console.error("Error in getCheckout controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ GET /api/checkout/stripe/:sessionId (new)
router.get("/stripe/:sessionId", async (req, res) => {
  try {
    const checkout = await Checkout.findOne({ stripeSessionId: req.params.sessionId });
    if (!checkout) {
      return res.status(404).json({ message: "Checkout with this Stripe session ID not found" });
    }
    res.status(200).json(checkout);
  } catch (error) {
    console.error("Error in getCheckoutByStripeId:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ POST /api/checkout
router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice, stripeSessionId } = req.body;

  if (!checkoutItems || !Array.isArray(checkoutItems) || checkoutItems.length === 0) {
    return res.status(400).json({ message: "No items in checkout" });
  }
  if (!shippingAddress || !paymentMethod || totalPrice == null) {
    return res.status(400).json({ message: "Missing checkout details" });
  }

  try {
    const newCheckout = await Checkout.create({
      user: req.user._id,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "pending",
      isPaid: false,
      stripeSessionId: stripeSessionId || null, // ⬅️ save Stripe session ID if provided
    });
    console.log(`Checkout created for user: ${req.user._id}`);
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ PUT /api/checkout/:id/pay
router.put("/:id/pay", protect, async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    if (paymentStatus === "paid") {
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = Date.now();
      await checkout.save();
      return res.status(200).json(checkout);
    }

    return res.status(400).json({ message: "Invalid Payment Status" });
  } catch (error) {
    console.error("Error in pay controller:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ POST /api/checkout/:id/finalize
router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }
    if (checkout.isFinalized) {
      return res.status(400).json({ message: "Checkout already finalized" });
    }
    if (!checkout.isPaid) {
      return res.status(400).json({ message: "Checkout is not paid" });
    }

    const finalOrder = await Order.create({
      user: checkout.user,
      orderItems: checkout.checkoutItems,
      shippingAddress: checkout.shippingAddress,
      paymentMethod: checkout.paymentMethod,
      totalPrice: checkout.totalPrice,
      isPaid: true,
      paidAt: checkout.paidAt,
      isDelivered: false,
      paymentStatus: "paid",
      paymentDetails: checkout.paymentDetails,
    });

    checkout.isFinalized = true;
    checkout.finalizedAt = Date.now();
    await checkout.save();

    await Cart.findOneAndDelete({ user: checkout.user });

    return res.status(201).json(finalOrder);
  } catch (error) {
    console.error("Error in finalize controller:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
