// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?\d{8,15}$/, "Please enter a valid phone number"],
    },
    country: String,
    city: String,
    state: String,
    idCardFront: String,
    idCardBack: String,
    role: {
      type: String,
      lowercase: true,
      enum: ["entrepreneur", "supplier", "investor", "admin"],
      required: true,
    },

    // Entrepreneur specific
    startupName: String,
    ideaDescription: String,
    startupStage: { type: String },
    pitchLink: String,
    pitchPdf: String,

    // Supplier specific
    supplierType: { type: String },
    serviceField: String,
    portfolioLink: {
      type: String,
      match: [/^https?:\/\/.+/, "Please enter a valid URL"],
    },
    companyProfile: String,

    // Investor specific
    investmentRange: {
      min: Number,
      max: Number,
    },
    linkedIn: {
      type: String,
      unique: true,
      match: [/^https?:\/\/.+/, "Please enter a valid URL"],
    },
    website: {
      type: String,
      unique: true,
      match: [/^https?:\/\/.+/, "Please enter a valid URL"],
    },
    typeOfSupport: [String],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: String,

    password: { type: String, required: true, minlength: 6 },

    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String, default: "" },
    blockedAt: { type: Date, default: null },
    blockExpiresAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },

    // صورة البروفايل
    profileImage: {
      url: { type: String },
      public_id: { type: String },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
