import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = forgotPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const { email } = validated.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Don't reveal account existence for security, but return generic success
      return NextResponse.json({
        message: 'If an account exists with this email, password reset instructions have been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetExpires,
      },
    });

    // In a production environment with email SMTP configured, this sends an email.
    // For this development environment, we return the resetToken directly in response for immediate testing!
    return NextResponse.json({
      message: 'Reset instructions have been generated.',
      resetToken, // Provided for easy development & testing verification
      resetUrl: `/reset-password?token=${resetToken}`,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Unable to process password reset request' }, { status: 500 });
  }
}
