import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'PUBLIC_USER',
        verificationToken,
      },
    });

    // TODO: Send verification email (implement email service)
    // For now, we'll auto-verify in development
    if (process.env.NODE_ENV === 'development') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          verificationToken: null,
        },
      });
    }

    return NextResponse.json(
      {
        message: 'Account created successfully! You can now log in.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
