const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Hash passwords
  const hashedAdminPass = await bcrypt.hash('admin123', 10)
  const hashedUserPass = await bcrypt.hash('password123', 10)

  // 1. Create Platform Admin User
  console.log('Creating platform admin...')
  const platformAdmin = await prisma.user.upsert({
    where: { email: 'platform@impactusall.com' },
    update: {},
    create: {
      email: 'platform@impactusall.com',
      password: hashedAdminPass,
      name: 'Platform Administrator',
      role: 'PLATFORM_ADMIN',
      emailVerified: new Date(),
    },
  })

  // 2. Create Test Charities
  console.log('Creating test charities...')
  const shelter = await prisma.charity.upsert({
    where: { id: 'charity-shelter-001' },
    update: {},
    create: {
      id: 'charity-shelter-001',
      name: 'Hope Shelter',
      description: 'Providing shelter and support for homeless individuals in Manchester',
      logoUrl: 'https://placehold.co/400x400/0284c7/ffffff?text=Hope+Shelter',
      websiteUrl: 'https://hopeshelter.org.uk',
      location: 'Manchester, UK',
      focusArea: 'Homelessness',
      registrationNumber: 'CH123456',
      status: 'APPROVED',
      monthlyFee: 99.99,
      subscriptionStatus: 'ACTIVE',
      lastPaymentDate: new Date(),
      nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  const foodBank = await prisma.charity.upsert({
    where: { id: 'charity-foodbank-001' },
    update: {},
    create: {
      id: 'charity-foodbank-001',
      name: 'Community Food Bank',
      description: 'Fighting hunger and food insecurity in local communities',
      logoUrl: 'https://placehold.co/400x400/059669/ffffff?text=Food+Bank',
      websiteUrl: 'https://communityfoodbank.org.uk',
      location: 'London, UK',
      focusArea: 'Food Security',
      registrationNumber: 'CH789012',
      status: 'APPROVED',
      monthlyFee: 79.99,
      subscriptionStatus: 'ACTIVE',
      lastPaymentDate: new Date(),
      nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  const youthCenter = await prisma.charity.upsert({
    where: { id: 'charity-youth-001' },
    update: {},
    create: {
      id: 'charity-youth-001',
      name: 'Youth Empowerment Centre',
      description: 'Supporting young people through education and mentorship programs',
      logoUrl: 'https://placehold.co/400x400/7c3aed/ffffff?text=Youth+Centre',
      websiteUrl: 'https://youthempowerment.org.uk',
      location: 'Birmingham, UK',
      focusArea: 'Youth Services',
      registrationNumber: 'CH345678',
      status: 'APPROVED',
      monthlyFee: 89.99,
      subscriptionStatus: 'ACTIVE',
      lastPaymentDate: new Date(),
      nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // 3. Create Charity Admin Users
  console.log('Creating charity admin users...')
  const shelterAdmin = await prisma.user.upsert({
    where: { email: 'admin@hopeshelter.org' },
    update: {},
    create: {
      email: 'admin@hopeshelter.org',
      password: hashedUserPass,
      name: 'Sarah Johnson',
      role: 'CHARITY_ADMIN',
      charityId: shelter.id,
      emailVerified: new Date(),
    },
  })

  const foodBankAdmin = await prisma.user.upsert({
    where: { email: 'admin@communityfoodbank.org' },
    update: {},
    create: {
      email: 'admin@communityfoodbank.org',
      password: hashedUserPass,
      name: 'Michael Chen',
      role: 'CHARITY_ADMIN',
      charityId: foodBank.id,
      emailVerified: new Date(),
    },
  })

  const youthAdmin = await prisma.user.upsert({
    where: { email: 'admin@youthempowerment.org' },
    update: {},
    create: {
      email: 'admin@youthempowerment.org',
      password: hashedUserPass,
      name: 'Emma Williams',
      role: 'CHARITY_ADMIN',
      charityId: youthCenter.id,
      emailVerified: new Date(),
    },
  })

  // 4. Create Test Donors
  console.log('Creating test donors...')
  const manchesterUnited = await prisma.donor.upsert({
    where: { slug: 'manchester-united' },
    update: {},
    create: {
      name: 'Manchester United Foundation',
      slug: 'manchester-united',
      logoUrl: 'https://placehold.co/400x400/dc2626/ffffff?text=Man+Utd',
      donationAmount: 50000.00,
      primaryColor: '#dc2626',
      secondaryColor: '#000000',
      tagline: 'Making a difference in our community',
      websiteUrl: 'https://www.mufoundation.org',
      emailPreferences: {
        newStories: true,
        weeklyDigest: true,
        monthlyReports: true,
      },
    },
  })

  const techCorp = await prisma.donor.upsert({
    where: { slug: 'techcorp-uk' },
    update: {},
    create: {
      name: 'TechCorp UK',
      slug: 'techcorp-uk',
      logoUrl: 'https://placehold.co/400x400/0284c7/ffffff?text=TechCorp',
      donationAmount: 25000.00,
      primaryColor: '#0284c7',
      secondaryColor: '#14b8a6',
      tagline: 'Technology for good',
      websiteUrl: 'https://www.techcorp.co.uk',
      emailPreferences: {
        newStories: true,
        weeklyDigest: false,
        monthlyReports: true,
      },
    },
  })

  // 5. Create Corporate Donor Users
  console.log('Creating corporate donor users...')
  const donorAdmin = await prisma.user.upsert({
    where: { email: 'donor@manchesterunited.com' },
    update: {},
    create: {
      email: 'donor@manchesterunited.com',
      password: hashedUserPass,
      name: 'David Miller',
      role: 'CORPORATE_DONOR',
      corporateRole: 'ADMIN',
      donorId: manchesterUnited.id,
      emailVerified: new Date(),
    },
  })

  const donorViewer = await prisma.user.upsert({
    where: { email: 'viewer@techcorp.co.uk' },
    update: {},
    create: {
      email: 'viewer@techcorp.co.uk',
      password: hashedUserPass,
      name: 'Lisa Anderson',
      role: 'CORPORATE_DONOR',
      corporateRole: 'VIEWER',
      donorId: techCorp.id,
      emailVerified: new Date(),
    },
  })

  // 6. Create Test Stories
  console.log('Creating test stories...')
  const story1 = await prisma.story.upsert({
    where: { id: 'story-001' },
    update: {},
    create: {
      id: 'story-001',
      charityId: shelter.id,
      donorId: manchesterUnited.id,
      title: 'A New Beginning: James Finds Home',
      slug: 'new-beginning-james-finds-home',
      excerpt: 'After two years on the streets, James finally has a place to call home thanks to your support.',
      content: '<h2>From Streets to Stability</h2><p>James spent two years living on the streets of Manchester after losing his job and struggling with mental health issues. Through the support of Hope Shelter and generous donations from Manchester United Foundation, James now has his own flat and is rebuilding his life.</p><p>He\'s attending counseling sessions, learning new skills, and recently started a part-time job. "I never thought I\'d have a normal life again," James says. "But thanks to everyone who believed in me, I\'m finally home."</p>',
      featuredImageUrl: 'https://placehold.co/1200x600/0284c7/ffffff?text=James+Story',
      impactMetrics: {
        people_housed: 1,
        counseling_sessions: 24,
        months_of_support: 6,
      },
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdById: shelterAdmin.id,
      updatedById: shelterAdmin.id,
    },
  })

  const story2 = await prisma.story.upsert({
    where: { id: 'story-002' },
    update: {},
    create: {
      id: 'story-002',
      charityId: foodBank.id,
      donorId: techCorp.id,
      title: 'Feeding 100 Families This Month',
      slug: 'feeding-100-families-this-month',
      excerpt: 'With your help, we\'ve provided essential food packages to families in need across London.',
      content: '<h2>Nourishing Communities</h2><p>This month, Community Food Bank reached a milestone: 100 families received weekly food packages thanks to donations from TechCorp UK and community volunteers.</p><p>Each package contains fresh produce, essential staples, and nutritious meals designed by our team of nutritionists. "It\'s not just about food," says coordinator Michael Chen. "It\'s about dignity, health, and hope."</p>',
      featuredImageUrl: 'https://placehold.co/1200x600/059669/ffffff?text=Food+Bank',
      impactMetrics: {
        families_helped: 100,
        meals_provided: 2400,
        volunteers_engaged: 25,
      },
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      createdById: foodBankAdmin.id,
      updatedById: foodBankAdmin.id,
    },
  })

  const story3 = await prisma.story.upsert({
    where: { id: 'story-003' },
    update: {},
    create: {
      id: 'story-003',
      charityId: youthCenter.id,
      title: 'Scholarship Program Launches for 20 Students',
      slug: 'scholarship-program-launches',
      excerpt: 'Twenty young people will receive full scholarships for vocational training programs.',
      content: '<h2>Empowering the Next Generation</h2><p>Youth Empowerment Centre is proud to announce our new scholarship program, providing 20 young people with free access to vocational training in technology, healthcare, and trades.</p><p>"Education changes lives," says Emma Williams, program director. "These scholarships will open doors that were previously closed to these talented young people."</p>',
      featuredImageUrl: 'https://placehold.co/1200x600/7c3aed/ffffff?text=Youth+Programme',
      impactMetrics: {
        scholarships_awarded: 20,
        training_hours: 800,
        mentors_engaged: 15,
      },
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdById: youthAdmin.id,
      updatedById: youthAdmin.id,
    },
  })

  // 7. Create Activity Log Entries
  console.log('Creating activity log entries...')
  const activities = [
    {
      userId: platformAdmin.id,
      action: 'APPROVED_CHARITY',
      entityType: 'CHARITY',
      entityId: shelter.id,
      details: {
        charityName: 'Hope Shelter',
        registrationNumber: 'CH123456',
      },
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      userId: platformAdmin.id,
      action: 'APPROVED_CHARITY',
      entityType: 'CHARITY',
      entityId: foodBank.id,
      details: {
        charityName: 'Community Food Bank',
        registrationNumber: 'CH789012',
      },
      timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    },
    {
      userId: platformAdmin.id,
      action: 'APPROVED_CHARITY',
      entityType: 'CHARITY',
      entityId: youthCenter.id,
      details: {
        charityName: 'Youth Empowerment Centre',
        registrationNumber: 'CH345678',
      },
      timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
    {
      userId: platformAdmin.id,
      action: 'CREATED_DONOR',
      entityType: 'DONOR',
      entityId: manchesterUnited.id,
      details: {
        donorName: 'Manchester United Foundation',
        donationAmount: 50000.00,
      },
      timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      userId: platformAdmin.id,
      action: 'CREATED_DONOR',
      entityType: 'DONOR',
      entityId: techCorp.id,
      details: {
        donorName: 'TechCorp UK',
        donationAmount: 25000.00,
      },
      timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
    {
      userId: platformAdmin.id,
      action: 'UPDATED_USER',
      entityType: 'USER',
      entityId: shelterAdmin.id,
      details: {
        userName: 'Sarah Johnson',
        role: 'CHARITY_ADMIN',
        change: 'Assigned to Hope Shelter',
      },
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      userId: platformAdmin.id,
      action: 'APPROVED_STORY',
      entityType: 'STORY',
      entityId: story1.id,
      details: {
        storyTitle: 'A New Beginning: James Finds Home',
        charityName: 'Hope Shelter',
      },
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      userId: platformAdmin.id,
      action: 'APPROVED_STORY',
      entityType: 'STORY',
      entityId: story2.id,
      details: {
        storyTitle: 'Feeding 100 Families This Month',
        charityName: 'Community Food Bank',
      },
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ]

  for (const activity of activities) {
    await prisma.activityLog.create({
      data: activity,
    })
  }

  // 8. Create some likes
  console.log('Creating likes...')
  await prisma.like.createMany({
    data: [
      {
        storyId: story1.id,
        userId: donorAdmin.id,
      },
      {
        storyId: story1.id,
        userId: donorViewer.id,
      },
      {
        storyId: story2.id,
        userId: shelterAdmin.id,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log('- Platform Admin: platform@impactusall.com / admin123')
  console.log('- Charities: 3 (Hope Shelter, Community Food Bank, Youth Empowerment Centre)')
  console.log('- Charity Admins: 3')
  console.log('- Donors: 2 (Manchester United Foundation, TechCorp UK)')
  console.log('- Corporate Users: 2')
  console.log('- Stories: 3 published stories')
  console.log('- Activity Logs: 8 entries')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
