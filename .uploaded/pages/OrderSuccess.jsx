import React, { useEffect, useState } from "react";
import Link from "next/link";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function OrderSuccess() {
  const [state, setState] = useState("loading");
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session_id = params.get("session_id");
    if (!session_id) {
      setState("error");
      return;
    }
    base44.functions
      .invoke("confirmPayment", { session_id })
      .then((res) => {
        if (res?.data?.paid) {
          setOrderId(res.data.order_id);
          setState("paid");
        } else {
          setState("pending");
        }
      })
      .catch(() => setState("error"));
  }, []);

  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      {state === "loading" && (
        <>
          <Loader2 size={40} className="animate-spin text-persimmon mx-auto mb-6" />
          <h1 className="font-display text-3xl text-carbon">Confirming your payment…</h1>
          <p className="text-carbon/60 mt-2">Please wait while we verify with Stripe.</p>
        </>
      )}
      {state === "paid" && (
        <>
          <CheckCircle2 size={56} className="text-artichoke mx-auto mb-6" />
          <h1 className="font-display text-4xl font-light text-carbon">Order confirmed!</h1>
          <p className="text-carbon/60 mt-3">
            Your payment was successful. The kitchen is preparing your order now.
          </p>
          <Link
            to="/orders"
            className="inline-block mt-8 bg-persimmon text-parchment px-7 py-4 rounded-lg text-sm uppercase tracking-[0.2em] hover:bg-carbon transition-colors"
          >
            Track My Order
          </Link>
        </>
      )}
      {state === "pending" && (
        <>
          <Loader2 size={40} className="animate-spin text-amber-500 mx-auto mb-6" />
          <h1 className="font-display text-3xl text-carbon">Payment pending</h1>
          <p className="text-carbon/60 mt-3">We couldn&apos;t confirm payment yet. If you were charged, your order will update shortly.</p>
          <Link to="/orders" className="inline-block mt-8 text-persimmon underline">View my orders</Link>
        </>
      )}
      {state === "error" && (
        <>
          <XCircle size={48} className="text-red-500 mx-auto mb-6" />
          <h1 className="font-display text-3xl text-carbon">Something went wrong</h1>
          <p className="text-carbon/60 mt-3">We couldn&apos;t verify this payment. Please contact us if you were charged.</p>
          <Link to="/" className="inline-block mt-8 text-persimmon underline">Back to menu</Link>
        </>
      )}
    </div>
  );
}
