import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .toLowerCase(),
  phone: z.string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(32, 'Password cannot exceed 32 characters')
});

export const loginSchema = z.object({
  phone: z.string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  password: z.string()
    .min(1, 'Password is required')
});

export const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(32, 'Password cannot exceed 32 characters')
});

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      const errorMessages = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessages
      });
    }
  };
};