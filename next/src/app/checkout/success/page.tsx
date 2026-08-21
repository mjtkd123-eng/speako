import { Suspense } from "react";
import CheckoutSuccessClient from "./success-client";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center">결제를 확인하고 있습니다...</p>}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
