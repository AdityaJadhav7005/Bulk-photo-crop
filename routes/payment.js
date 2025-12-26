import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";

const router = express.Router();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ✅ CREATE ORDER
router.post("/create-order", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 5000, // ₹50 = 5000 paise
      currency: "INR",
      receipt: "receipt_" + Date.now()
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// ✅ VERIFY PAYMENT + ADD TOKENS
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      email
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false });
    }

    // add tokens to user
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false });

    user.tokens += 25; // ✅ how many tokens after payment
    await user.save();

    res.json({
      success: true,
      tokensAdded: 25
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

export default router;
