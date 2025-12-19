import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import bcrypt from 'bcryptjs';

/**
 * POST /api/platform-admin/donors
 * Create a new corporate donor
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const {
      name,
      slug,
      logoUrl,
      donationAmount,
      primaryColor,
      secondaryColor,
      tagline,
      websiteUrl,
      charityId,
      adminName,
      adminEmail,
      adminPassword,
    } = data;

    // Validation
    if (!name || !slug || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Name, slug, admin email, and admin password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingDonor = await prisma.donor.findUnique({
      where: { slug },
    });

    if (existingDonor) {
      return NextResponse.json(
        { error: 'A donor with this slug already exists' },
        { status: 400 }
      );
    }

    // Hash the admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create donor and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the donor
      const donor = await tx.donor.create({
        data: {
          name,
          slug,
          logoUrl: logoUrl || null,
          donationAmount: donationAmount ? parseFloat(donationAmount) : null,
          primaryColor: primaryColor || '#ea580c',
          secondaryColor: secondaryColor || '#14b8a6',
          tagline: tagline || null,
          websiteUrl: websiteUrl || null,
          charityId: charityId || null,
        },
      });

      // Create the donor admin user
      const admin = await tx.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName || 'Corporate Admin',
          role: 'CORPORATE_DONOR',
          corporateRole: 'ADMIN',
          donorId: donor.id,
          emailVerified: new Date(), // Auto-verify for now
        },
      });

      return { donor, admin };
    });

    // Log the activity
    await logActivity(
      session.user.id,
      'CREATED_DONOR' as any,
      'DONOR',
      result.donor.id,
      {
        donorName: result.donor.name,
        adminEmail: result.admin.email,
      }
    );

    return NextResponse.json({
      success: true,
      donor: result.donor,
      admin: {
        id: result.admin.id,
        email: result.admin.email,
        name: result.admin.name,
      },
    });
  } catch (error) {
    console.error('Donor creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create corporate donor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const donorId = searchParams.get('id');
    const adminId = searchParams.get('adminId');

    if (!donorId || !adminId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      select: { name: true },
    });

    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    await prisma.donor.delete({
      where: { id: donorId },
    });

    // Log the activity
    await logActivity(
      adminId,
      'DELETED_DONOR',
      'DONOR',
      donorId,
      { donorName: donor.name }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Donor deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete donor' },
      { status: 500 }
    );
  }
}
