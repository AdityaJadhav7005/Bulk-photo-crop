import express from "express";
import Razorpay from "razorpay";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay keys missing");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || ""
});

router.post("/payment/create-order", async (req, res) => {
  try {
    console.log("➡️ Create order request received");
    console.log("Amount:", req.body.amount);

    const order = await razorpay.orders.create({
      amount: Number(req.body.amount) * 100,
      currency: "INR"
    });

    console.log("✅ Order created:", order.id);
    res.json(order);
  } catch (err) {
    console.error("❌ Razorpay error:", err);
    res.status(500).json({
      error: "Order creation failed",
      details: err.message
    });
  }
});

export default router;
