import Razorpay from "razorpay";

const MIN_AMOUNT_PAISE = 100;

type CreateOrderPayload = {
  amount?: unknown;
  currency?: unknown;
  receipt?: unknown;
};

function getClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateOrderPayload;
    const amount = Number(payload.amount);
    const currency = typeof payload.currency === "string" && payload.currency.trim().length > 0
      ? payload.currency.trim().toUpperCase()
      : "INR";
    const receipt = typeof payload.receipt === "string" && payload.receipt.trim().length > 0
      ? payload.receipt.trim()
      : `receipt_${Date.now()}`;

    if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < MIN_AMOUNT_PAISE) {
      return Response.json(
        {
          ok: false,
          message: `Amount must be an integer and at least ${MIN_AMOUNT_PAISE} paise.`,
        },
        { status: 400 },
      );
    }

    const razorpay = getClient();
    if (!razorpay) {
      return Response.json(
        {
          ok: false,
          message: "Razorpay credentials are not configured.",
        },
        { status: 500 },
      );
    }

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
    });

    return Response.json(
      {
        ok: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      { status: 200 },
    );
  } catch (error) {
    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? Number((error as { statusCode?: unknown }).statusCode)
        : null;

    if (statusCode === 401) {
      return Response.json(
        {
          ok: false,
          message: "Razorpay authentication failed.",
        },
        { status: 401 },
      );
    }

    return Response.json(
      {
        ok: false,
        message: "Unable to create order right now.",
      },
      { status: 500 },
    );
  }
}
