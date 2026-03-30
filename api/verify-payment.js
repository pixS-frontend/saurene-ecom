import crypto from "node:crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ message: "Missing payment fields" });
      return;
    }
    if (!process.env.RAZORPAY_KEY_SECRET) {
      res.status(500).json({ message: "Missing RAZORPAY_KEY_SECRET" });
      return;
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;
    if (!isValid) {
      res.status(400).json({ message: "Signature verification failed" });
      return;
    }

    res.status(200).json({ verified: true });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
}
