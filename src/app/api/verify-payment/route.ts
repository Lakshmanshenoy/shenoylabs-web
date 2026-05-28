import { createHmac, timingSafeEqual } from "node:crypto";

type VerifyPayload = {
  razorpay_payment_id?: unknown;
  razorpay_order_id?: unknown;
  razorpay_signature?: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as VerifyPayload;

    const paymentId = asString(payload.razorpay_payment_id);
    const orderId = asString(payload.razorpay_order_id);
    const signature = asString(payload.razorpay_signature);

    if (!paymentId || !orderId || !signature) {
      return Response.json(
        {
          ok: false,
          message: "Missing required payment verification fields.",
        },
        { status: 400 },
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return Response.json(
        {
          ok: false,
          message: "Razorpay verification is not configured.",
        },
        { status: 500 },
      );
    }

    const digest = createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const provided = Buffer.from(signature, "utf8");
    const expected = Buffer.from(digest, "utf8");

    const isValid =
      provided.length === expected.length && timingSafeEqual(provided, expected);

    if (!isValid) {
      return Response.json(
        {
          ok: false,
          message: "Invalid payment signature.",
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        ok: true,
        message: "Payment verified successfully.",
      },
      { status: 200 },
    );
  } catch {
    return Response.json(
      {
        ok: false,
        message: "Unable to verify payment.",
      },
      { status: 400 },
    );
  }
}
