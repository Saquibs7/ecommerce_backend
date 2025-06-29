import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter a name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Please enter an email address"],
      lowercase: true,
      trim: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        "Please fill a valid email address"
      ]
    },
    phone: {
      type: String,
      unique: true,
      required: [true, "Please enter a phone number"],
      match: [/^\+?[0-9]{7,15}$/, "Please fill a valid phone number"]
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: [8, "Password must be at least 8 characters"],
  
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    otpRequestCount: { type: Number, default: 0 },
    otpLastRequestTime: { type: Date, default: null },

    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: {
      type: String,
      default: null
    },
    address_details:[{
        type:mongoose.Schema.ObjectId,
        ref:"Address"
    }],
    shoppingCart: [
      {
        type: Schema.Types.ObjectId,
        ref: "CartProduct"
      }
    ],
    orderHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order"
      }
    ],
    paymentMethods: [
      {
        provider: { type: String, enum: ["stripe", "paypal", "razorpay"] },
        providerAccountId: String,
        isDefault: { type: Boolean, default: false }
      }
    ]
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
const UserModel=mongoose.model("User",userSchema);
export default UserModel;