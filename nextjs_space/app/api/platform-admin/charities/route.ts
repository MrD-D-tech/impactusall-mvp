import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import bcrypt from 'bcryptjs';

/**
 * POST /api/platform-admin/charities
 * Create a new charity
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
      description,
      location,
      focusArea,
      registrationNumber,
      websiteUrl,
      logoUrl,
      monthlyFee,
      adminName,
      adminEmail,
      adminPassword,
    } = data;

    // Validation
    if (!name || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Name, admin email, and admin password are required' },
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

    // Hash the admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create charity and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the charity
      const charity = await tx.charity.create({
        data: {
          name,
          description: description || null,
          location: location || null,
          focusArea: focusArea || null,
          registrationNumber: registrationNumber || null,
          websiteUrl: websiteUrl || null,
          logoUrl: logoUrl || null,
          monthlyFee: monthlyFee ? parseFloat(monthlyFee) : 0,
          status: 'PENDING', // Requires approval
          subscriptionStatus: 'INACTIVE',
        },
      });

      // Create the charity admin user
      const admin = await tx.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName || 'Charity Admin',
          role: 'CHARITY_ADMIN',
          charityId: charity.id,
          emailVerified: new Date(), // Auto-verify for now
        },
      });

      return { charity, admin };
    });

    // Log the activity
    await logActivity(
      session.user.id,
      'CREATED_CHARITY' as any,
      'CHARITY',
      result.charity.id,
      {
        charityName: result.charity.name,
        adminEmail: result.admin.email,
      }
    );

    return NextResponse.json({
      success: true,
      charity: result.charity,
      admin: {
        id: result.admin.id,
        email: result.admin.email,
        name: result.admin.name,
      },
    });
  } catch (error) {
    console.error('Charity creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create charity' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { charityId, action, adminId, amount } = await request.json();

    let updatedCharity;
    let activityAction: string = '';

    switch (action) {
      case 'approve':
        updatedCharity = await prisma.charity.update({
          where: { id: charityId },
          data: {
            status: 'APPROVED',
            subscriptionStatus: 'ACTIVE',
          },
        });
        activityAction = 'APPROVED_CHARITY';
        break;

      case 'reject':
        updatedCharity = await prisma.charity.update({
          where: { id: charityId },
          data: { status: 'REJECTED' },
        });
        activityAction = 'REJECTED_CHARITY';
        break;

      case 'suspend':
        updatedCharity = await prisma.charity.update({
          where: { id: charityId },
          data: { subscriptionStatus: 'SUSPENDED' },
        });
        activityAction = 'SUSPENDED_CHARITY';
        break;

      case 'resume':
        updatedCharity = await prisma.charity.update({
          where: { id: charityId },
          data: { subscriptionStatus: 'ACTIVE' },
        });
        activityAction = 'UPDATED_CHARITY';
        break;

      case 'payment':
        if (!amount) {
          return NextResponse.json({ error: 'Payment amount required' }, { status: 400 });
        }

        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        updatedCharity = await prisma.charity.update({
          where: { id: charityId },
          data: {
            lastPaymentDate: new Date(),
            nextPaymentDue: nextMonth,
          },
        });
        activityAction = 'UPDATED_CHARITY';
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log the activity
    await logActivity(
      adminId,
      activityAction as any,
      'CHARITY',
      charityId,
      {
        action,
        charityName: updatedCharity.name,
        ...(amount && { amount }),
      }
    );

    return NextResponse.json(updatedCharity);
  } catch (error) {
    console.error('Charity action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
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
    const charityId = searchParams.get('id');
    const adminId = searchParams.get('adminId');

    if (!charityId || !adminId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const charity = await prisma.charity.findUnique({
      where: { id: charityId },
      select: { name: true },
    });

    if (!charity) {
      return NextResponse.json({ error: 'Charity not found' }, { status: 404 });
    }

    await prisma.charity.delete({
      where: { id: charityId },
    });

    // Log the activity
    await logActivity(
      adminId,
      'DELETED_CHARITY' as any,
      'CHARITY',
      charityId,
      { charityName: charity.name }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Charity deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete charity' },
      { status: 500 }
    );
  }
}
