import { PaymentProvider, PaymentInitiationRequest, PaymentInitiationResponse } from "./types";
import businessConfig from "@/config/business-config.json";

/**
 * SkipCash Qatar Payment Provider Adapter
 * Ready to be activated via SKIPCASH_CLIENT_KEY, SKIPCASH_KEY_SECRET, and SKIPCASH_KEY_ID
 */
export class SkipCashProvider implements PaymentProvider {
  name = "SkipCash Qatar";

  isEnabled(): boolean {
    return (
      businessConfig.ordering.paymentMethods.onlinePaymentEnabled &&
      Boolean(process.env.SKIPCASH_CLIENT_KEY && process.env.SKIPCASH_KEY_SECRET)
    );
  }

  async initiatePayment(req: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    if (!this.isEnabled()) {
      return {
        success: false,
        error: "Online payment gateway is currently disabled. Please choose Cash on Delivery.",
      };
    }

    try {
      // Stub integration with SkipCash /payment/v1/payments
      const response = await fetch("https://api.skipcash.app/api/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SKIPCASH_KEY_SECRET}`,
        },
        body: JSON.stringify({
          Uid: req.orderNumber,
          KeyId: process.env.SKIPCASH_KEY_ID,
          Amount: req.amount.toFixed(2),
          FirstName: req.customerName,
          Phone: req.customerPhone,
          Email: req.customerEmail || "customer@imperiumqatar.com",
          ReturnUrl: req.callbackUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`SkipCash API returned status ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        paymentUrl: data?.resultObj?.payUrl,
        transactionId: data?.resultObj?.id,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to initiate payment gateway",
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<{ paid: boolean; error?: string }> {
    return { paid: false, error: "Gateway currently disabled in production default." };
  }
}

/**
 * Cash on Delivery / Pay at Pickup Provider
 * Default and active provider
 */
export class CashPaymentProvider implements PaymentProvider {
  name = "Cash on Delivery / Pickup";

  isEnabled(): boolean {
    return true;
  }

  async initiatePayment(req: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    return {
      success: true,
      transactionId: `cash_${req.orderNumber}`,
    };
  }

  async verifyPayment(transactionId: string): Promise<{ paid: boolean }> {
    return { paid: true };
  }
}

export function getActivePaymentProvider(): PaymentProvider {
  const skipcash = new SkipCashProvider();
  if (skipcash.isEnabled()) {
    return skipcash;
  }
  return new CashPaymentProvider();
}
