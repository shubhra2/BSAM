import { sanitizeAndSerializeProviderData } from "wasp/server/auth";
import type { DbSeedFn } from "wasp/server";

export const seedFn: DbSeedFn = async (prisma) => {
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
      upiQrImageUrl:
        "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=royalcut@upi&pn=RoyalCutBarber",
      tokenAmountDefault: 5000,
      closedDays: "[]",
    },
  });

  // 3. Create Users with properly hashed credentials via Wasp's auth tables
  const createStaffUser = async (
    username: string,
    password: string,
    extra: { displayName: string; role: string; phone: string }
  ) => {
    const providerData = await sanitizeAndSerializeProviderData<"username">({
      hashedPassword: password,
    });
    return prisma.user.create({
      data: {
        username,
        password: "", // placeholder – real auth is via Auth/AuthIdentity
        displayName: extra.displayName,
        role: extra.role,
        phone: extra.phone,
        auth: {
          create: {
            identities: {
              create: {
                providerName: "username",
                providerUserId: username,
                providerData,
              },
            },
          },
        },
      },
    });
  };

  await createStaffUser("admin", "admin123", {
    displayName: "Master Barber & Owner",
    role: "ADMIN",
    phone: "+91 9876543210",
  });

  await createStaffUser("barber1", "barber123", {
    displayName: "Vikram Barber",
    role: "BARBER",
    phone: "+91 9876543211",
  });

  // 4. Create Services
  await prisma.service.createMany({
    data: [
      {
        name: "Haircut Only",
        description: "Classic precision haircut and head wash styling.",
        imageUrl:
          "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400",
        durationMinutes: 30,
        price: 25000,
        tokenAmount: 5000,
        sortOrder: 1,
      },
      {
        name: "Haircut + Beard Trim",
        description: "Signature haircut paired with sharp beard shaping.",
        imageUrl:
          "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop",
        durationMinutes: 60,
        price: 40000,
        tokenAmount: 10000,
        sortOrder: 2,
      },
      {
        name: "Beard Trim Only",
        description: "Sharp beard shaping and styling.",
        imageUrl:
          "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400",
        durationMinutes: 30,
        price: 20000,
        tokenAmount: 5000,
        sortOrder: 3,
      },
    ],
  });

  console.log("Seeding complete!");
};
