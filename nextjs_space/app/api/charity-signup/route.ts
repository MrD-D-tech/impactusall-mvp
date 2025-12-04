import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      charityName,
      registrationNumber,
      websiteUrl,
      location,
      focusArea,
      description,
      adminName,
      adminEmail,
      password,
    } = body;

    // Validation
    if (!charityName || !adminEmail || !password || !adminName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email address already registered' },
        { status: 400 }
      );
    }

    // Check if charity name already exists
    const existingCharity = await prisma.charity.findFirst({
      where: { name: charityName },
    });

    if (existingCharity) {
      return NextResponse.json(
        { error: 'A charity with this name is already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create charity with PENDING status
    const charity = await prisma.charity.create({
      data: {
        name: charityName,
        registrationNumber: registrationNumber || null,
        websiteUrl: websiteUrl || null,
        location: location || null,
        focusArea: focusArea || null,
        description: description || null,
        status: 'PENDING', // Requires admin approval
      },
    });

    // Create admin user account (but don't verify email yet)
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'CHARITY_ADMIN',
        charityId: charity.id,
        emailVerified: null, // Will be verified after admin approval
      },
    });

    // TODO: Send email notification to ImpactusAll admins about new charity signup
    // TODO: Send confirmation email to charity admin

    console.log('New charity signup:', {
      charityId: charity.id,
      charityName: charity.name,
      adminEmail: user.email,
      status: 'PENDING',
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      charityId: charity.id,
    });
  } catch (error) {
    console.error('Error processing charity signup:', error);
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    );
  }
}
