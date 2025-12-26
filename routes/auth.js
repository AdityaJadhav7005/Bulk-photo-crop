import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import nodemailer from "nodemailer";

const router = express.Router();

/* ================= VERIFY EMAIL ================= */
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ verifyToken: req.params.token });
    if (!user) return res.send("Invalid or expired link");

    user.isVerified = true;
    user.verifyToken = null;
    await user.save();

    res.send("Email verified successfully. You can login now.");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ msg: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    await User.create({
      email,
      password: hash,
      verifyToken,
      isVerified: false,
      tokens: 0
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
    const link = `${BASE_URL}/api/auth/verify/${verifyToken}`;

    await transporter.sendMail({
      to: email,
      subject: "Verify your email",
      html: `<h3>Email Verification</h3>
             <p>Click below to verify your email:</p>
             <a href="${link}">${link}</a>`
    });

    res.json({ success: true, msg: "Verification email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Registration failed" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "User not found" });

    if (!user.isVerified)
      return res.status(403).json({ msg: "Verify email first" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ msg: "Wrong password" });

    res.json({
      success: true,
      email: user.email,
      tokens: user.tokens
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
