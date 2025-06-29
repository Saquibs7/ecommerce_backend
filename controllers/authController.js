import ErrorHandler from "../middlewares/error.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import User from "../models/user.model.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const isValidPhone = /^(\+91)?[6-9]\d{9}$/.test(phone);
  if (!isValidPhone) {
    return next(new ErrorHandler("Invalid phone number", 400));
  }

  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  // Block verified users
  const verifiedUser = await User.findOne({
    $or: [{ email, isVerified: true }, { phone, isVerified: true }],
  });
  if (verifiedUser) {
    return next(new ErrorHandler("Email or phone already in use", 400));
  }

  // Handle unverified user
  let user = await User.findOne({
    $or: [{ email, isVerified: false }, { phone, isVerified: false }],
  });

  const verificationCode = crypto.randomInt(100000, 999999).toString();
  const verificationCodeExpires = now + 15 * 60 * 1000; // 15 minutes
  if (user) {
    // Rate limit reset
    if (!user.otpLastRequest || user.otpLastRequest < windowStart) {
      user.otpCount = 0;
    }
    if (user.otpCount >= 3) {
      return next(new ErrorHandler("Too many OTP requests. Try again later.", 429));
    }
    // Update OTP data only
    user.verificationCode = otp;
    user.verificationCodeExpires = otpExpires;
    user.otpCount += 1;
    user.otpLastRequestTime = now;
    // Keep existing password/fields unchanged
  } else {
    // Create new unverified user
    user = new User({
      name,
      email,
      phone,
      password,
      role: role || "user",
      verificationCode: otp,
      verificationCodeExpires: otpExpires,
      otpCount: 1,
      otpLastRequest: now,
    });
  }

  // Save without re-validating password on OTP resends
  await user.save({ validateBeforeSave: false });

  // Send the OTP
  await sendVerificationCode(name, email, verificationCode);

  res.status(200).json({
    success: true,
    message: "OTP sent to your email.valid for 15 minutes",
  });
});

async function sendVerificationCode(name, email, verificationCode) {
  try {
    const message = generateEmailTemplate(name, verificationCode);

    await sendEmail({
      email: email,
      subject: "Your verification code",
      message: message
    });
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    return next(new ErrorHandler("failed to send verification code", 500));
  }
}


function generateEmailTemplate(name, verificationCode) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background-color: #f3f4f6; padding: 20px; text-align: center; }
    .content { padding: 30px; line-height: 1.6; }
    .otp-box {
      background: #f8f9fa;
      border: 1px dashed #d1d5db;
      padding: 15px;
      text-align: center;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 5px;
      margin: 25px 0;
      color: #1e40af;
    }
    .footer {
      background-color: #f3f4f6;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .warning {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 12px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://example.com/logo.png" alt="Company Logo" width="150">
    </div>
    <div class="content">
      <h2>Verify Your Identity</h2>
      <p>Hello ${name},</p>
      <p>We received a request to register your account. Please use this OTP:</p>
      <div class="otp-box">${verificationCode}</div>
      <div class="warning">
        <strong>Security Notice:</strong> This code expires in 15 minutes. Never share it with anyone.
      </div>
      <p>If you didn't request this, please ignore this message.</p>
      <p>Thank you,<br>The ShopEase Security Team</p>
    </div>
    <div class="footer">
      <p>© 2025 ShopEase. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export const verifyOTP= asyncHandler(async (req,res,next)=>{
  const {email,otp}=req.body;
  if (!email || !otp) {
    return next(new ErrorHandler("Email and OTP are required", 400));
  }
  try{
    const userAllEntries= await User.find({
      $or: [{ email, isVerified: false }, { phone, isVerified: false }],

    }).sort({createdAt:-1});
    if(!userAllEntries)
    {
      return next(new ErrorHandler("user not found ",404))
    }
    let user;
    if(userAllEntries.length>1)
    {
      user= userAllEntries[0];
      await User.deleteMany({
        _id:{$ne:user._id},
        $or:[{phone,isVerified:false},{email,isVerified:false}]
      })
    }
    else{
      user= userAllEntries[0];
    }
    if(user.verificationCode!=otp)
    {
      return next(new ErrorHandler("invalid OTP",400))
    }
    const currentTime=Date.now();
    const verificationCodeExpires=new Date(user.verificationCodeExpires).getTime();
    if(currentTime>verificationCodeExpires)
    {
      return next(new ErrorHandler("OTP Expired",400))
    }
    user.isVerified=true;
    user.verificationCode=null;
    user.verificationCodeExpires=null;
    user.otpRequestCount = 0;
    await user.save({validateModifiedOnly:true});
    const token = generateToken(user._id, user.role);
     res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      },
      message: "Account verified successfully",
    });

  }
  catch(err)
  {
    console.log("Error",err)
    return next(new ErrorHandler("verification failed ",500))
  }
})
// Login with email/phone
export const login = asyncHandler(async (req, res, next) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return next(new ErrorHandler("Identifier and password are required", 400));
  }

  // Determine if identifier is email or phone
  const isEmail = identifier.includes('@');
  const isPhone = /^(\+91)?[6-9]\d{9}$/.test(identifier);

  if (!isEmail && !isPhone) {
    return next(new ErrorHandler("Invalid email or phone format", 400));
  }

  // Find user by identifier
  const user = await User.findOne({
    $or: [
      { email: isEmail ? identifier : null },
      { phone: isPhone ? identifier : null }
    ]
  }).select('+password');

  if (!user) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  // Check verification status
  if (!user.isVerified) {
    return next(new ErrorHandler("Account not verified. Please verify your account.", 403));
  }

  // Generate token
  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    },
    message: "Login successful"
  });
});


// Admin creation endpoint (protected)   {have to add details manually for the first admin}
export const createAdmin = asyncHandler(async (req, res, next) => {
  // Verify requester is admin
  if (req.user.role !== 'admin') {
    return next(new ErrorHandler("Unauthorized access", 403));
  }

  const { name, email, phone, password } = req.body;
  
  if (!name || !email || !phone || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  // Create admin user
  const admin = await User.create({
    name,
    email,
    phone,
    password,
    role: 'admin',
    isVerified: true // Admins don't need OTP verification
  });

  res.status(201).json({
    success: true,
    message: "Admin account created successfully",
    userId: admin._id
  });
});