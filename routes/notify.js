import express from "express";
import Subscriber from "../models/Subscriber.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

/**
 * USER SIGNUP
 */
// INFO / GUIDE (GET)
router.get("/notify", (req, res) => {
  res.status(200).json({
    endpoint: "/api/notify",
    method: "POST",
    description: "Subscribe a user to the GiveCircle waitlist",
    body: {
      email: "user@example.com"
    }
  });
});

// ACTION (POST)
router.post("/notify", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    let subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      await Subscriber.create({ email });
    }

    await sendEmail({
      to: email,
      subject: "You're on the GiveCircle waitlist 🎉",
      html: `
        <h2>Welcome to GiveCircle🎁</h2>
        <p>Thanks for signing up.</p><br>
        <p>We’ll notify you as soon as we launch 🚀</p>
      `
    });

    res.json({ message: "Confirmation email sent" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * ADMIN LAUNCH EMAIL
 */
// INFO / GUIDE (GET)
router.get("/notify-launch", (req, res) => {
  res.status(200).json({
    endpoint: "/api/notify-launch",
    allowedMethods: ["POST"],
    description: "Send launch emails to all subscribers (admin only)",
    headers: {
      Authorization: "ADMIN_SECRET"
    }
  });
});

// ACTION (POST)
router.post("/notify-launch", async (req, res) => {
  if (req.headers.authorization !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const subscribers = await Subscriber.find();

    for (const user of subscribers) {
      await sendEmail({
        to: user.email,
        subject: "GiveCircle is LIVE 🚀",
        html: `
          <h2>We’re live!</h2>
          <p>GiveCircle has officially launched.</p>
          <p>Come check it out!</p>
          <a href="https://givecircle.space">GiveCircle.space</a>
        `
      });
    }

    res.status(200).json({ message: "Launch emails sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send launch emails" });
  }
});

router.all(["/notify", "/notify-launch"], (req, res) => {
  res.status(405).json({
    error: "Method Not Allowed",
    allowedMethods: ["GET", "POST"]
  });
});


export default router;
