import { PrismaClient, UserRole, CharityStatus, SubscriptionStatus, StoryStatus, CorporateRole, ReactionType, CommentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data in reverse dependency order
  console.log('🧹 Cleaning existing data...');
  await prisma.activityLog.deleteMany({});
  await prisma.thankYouMessage.deleteMany({});
  await prisma.storyMilestone.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.reaction.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.analytics.deleteMany({});
  await prisma.media.deleteMany({});
  await prisma.story.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.donor.deleteMany({});
  await prisma.charity.deleteMany({});

  // Hash password for all users (admin123)
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // ============================================
  // 1. CREATE PLATFORM ADMIN
  // ============================================
  console.log('👤 Creating platform admin...');
  const platformAdmin = await prisma.user.create({
    data: {
      email: 'platform@impactusall.com',
      password: hashedPassword,
      name: 'Platform Administrator',
      role: UserRole.PLATFORM_ADMIN,
      emailVerified: new Date(),
    },
  });

  // ============================================
  // 2. CREATE CHARITIES WITH ADMINS
  // ============================================
  console.log('🏥 Creating charities and charity admins...');
  
  // Charity 1: Hope Foundation
  const hopeFoundation = await prisma.charity.create({
    data: {
      name: 'Hope Foundation UK',
      description: 'Supporting vulnerable families across Greater Manchester with emergency food parcels, youth mentoring programs, and community outreach.',
      logoUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400',
      websiteUrl: 'https://hopefoundation.org.uk',
      location: 'Manchester',
      focusArea: 'Family Support & Youth Services',
      registrationNumber: 'CH123456',
      status: CharityStatus.APPROVED,
      monthlyFee: 99.00,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      lastPaymentDate: new Date('2024-12-01'),
      nextPaymentDue: new Date('2025-01-01'),
    },
  });

  const hopeAdmin = await prisma.user.create({
    data: {
      email: 'admin@hopefoundation.org.uk',
      password: hashedPassword,
      name: 'Sarah Thompson',
      role: UserRole.CHARITY_ADMIN,
      emailVerified: new Date(),
      charityId: hopeFoundation.id,
    },
  });

  // Charity 2: Green Earth Initiative
  const greenEarth = await prisma.charity.create({
    data: {
      name: 'Green Earth Initiative',
      description: 'Environmental conservation charity focused on urban rewilding, community gardens, and climate education programs in London.',
      logoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
      websiteUrl: 'https://greenearthuk.org',
      location: 'London',
      focusArea: 'Environmental Conservation',
      registrationNumber: 'CH234567',
      status: CharityStatus.APPROVED,
      monthlyFee: 149.00,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      lastPaymentDate: new Date('2024-12-05'),
      nextPaymentDue: new Date('2025-01-05'),
    },
  });

  const greenEarthAdmin = await prisma.user.create({
    data: {
      email: 'contact@greenearthuk.org',
      password: hashedPassword,
      name: 'James Mitchell',
      role: UserRole.CHARITY_ADMIN,
      emailVerified: new Date(),
      charityId: greenEarth.id,
    },
  });

  // Charity 3: Bright Futures Education
  const brightFutures = await prisma.charity.create({
    data: {
      name: 'Bright Futures Education Trust',
      description: 'Providing free tutoring, mentorship, and educational resources to disadvantaged youth across Birmingham and the West Midlands.',
      logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
      websiteUrl: 'https://brightfutures.org.uk',
      location: 'Birmingham',
      focusArea: 'Education & Youth Development',
      registrationNumber: 'CH345678',
      status: CharityStatus.APPROVED,
      monthlyFee: 99.00,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      lastPaymentDate: new Date('2024-11-28'),
      nextPaymentDue: new Date('2024-12-28'),
    },
  });

  const brightFuturesAdmin = await prisma.user.create({
    data: {
      email: 'info@brightfutures.org.uk',
      password: hashedPassword,
      name: 'Aisha Patel',
      role: UserRole.CHARITY_ADMIN,
      emailVerified: new Date(),
      charityId: brightFutures.id,
    },
  });

  // ============================================
  // 3. CREATE CORPORATE DONORS
  // ============================================
  console.log('💼 Creating corporate donors...');
  
  // Donor 1: Manchester United Foundation
  const manchesterUnited = await prisma.donor.create({
    data: {
      name: 'Manchester United Foundation',
      slug: 'manchester-united',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
      donationAmount: 500000.00,
      primaryColor: '#DA291C',
      secondaryColor: '#FBE122',
      tagline: 'United We Make a Difference - See How Your Support Changes Lives',
      websiteUrl: 'https://www.mufoundation.org',
      charityId: hopeFoundation.id,
      emailPreferences: {
        newStories: true,
        weeklyDigest: true,
        monthlyReports: true,
      },
    },
  });

  const manchesterAdmin = await prisma.user.create({
    data: {
      email: 'admin@mufoundation.org',
      password: hashedPassword,
      name: 'Robert Harrison',
      role: UserRole.CORPORATE_DONOR,
      corporateRole: CorporateRole.ADMIN,
      emailVerified: new Date(),
      donorId: manchesterUnited.id,
    },
  });

  const manchesterViewer = await prisma.user.create({
    data: {
      email: 'viewer@mufoundation.org',
      password: hashedPassword,
      name: 'Emma Richards',
      role: UserRole.CORPORATE_DONOR,
      corporateRole: CorporateRole.VIEWER,
      emailVerified: new Date(),
      donorId: manchesterUnited.id,
    },
  });

  // Donor 2: TechForGood UK
  const techForGood = await prisma.donor.create({
    data: {
      name: 'TechForGood UK',
      slug: 'techforgood-uk',
      logoUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
      donationAmount: 250000.00,
      primaryColor: '#0066FF',
      secondaryColor: '#00D9FF',
      tagline: 'Innovation Meets Compassion - Track Our Social Impact',
      websiteUrl: 'https://techforgood.uk',
      emailPreferences: {
        newStories: true,
        weeklyDigest: false,
        monthlyReports: true,
      },
    },
  });

  const techAdmin = await prisma.user.create({
    data: {
      email: 'impact@techforgood.uk',
      password: hashedPassword,
      name: 'David Chen',
      role: UserRole.CORPORATE_DONOR,
      corporateRole: CorporateRole.ADMIN,
      emailVerified: new Date(),
      donorId: techForGood.id,
    },
  });

  // ============================================
  // 4. CREATE STORIES
  // ============================================
  console.log('📖 Creating stories...');

  // Story 1: Hope Foundation + Manchester United
  const story1 = await prisma.story.create({
    data: {
      charityId: hopeFoundation.id,
      donorId: manchesterUnited.id,
      title: 'From Crisis to Hope: The Johnson Family Story',
      slug: 'johnson-family-emergency-support',
      content: `
        <h2>A Family in Need</h2>
        <p>When Emma Johnson lost her job in October, the family of four faced immediate hardship. With rent arrears mounting and cupboards bare, she reached out to Hope Foundation through our emergency helpline.</p>
        
        <h2>Immediate Response</h2>
        <p>Within 24 hours, our team delivered an emergency food parcel and connected Emma with our employability coach. Thanks to Manchester United Foundation's funding, we could provide wraparound support including:</p>
        <ul>
          <li>Weekly food parcels for 6 weeks</li>
          <li>CV writing and interview coaching</li>
          <li>Mental health counseling for the entire family</li>
          <li>School uniform vouchers for both children</li>
        </ul>
        
        <h2>A New Beginning</h2>
        <p>Just 8 weeks later, Emma secured a new position as an office administrator. The family is back on their feet, and Emma now volunteers with us to help other families facing similar challenges.</p>
        
        <blockquote>"I don't know what we would have done without Hope Foundation. They didn't just give us food - they gave us hope and a path forward. I'll never forget this kindness." - Emma Johnson</blockquote>
      `,
      excerpt: 'How emergency support and mentoring helped the Johnson family recover from sudden job loss and food insecurity.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200',
      impactMetrics: {
        families_helped: 1,
        food_parcels_delivered: 6,
        coaching_sessions: 12,
        counseling_hours: 16,
      },
      status: StoryStatus.PUBLISHED,
      publishedAt: new Date('2024-12-01'),
      createdById: hopeAdmin.id,
      updatedById: hopeAdmin.id,
    },
  });

  // Story 2: Green Earth Initiative + TechForGood
  const story2 = await prisma.story.create({
    data: {
      charityId: greenEarth.id,
      donorId: techForGood.id,
      title: 'Transforming Concrete: The Hackney Community Garden Success',
      slug: 'hackney-community-garden',
      content: `
        <h2>An Abandoned Lot Becomes an Oasis</h2>
        <p>The corner of Victoria Road in Hackney was an eyesore - littered concrete, broken fencing, and graffiti. Local residents had complained for years, but nothing changed.</p>
        
        <h2>Community-Led Transformation</h2>
        <p>With funding from TechForGood UK, Green Earth Initiative launched a 12-week community project. Over 80 local volunteers, including 30 school children, participated in:</p>
        <ul>
          <li>Clearing 2 tonnes of waste and debris</li>
          <li>Building 15 raised garden beds from reclaimed materials</li>
          <li>Planting 200+ native wildflowers and 12 fruit trees</li>
          <li>Installing rainwater harvesting systems</li>
          <li>Creating a sensory garden for elderly residents</li>
        </ul>
        
        <h2>A Thriving Community Hub</h2>
        <p>Six months on, the garden hosts weekly community events, provides fresh produce to 45 families, and has reduced local anti-social behavior by 60%. Three teenagers from the project are now pursuing horticulture apprenticeships.</p>
        
        <blockquote>"This garden has transformed our neighborhood. Kids are learning about nature, elderly neighbors have a place to meet, and we're all growing fresh veg together. It's magical." - Priya Sharma, Local Resident</blockquote>
      `,
      excerpt: 'How a derelict urban lot was transformed into a thriving community garden, bringing neighbors together and revitalizing a struggling neighborhood.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200',
      impactMetrics: {
        volunteers_engaged: 80,
        students_participated: 30,
        square_meters_transformed: 450,
        trees_planted: 12,
        families_receiving_produce: 45,
        anti_social_behavior_reduction: 60,
      },
      status: StoryStatus.PUBLISHED,
      publishedAt: new Date('2024-11-28'),
      createdById: greenEarthAdmin.id,
      updatedById: greenEarthAdmin.id,
    },
  });

  // Story 3: Bright Futures Education
  const story3 = await prisma.story.create({
    data: {
      charityId: brightFutures.id,
      title: 'From Failing to Flying: Marcus Achieves His Dream',
      slug: 'marcus-gcse-success-story',
      content: `
        <h2>Starting Behind</h2>
        <p>Marcus (15) came to Bright Futures in Year 10, struggling with Maths and English. He was predicted to fail his GCSEs, and his confidence was at rock bottom. "School just wasn't for me," he recalls. "I thought I was stupid."</p>
        
        <h2>One-to-One Support That Works</h2>
        <p>Our volunteer tutor, retired teacher Margaret Williams, worked with Marcus twice a week for 18 months. The breakthrough came when she discovered his passion for football and used sports statistics to teach Maths concepts.</p>
        
        <h3>Progress Over Time:</h3>
        <ul>
          <li><strong>October 2023:</strong> Working at Grade 2 level in Maths</li>
          <li><strong>February 2024:</strong> First mock exam - Grade 4 (pass)</li>
          <li><strong>May 2024:</strong> Second mock exam - Grade 6</li>
          <li><strong>August 2024:</strong> Final GCSE results - Grade 7 in Maths, Grade 6 in English!</li>
        </ul>
        
        <h2>A Bright Future Indeed</h2>
        <p>Marcus is now studying A-Level Maths and has been offered a football data analytics apprenticeship with a Premier League club for after sixth form.</p>
        
        <blockquote>"Margaret believed in me when I didn't believe in myself. She showed me I wasn't stupid - I just learned differently. Now I want to help other kids like me." - Marcus, Age 16</blockquote>
      `,
      excerpt: 'How personalized tutoring and mentorship helped Marcus transform from predicted failure to GCSE success and a promising career path.',
      featuredImageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200',
      impactMetrics: {
        students_supported: 1,
        tutoring_hours: 144,
        grade_improvement_levels: 5,
        gcse_passes: 2,
      },
      status: StoryStatus.PUBLISHED,
      publishedAt: new Date('2024-12-05'),
      createdById: brightFuturesAdmin.id,
      updatedById: brightFuturesAdmin.id,
    },
  });

  // ============================================
  // 5. ADD ENGAGEMENT DATA
  // ============================================
  console.log('❤️ Adding engagement data (likes, reactions, comments)...');

  // Likes for Story 1
  await prisma.like.create({
    data: {
      storyId: story1.id,
      userId: manchesterAdmin.id,
    },
  });

  await prisma.like.create({
    data: {
      storyId: story1.id,
      userId: manchesterViewer.id,
    },
  });

  await prisma.like.create({
    data: {
      storyId: story1.id,
      ipAddress: '192.168.1.100', // Anonymous like
    },
  });

  // Reactions for Story 1
  await prisma.reaction.createMany({
    data: [
      {
        storyId: story1.id,
        userId: manchesterAdmin.id,
        reactionType: ReactionType.INSPIRED,
      },
      {
        storyId: story1.id,
        userId: techAdmin.id,
        reactionType: ReactionType.GRATEFUL,
      },
      {
        storyId: story1.id,
        ipAddress: '192.168.1.101',
        reactionType: ReactionType.MOVED,
      },
      {
        storyId: story2.id,
        userId: techAdmin.id,
        reactionType: ReactionType.LOVE,
      },
      {
        storyId: story2.id,
        userId: manchesterAdmin.id,
        reactionType: ReactionType.APPLAUSE,
      },
    ],
  });

  // Comments for Story 1
  await prisma.comment.create({
    data: {
      storyId: story1.id,
      userId: manchesterAdmin.id,
      userName: 'Robert Harrison',
      userEmail: 'admin@mufoundation.org',
      content: 'This is exactly why we partner with Hope Foundation. Real families, real impact. Well done to Emma and the team!',
      status: CommentStatus.APPROVED,
      moderatedAt: new Date(),
      moderatedById: hopeAdmin.id,
    },
  });

  await prisma.comment.create({
    data: {
      storyId: story1.id,
      userName: 'Community Member',
      content: 'Beautiful story. So glad there are organizations like this helping people when they need it most.',
      status: CommentStatus.APPROVED,
      moderatedAt: new Date(),
      moderatedById: hopeAdmin.id,
    },
  });

  // Comments for Story 2
  await prisma.comment.create({
    data: {
      storyId: story2.id,
      userId: techAdmin.id,
      userName: 'David Chen',
      userEmail: 'impact@techforgood.uk',
      content: 'Incredible transformation! This is the kind of community-led change we love to support. Congratulations to everyone involved.',
      status: CommentStatus.APPROVED,
      moderatedAt: new Date(),
      moderatedById: greenEarthAdmin.id,
    },
  });

  // ============================================
  // 6. ADD ANALYTICS DATA
  // ============================================
  console.log('📊 Adding analytics data...');

  await prisma.analytics.createMany({
    data: [
      {
        storyId: story1.id,
        donorId: manchesterUnited.id,
        date: new Date('2024-12-01'),
        views: 342,
        uniqueVisitors: 287,
        likes: 45,
        shares: 12,
        comments: 8,
        reactions: 23,
        sharesTwitter: 5,
        sharesFacebook: 4,
        sharesLinkedin: 2,
        sharesWhatsapp: 1,
      },
      {
        storyId: story1.id,
        donorId: manchesterUnited.id,
        date: new Date('2024-12-02'),
        views: 156,
        uniqueVisitors: 134,
        likes: 18,
        shares: 5,
        comments: 3,
        reactions: 11,
        sharesTwitter: 2,
        sharesFacebook: 2,
        sharesLinkedin: 1,
      },
      {
        storyId: story2.id,
        donorId: techForGood.id,
        date: new Date('2024-11-28'),
        views: 489,
        uniqueVisitors: 412,
        likes: 67,
        shares: 23,
        comments: 14,
        reactions: 34,
        sharesTwitter: 8,
        sharesFacebook: 6,
        sharesLinkedin: 5,
        sharesInstagram: 4,
      },
      {
        storyId: story3.id,
        date: new Date('2024-12-05'),
        views: 234,
        uniqueVisitors: 198,
        likes: 32,
        shares: 9,
        comments: 6,
        reactions: 15,
        sharesTwitter: 3,
        sharesFacebook: 3,
        sharesLinkedin: 2,
        sharesWhatsapp: 1,
      },
    ],
  });

  // ============================================
  // 7. ADD ACTIVITY LOGS
  // ============================================
  console.log('📝 Adding activity log entries...');

  await prisma.activityLog.createMany({
    data: [
      {
        userId: platformAdmin.id,
        action: 'APPROVED_CHARITY',
        entityType: 'CHARITY',
        entityId: hopeFoundation.id,
        details: {
          charityName: 'Hope Foundation UK',
          registrationNumber: 'CH123456',
          approvalDate: '2024-11-01',
        },
        timestamp: new Date('2024-11-01T10:30:00Z'),
      },
      {
        userId: platformAdmin.id,
        action: 'APPROVED_CHARITY',
        entityType: 'CHARITY',
        entityId: greenEarth.id,
        details: {
          charityName: 'Green Earth Initiative',
          registrationNumber: 'CH234567',
          approvalDate: '2024-11-05',
        },
        timestamp: new Date('2024-11-05T14:15:00Z'),
      },
      {
        userId: platformAdmin.id,
        action: 'APPROVED_CHARITY',
        entityType: 'CHARITY',
        entityId: brightFutures.id,
        details: {
          charityName: 'Bright Futures Education Trust',
          registrationNumber: 'CH345678',
          approvalDate: '2024-11-10',
        },
        timestamp: new Date('2024-11-10T09:45:00Z'),
      },
      {
        userId: platformAdmin.id,
        action: 'CREATED_DONOR',
        entityType: 'DONOR',
        entityId: manchesterUnited.id,
        details: {
          donorName: 'Manchester United Foundation',
          donationAmount: 500000,
        },
        timestamp: new Date('2024-11-15T11:20:00Z'),
      },
      {
        userId: platformAdmin.id,
        action: 'CREATED_DONOR',
        entityType: 'DONOR',
        entityId: techForGood.id,
        details: {
          donorName: 'TechForGood UK',
          donationAmount: 250000,
        },
        timestamp: new Date('2024-11-20T16:00:00Z'),
      },
      {
        userId: hopeAdmin.id,
        action: 'PUBLISHED_STORY',
        entityType: 'STORY',
        entityId: story1.id,
        details: {
          storyTitle: 'From Crisis to Hope: The Johnson Family Story',
          publishedAt: '2024-12-01',
        },
        timestamp: new Date('2024-12-01T08:00:00Z'),
      },
      {
        userId: greenEarthAdmin.id,
        action: 'PUBLISHED_STORY',
        entityType: 'STORY',
        entityId: story2.id,
        details: {
          storyTitle: 'Transforming Concrete: The Hackney Community Garden Success',
          publishedAt: '2024-11-28',
        },
        timestamp: new Date('2024-11-28T10:30:00Z'),
      },
    ],
  });

  // ============================================
  // 8. ADD STORY MILESTONES
  // ============================================
  console.log('🎯 Adding story milestones...');

  await prisma.storyMilestone.createMany({
    data: [
      {
        storyId: story1.id,
        title: 'Emergency Food Support Started',
        description: 'First contact with Hope Foundation emergency helpline. Family assessed and emergency food parcel delivered within 24 hours.',
        date: new Date('2024-10-15'),
        displayOrder: 1,
      },
      {
        storyId: story1.id,
        title: 'Employability Coaching Begins',
        description: 'Emma connected with dedicated employability coach. CV updated and job search strategy developed.',
        date: new Date('2024-10-18'),
        displayOrder: 2,
      },
      {
        storyId: story1.id,
        title: 'First Job Interviews',
        description: 'Emma attended three job interviews with support from her coach. Interview preparation and confidence building sessions proved invaluable.',
        date: new Date('2024-11-05'),
        displayOrder: 3,
      },
      {
        storyId: story1.id,
        title: 'Job Offer Received!',
        description: 'Emma successfully secured a new position as an office administrator. Family no longer requires emergency food support.',
        date: new Date('2024-11-28'),
        displayOrder: 4,
      },
      {
        storyId: story2.id,
        title: 'Community Consultation & Design',
        description: 'Local residents participated in design workshops to plan the garden transformation. Over 60 people attended community meetings.',
        date: new Date('2024-04-15'),
        displayOrder: 1,
      },
      {
        storyId: story2.id,
        title: 'Site Clearance & Preparation',
        description: 'Volunteer weekends organized to clear waste and prepare the site. 2 tonnes of debris removed and site leveled.',
        date: new Date('2024-05-20'),
        displayOrder: 2,
      },
      {
        storyId: story2.id,
        title: 'Planting & Construction',
        description: 'Raised beds built, trees planted, and rainwater harvesting installed. Local school children participated in planting wildflowers.',
        date: new Date('2024-06-10'),
        displayOrder: 3,
      },
      {
        storyId: story2.id,
        title: 'Grand Opening Celebration',
        description: 'Community garden officially opened with celebration event. Over 200 local residents attended.',
        date: new Date('2024-07-01'),
        displayOrder: 4,
      },
    ],
  });

  // ============================================
  // 9. ADD THANK YOU MESSAGES
  // ============================================
  console.log('💌 Adding thank you messages...');

  await prisma.thankYouMessage.createMany({
    data: [
      {
        storyId: story1.id,
        authorName: 'Emma Johnson',
        message: "I don't know what we would have done without Hope Foundation. They didn't just give us food - they gave us hope and a path forward. My children have their mum back, and I have my confidence back. Thank you from the bottom of my heart to Manchester United Foundation for making this possible.",
        featured: true,
        displayOrder: 1,
      },
      {
        storyId: story1.id,
        authorName: 'The Johnson Children',
        message: "Thank you for helping our mummy. We are happy again and mummy smiles now. We love the food parcels and the new school uniforms!",
        featured: false,
        displayOrder: 2,
      },
      {
        storyId: story2.id,
        authorName: 'Priya Sharma, Local Resident',
        message: "This garden has transformed our neighborhood. My children are learning about nature, I've made wonderful new friends, and we're all growing fresh vegetables together. It's brought joy back to our street. Thank you TechForGood UK!",
        featured: true,
        displayOrder: 1,
      },
      {
        storyId: story3.id,
        authorName: 'Marcus',
        message: "Margaret and Bright Futures believed in me when I didn't believe in myself. I thought I was just bad at school, but they showed me I could succeed if I found my own way to learn. Now I'm going to help other kids like me. Thank you!",
        featured: true,
        displayOrder: 1,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log('  - 1 Platform Admin');
  console.log('  - 3 Charities with Admins');
  console.log('  - 2 Corporate Donors with 3 users');
  console.log('  - 3 Published Stories');
  console.log('  - Engagement data (likes, reactions, comments)');
  console.log('  - Analytics data');
  console.log('  - Activity logs');
  console.log('  - Story milestones');
  console.log('  - Thank you messages');
  console.log('\n🔐 Login Credentials (all users):');
  console.log('  Password: admin123');
  console.log('\n👤 Test Accounts:');
  console.log('  Platform Admin: platform@impactusall.com');
  console.log('  Hope Foundation: admin@hopefoundation.org.uk');
  console.log('  Green Earth: contact@greenearthuk.org');
  console.log('  Bright Futures: info@brightfutures.org.uk');
  console.log('  Manchester United: admin@mufoundation.org (Admin)');
  console.log('  Manchester United: viewer@mufoundation.org (Viewer)');
  console.log('  TechForGood: impact@techforgood.uk');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
