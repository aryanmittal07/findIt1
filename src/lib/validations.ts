import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(7, 'Please provide a valid phone number (at least 7 digits)').optional().or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    city: z.string().min(2, 'City/Location is required').optional().or(z.literal('')),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the FindIt Terms of Service and Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ['confirmPassword'],
  });

export const itemReportSchema = z.object({
  type: z.enum(['LOST', 'FOUND']),
  title: z.string().min(4, 'Title must be at least 4 characters long'),
  categoryId: z.string().min(1, 'Please select a category'),
  description: z.string().min(15, 'Please provide a clear description (at least 15 characters)'),
  brand: z.string().optional().nullable(),
  dateLostFound: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please provide a valid date',
  }),
  approxLocation: z.string().min(3, 'Approximate location is required'),
  city: z.string().min(2, 'City or area is required'),
  preferredContactMethod: z.enum(['IN_APP', 'PHONE', 'EMAIL']).default('IN_APP'),
  privacyPreference: z.enum(['STRICT_IN_APP', 'VERIFIED_ONLY', 'MASKED_PUBLIC']).default('STRICT_IN_APP'),
  rewardAmount: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
});

export const complaintSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.enum(['FRAUD', 'HARASSMENT', 'UNRESPONSIVE', 'WRONG_ITEM', 'OTHER']),
  description: z.string().min(15, 'Please describe your complaint or request in detail (min 15 characters)'),
  itemReference: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  attachmentUrl: z.string().optional().nullable(),
});

export const contactRequestSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  initialMessage: z.string().min(10, 'Message must be at least 10 characters'),
  verificationDetails: z.string().optional().nullable(),
});

export const messageSchema = z.object({
  contactRequestId: z.string().min(1, 'Contact request ID is required'),
  content: z.string().min(1, 'Message cannot be empty'),
});
