export async function sendSMS(
  phone: string,
  text: string,
  otpCode?: string
): Promise<boolean> {
  const apiKey = process.env.MSG91_API_KEY;
  const senderId = process.env.MSG91_SENDER_ID || "BSAMPL";

  console.log(`[SMS SENDER] Phone: ${phone} | Body: "${text}" | OTP Code: ${otpCode || "N/A"}`);

  // Recognize mock values
  const isMock =
    !apiKey ||
    apiKey === "your_msg91_api_key_here" ||
    apiKey.trim() === "" ||
    apiKey.includes("placeholder");

  if (isMock) {
    console.log("[SMS SENDER] Running in SMS mock mode (default placeholder config).");
    return true;
  }

  try {
    // Clean phone number (needs at least country code without starting + symbol for MSG91)
    const cleanedPhone = phone.replace(/[+\s-]/g, "");

    const response = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        "authkey": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        template_id: process.env.MSG91_TEMPLATE_ID || "65be2fbbd6fc05553e1a0b52",
        sender: senderId,
        recipients: [
          {
            mobiles: cleanedPhone,
            otp: otpCode,
            message: text,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`[SMS SENDER] MSG91 returned status ${response.status}`);
      return false;
    }

    const result = await response.json();
    console.log("[SMS SENDER] MSG91 trigger response:", result);
    return true;
  } catch (e) {
    console.error("[SMS SENDER] Exception while sending SMS:", e);
    return false;
  }
}
