export function generateUpiQrUrl(
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
