import express from "express";
const router = express.Router();

router.post("/payment/create-order", (req, res) => {
  console.log("➡️ Create order request received");
  console.log("Amount:", req.body.amount);

  res.json({
    success: true,
    test: "route working",
    amount: req.body.amount
  });
});

export default router;
