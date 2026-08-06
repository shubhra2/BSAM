import type { PrismaClient } from "@prisma/client";

export async function seedFn(prisma: PrismaClient) {
  console.log("Seeding database with default BSAM records...");

  // 1. Clear existing data
  await prisma.appointment.deleteMany({});
  await prisma.oTPVerification.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.shopSettings.deleteMany({});

  // 2. Create Shop Settings
  await prisma.shopSettings.create({
    data: {
      id: 1,
      shopName: "Royal Cut Barber Shop",
      address: "123 Main St, HSR Layout, Bengaluru",
      phone: "+91 9876543210",
      openTime: "09:00",
      closeTime: "20:00",
      slotDurationMinutes: 30,
      upiQrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=royalcut@upi&pn=RoyalCutBarber",
      tokenAmountDefault: 5000, // ₹50 token
      closedDays: "[]",
    },
  });

  // 3. Create Users
  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      password: "admin123", // In production, hash using Wasp auth password hashing
      displayName: "Master Barber & Owner",
      role: "ADMIN",
      phone: "+91 9876543210",
    },
  });

  const barberUser = await prisma.user.create({
    data: {
      username: "barber1",
      password: "barber123",
      displayName: "Vikram Barber",
      role: "BARBER",
      phone: "+91 9876543211",
    },
  });

  // 4. Create Services
  const haircut = await prisma.service.create({
    data: {
      name: "Haircut Only",
      description: "Classic precision haircut and head wash styling.",
      imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400",
      durationMinutes: 30,
      price: 25000, // ₹250
      tokenAmount: 5000, // ₹50
      sortOrder: 1,
    },
  });

  const haircutAndBeard = await prisma.service.create({
    data: {
      name: "Haircut + Beard Trim",
      description: "Signature haircut paired with sharp beard shaping and hot towel finish.",
      imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400",
      durationMinutes: 45,
      price: 40000, // ₹400
      tokenAmount: 10000, // ₹100
      sortOrder: 2,
    },
  });

  const deluxeSpa = await prisma.service.create({
    data: {
      name: "Deluxe Hair Spa & Facial",
      description: "Deep conditioning head massage, scalp spa, and invigorating charcoal facial.",
      imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400",
      durationMinutes: 60,
      price: 80000, // ₹800
      tokenAmount: 15000, // ₹150
      sortOrder: 3,
    },
  });

  console.log("Seeding complete!");
}
