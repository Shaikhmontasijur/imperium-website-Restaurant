export interface PaymentInitiationRequest {
  orderNumber: string;
  amount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  callbackUrl: string;
}

export interface PaymentInitiationResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
}

export interface PaymentProvider {
  name: string;
  isEnabled(): boolean;
  initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse>;
  verifyPayment(transactionId: string): Promise<{ paid: boolean; error?: string }>;
}
