import { generateOTP, hashOTP } from "../utils/otp";
import { sendSMS } from "../utils/sms";

export { generateOTP, hashOTP, sendSMS };

export async function sendOtpSms(phone: string, otpCode: string): Promise<boolean> {
  const message = `Your BSAM verification OTP code is ${otpCode}. Valid for 5 minutes.`;
  return sendSMS(phone, message, otpCode);
}
