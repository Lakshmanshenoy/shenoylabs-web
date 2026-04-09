"use client";

import { useEffect, useRef } from "react";

type Props = {
  buttonId: string;
};

export function RazorpayButtonEmbed({ buttonId }: Props) {
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    form.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.async = true;
    script.setAttribute("data-payment_button_id", buttonId);

    form.appendChild(script);

    return () => {
      form.innerHTML = "";
    };
  }, [buttonId]);

  return <form ref={formRef} />;
}
