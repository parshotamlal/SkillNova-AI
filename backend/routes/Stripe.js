import express from "express";
import Stripe from "stripe";

const router = express.Router();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
if (!stripeSecretKey) {
  const errorMessage =
    "Stripe configuration error: STRIPE_SECRET_KEY is not set. " +
    "Please add STRIPE_SECRET_KEY to your .env file or environment variables before starting the app.";
  console.error(errorMessage);
  throw new Error(errorMessage);
}

const stripe = new Stripe(stripeSecretKey);

router.post("/create-checkout-session", async (req, res) => {
  const { planName } = req.body;

  const priceMap = {
    Pro: {
      name: "Pro Plan Subscription",
      amount: 149900,
    },
  };

  if (!priceMap[planName]) {
    return res.status(400).json({ error: "Invalid plan selected" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: priceMap[planName].name,
            },
            unit_amount: priceMap[planName].amount,
          },
          quantity: 1,
        },
      ],
      success_url: "https://resumes-analyzer.vercel.app/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://resumes-analyzer.vercel.app/pricing?cancelled=true",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


export default router;
