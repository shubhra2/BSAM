export interface PaymentAdapter {
  name: string;
  generatePaymentUrl(
    upiId: string,
    merchantName: string,
    amountInPaise: number,
    refId: string
  ): string;
  verifyPaymentStatus(refId: string): Promise<"VERIFIED" | "PENDING_VERIFICATION" | "REJECTED">;
}

export class StaticQrAdapter implements PaymentAdapter {
  name = "Static QR Code (UPI)";

  generatePaymentUrl(
    upiId: string,
    merchantName: string,
    amountInPaise: number,
    refId: string
  ): string {
    const amountInRupees = (amountInPaise / 100).toFixed(2);
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      merchantName
    )}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(`BSAM-${refId}`)}`;

    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      upiUrl
    )}`;
  }

  async verifyPaymentStatus(_refId: string): Promise<"VERIFIED" | "PENDING_VERIFICATION" | "REJECTED"> {
    // Static QR payment requires manual verification by Admin in dashboard
    return "PENDING_VERIFICATION";
  }
}

export const staticQrAdapter = new StaticQrAdapter();
