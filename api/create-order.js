import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const { amount, receipt } = req.body || {};
    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ message: "Invalid amount" });
      return;
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      res.status(500).json({ message: "Missing Razorpay environment variables" });
      return;
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: receipt || `saurene_${Date.now()}`
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Order creation failed", error: error.message });
  }
}
