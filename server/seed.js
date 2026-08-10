require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Program = require("./models/Program");
const Trainer = require("./models/Trainer");
const Plan = require("./models/Plan");
const User = require("./models/User");

const programs = [
  { order: 1, title: "Strength Training", description: "Barbell fundamentals, progressive overload and powerlifting technique." },
  { order: 2, title: "CrossFit Conditioning", description: "High-intensity functional workouts that build engine and grit." },
  { order: 3, title: "Boxing & Combat", description: "Pad work, bag rounds and footwork drills with certified coaches." },
  { order: 4, title: "Personal Coaching", description: "One-on-one programming built around your goals and recovery." },
  { order: 5, title: "Mobility & Recovery", description: "Stretch labs and recovery sessions to keep you training pain-free." },
  { order: 6, title: "Nutrition Coaching", description: "Meal planning and macro coaching that fits an Indian kitchen." },
];

const trainers = [
  { name: "Rohan Mehta", role: "Head of Strength", photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80" },
  { name: "Priya Nair", role: "CrossFit Coach", photo: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=500&q=80" },
  { name: "Arjun Patel", role: "Boxing Coach", photo: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&q=80" },
  { name: "Sana Sheikh", role: "Nutrition Lead", photo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80" },
];

const plans = [
  {
    key: "basic",
    name: "Basic",
    price: 999,
    period: "/mo",
    featured: false,
    features: ["Full gym floor access", "Locker room & showers", "Standard hours (6AM–10PM)"],
  },
  {
    key: "gold",
    name: "Gold",
    price: 1999,
    period: "/mo",
    featured: true,
    features: ["Everything in Basic", "24/7 access", "4 group classes / week", "Nutrition check-ins"],
  },
  {
    key: "elite",
    name: "Elite",
    price: 3499,
    period: "/mo",
    featured: false,
    features: ["Everything in Gold", "2 personal training sessions", "Recovery lab access", "Priority booking"],
  },
];

async function run() {
  await connectDB();

  await Promise.all([Program.deleteMany({}), Trainer.deleteMany({}), Plan.deleteMany({})]);

  await Program.insertMany(programs);
  await Trainer.insertMany(trainers);
  await Plan.insertMany(plans);

  const adminEmail = process.env.ADMIN_EMAIL || "newgold@admin.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin@#1234";

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "Gold Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });
    console.log(`[seed] Admin user created: ${adminEmail}`);
  } else {
    existingAdmin.password = adminPassword;
    await existingAdmin.save();
    console.log(`[seed] Admin user updated: ${adminEmail}`);
  }

  console.log("[seed] Database seeded successfully.");
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
