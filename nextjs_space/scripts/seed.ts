import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Image URLs from asset retrieval
const IMAGES = {
  charities: {
    northernHospice: 'https://cdn.abacus.ai/images/a78ebd5b-f108-4b30-9982-50044ff08513.png',
    manchesterHomeless: 'https://cdn.abacus.ai/images/6910a580-5813-4204-9898-424dec2cf004.png',
    refugeeSupport: 'https://cdn.abacus.ai/images/2f246b36-180f-4987-a13e-de9807d1fdbd.png',
    mindsMatter: 'https://cdn.abacus.ai/images/2ad3389f-8e7a-4460-92ae-15839985013c.png',
  },
  donors: {
    manUnited: '/images/man-united-hero.jpg',
  },
  stories: {
    emmaStory: '/images/emma-story.jpg',
    jamesStory: '/images/james-story.jpg',
    wilsonFamily: '/images/wilson-family-story.jpg',
    sarahStory: '/images/sarah-story.jpg',
  },
};

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.analytics.deleteMany();
  await prisma.thankYouMessage.deleteMany();
  await prisma.storyMilestone.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.like.deleteMany();
  await prisma.media.deleteMany();
  await prisma.story.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.donor.deleteMany();
  await prisma.charity.deleteMany();

  // Create default test user (john@doe.com)
  console.log('👤 Creating test user...');
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  const testUser = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'PUBLIC_USER',
      emailVerified: new Date(),
    },
  });

  // Create Charities supported by Man United
  console.log('🏥 Creating charities...');
  const northernHospice = await prisma.charity.create({
    data: {
      name: 'Northern Children\'s Hospice',
      description: 'A Greater Manchester hospice providing specialist palliative care to children with life-limiting conditions and support for their families. We ensure every moment counts.',
      logoUrl: IMAGES.charities.northernHospice,
      websiteUrl: 'https://northernhospice.org.uk',
      location: 'Greater Manchester',
      focusArea: 'Children\'s Palliative Care',
    },
  });

  const manchesterHomeless = await prisma.charity.create({
    data: {
      name: 'Streets to Homes Manchester',
      description: 'Manchester-based charity dedicated to ending rough sleeping by providing emergency shelter, rehabilitation support, employment training, and pathways to permanent housing.',
      logoUrl: IMAGES.charities.manchesterHomeless,
      websiteUrl: 'https://streetstohomes.org.uk',
      location: 'Manchester',
      focusArea: 'Homelessness & Employment',
    },
  });

  const refugeeSupport = await prisma.charity.create({
    data: {
      name: 'New Beginnings Manchester',
      description: 'Supporting refugee families to rebuild their lives in Greater Manchester through housing assistance, integration support, education, and community connections.',
      logoUrl: IMAGES.charities.refugeeSupport,
      websiteUrl: 'https://newbeginningsmanchester.org.uk',
      location: 'Manchester',
      focusArea: 'Refugee Support & Integration',
    },
  });

  const mindsMatter = await prisma.charity.create({
    data: {
      name: 'Minds Matter Youth',
      description: 'Manchester youth mental health charity providing counseling, peer support groups, crisis intervention, and wellbeing programmes for young people aged 13-25.',
      logoUrl: IMAGES.charities.mindsMatter,
      websiteUrl: 'https://mindsmatteryouth.org.uk',
      location: 'Manchester',
      focusArea: 'Youth Mental Health',
    },
  });

  // Create Manchester United as the corporate donor
  console.log('⚽ Creating Manchester United donor...');
  const manUnited = await prisma.donor.create({
    data: {
      name: 'Manchester United',
      slug: 'manchester-united',
      logoUrl: IMAGES.donors.manUnited,
      donationAmount: 100000,
      charityId: northernHospice.id,
      primaryColor: '#DA291C',  // Man United red
      secondaryColor: '#FBE122',  // Man United gold
      tagline: '£100,000 donated in 2024 & 2025 - Transforming Lives Across Greater Manchester',
    },
  });

  // Helper function to create dates in the past
  const daysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  // Create Impact Stories - All funded by Manchester United
  console.log('📖 Creating Manchester United impact stories...');

  // Story 1: Emma's Story - Hospice Care
  const emmaStory = await prisma.story.create({
    data: {
      charityId: northernHospice.id,
      donorId: manUnited.id,
      title: "Emma's Gift: Precious Moments That Matter Most",
      slug: 'emmas-gift-precious-moments',
      excerpt: "When Emma's seven-year-old daughter Lily was diagnosed with a life-limiting condition, Manchester United's support gave them something priceless: time together filled with love, dignity, and beautiful memories.",
      content: `<div class="space-y-6">
<p>There are no words to truly capture what it means to know your child's time is limited. Emma, a lifelong Manchester United supporter, faced this unimaginable reality when her vibrant seven-year-old daughter Lily was diagnosed with a degenerative neurological condition.</p>

<p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"The diagnosis shattered our world," Emma recalls, tears welling in her eyes. "The doctors told us Lily had maybe 18 months. I remember thinking: how do I make every single day count? How do I give her the childhood she deserves when we're running out of time?"</p>

<h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">Manchester United's Support</h3>

<p>Through Manchester United's partnership with Northern Children's Hospice, Emma and Lily received specialist palliative care that transformed their remaining time together. The hospice provided not just medical support, but memory-making opportunities, respite care for the family, and counselling to help them navigate the emotional journey ahead.</p>

<p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"The hospice team became our extended family," Emma shares. "They helped us create a memory book, organised a special visit from former United players, and most importantly, they gave Lily dignity and joy. She painted, she laughed, she played - she was a child, not just a patient."</p>

<h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">A Birthday to Remember</h3>

<p>On Lily's eighth birthday - a milestone Emma feared they'd never reach - the hospice organised a Manchester United-themed party. Players sent video messages. The room was decorated in red and gold. Lily wore her United shirt with pride.</p>

<p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"That day, watching Lily's face light up, I realised something," Emma says softly. "Manchester United didn't just support us financially - they showed us we weren't alone. Every parent at that hospice knows: when you wear the red shirt, you're part of a family that cares. That means everything."</p>

<h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">Lily's Legacy</h3>

<p>Lily passed away peacefully at the hospice six months later, surrounded by love, with her Manchester United teddy bear in her arms. Emma now volunteers at the hospice, supporting other families walking the same heartbreaking path.</p>

<p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"Lily's legacy is love," Emma says. "And Manchester United helped us create that legacy. I'll forever be grateful."</p>
</div>`,
      featuredImageUrl: IMAGES.stories.emmaStory,
      impactMetrics: {
        families_helped: 25,
        hours_of_care: 5000,
        memory_making_sessions: 150,
        counselling_sessions: 380,
      },
      status: 'PUBLISHED',
      publishedAt: daysAgo(7),
      createdById: testUser.id,
    },
  });

  // Story 2: James's Story - Homeless to Employed
  const jamesStory = await prisma.story.create({
    data: {
      charityId: manchesterHomeless.id,
      donorId: manUnited.id,
      title: "James: From Sleeping Rough to Building Dreams",
      slug: 'james-from-streets-to-success',
      excerpt: "After 18 months sleeping rough on Manchester's streets, James thought his life was over. Today, thanks to Manchester United's support, he has a job, a home, and hope for the future.",
      content: `<div class="space-y-6">
<p>James, 32, never imagined he'd become homeless. A skilled carpenter, he lost his job during the pandemic. Unable to pay rent, he ended up on Manchester's streets - cold, ashamed, and invisible.</p>

<p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"People walk past you like you're not human," James says, his voice still heavy with the memory. "I'd see United fans heading to Old Trafford on match days, and I'd remember when that was me - before everything fell apart. I felt like I'd disappeared from the world."</p>

<h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">A Turning Point</h3>

<p>Everything changed when a Streets to Homes outreach worker, funded by Manchester United's donation, found James sleeping in a doorway near the stadium. Instead of just offering a bed for the night, they offered a pathway to rebuild his entire life.</p>

<p>The programme provided emergency accommodation, addiction support (James had turned to alcohol to cope with street life), mental health counselling, and crucially - employment training and job placement support.</p>

<p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"They didn't judge me," James reflects. "They saw potential in me when I couldn't see it myself. The caseworker, Sarah, she'd check in every single day. She believed I could do this."</p>

<h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">Building a New Life</h3>

<p>Within four months, James completed a construction site safety course. Two months after that, he secured full-time employment with a building firm. Last month, he moved into his own flat - the first time in two years he's had his own front door key.</p>

<p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"When I walked into that empty flat, I just stood there and cried," James admits. "Happy tears, grateful tears. I have a home. I have a job. I have my life back."</p>

<h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">Coming Home</h3>

<p>James recently attended his first United match in over two years. "Sitting in that stadium, watching the game, being part of something bigger than myself again - it felt like coming home," he says. "Manchester United gave me more than financial support. They gave me my identity back. They reminded me I matter."</p>

<p>Today, James volunteers with Streets to Homes, helping other rough sleepers find their way off the streets. "If my story can give one person hope, it's worth sharing," he says with quiet determination.</p>
</div>`,
      featuredImageUrl: IMAGES.stories.jamesStory,
      impactMetrics: {
        people_helped: 18,
        nights_of_shelter: 1440,
        employment_training_hours: 320,
        jobs_secured: 12,
      },
      status: 'PUBLISHED',
      publishedAt: daysAgo(14),
      createdById: testUser.id,
    },
  });

  // Story 3: Wilson Family - Refugee Support
  const wilsonStory = await prisma.story.create({
    data: {
      charityId: refugeeSupport.id,
      donorId: manUnited.id,
      title: "The Wilson Family: Finding Home in Manchester",
      slug: 'wilson-family-finding-home',
      excerpt: "Fleeing conflict with nothing but hope, the Wilson family arrived in Manchester as refugees. Today, thanks to Manchester United's support, they're not just surviving - they're thriving, with jobs, education, and a place to call home.",
      content: `<div class="space-y-6">
<p>When the Wilson family - David, Grace, and their three children - arrived in Manchester as refugees, they carried only one suitcase and a lifetime of trauma. Fleeing war-torn Sudan, they'd lost everything: their home, their community, their sense of belonging.</p>

<p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"We were so scared," Grace remembers, her youngest daughter Amara nestled beside her. "New country, new language, no family, no friends. We didn't know if we'd ever feel safe again. We didn't know if Manchester would welcome us."</p>

<h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">A Fresh Start</h3>

<p>Through New Beginnings Manchester, funded by Manchester United's donation, the Wilsons received comprehensive resettlement support: temporary housing, English language classes, school enrolment for the children, job training for the parents, and crucially - a welcoming community.</p>

<p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"The support workers didn't just help us with paperwork," David explains, his English now fluent. "They introduced us to neighbours. They helped my children join football clubs - Amara plays for a girls' team now, wearing her United kit with so much pride. They made us feel like we belonged here."</p>

<h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">Rebuilding Their Lives</h3>

<p>Within six months, Grace secured part-time work at a local nursery. David completed an IT training course and now works for a Manchester tech company. The children are thriving in school, making friends, learning English faster than their parents.</p>

<p>Most significantly, the family recently moved into their own council flat - their first permanent home since fleeing Sudan three years ago.</p>

<p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"When we got the keys to our flat, we all just hugged and cried," Grace shares, her voice breaking. "For the first time in years, we felt like a family again, not just people trying to survive. We had a home."</p>

<h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">Becoming Mancunians</h3>

<p>The flat is modest but filled with warmth. Manchester United posters adorn the children's bedroom walls. David laughs: "We arrived knowing nothing about football. Now we're season ticket holders! United gave us more than support - they gave us belonging. When we wear the red shirt, we're not refugees, we're Mancunians."</p>

<p>Last month, David and Grace attended a United match with their children - their first live game. "Watching my children sing alongside other United fans, cheering together - I had tears streaming down my face," David recalls. "This club, this city, these people - they gave us hope when we had none. They gave us a future."</p>

<p>Amara, 10, dreams of playing for Manchester United Women one day. "I want to make my club proud," she says with unwavering determination, "because they made my family proud to be here."</p>
</div>`,
      featuredImageUrl: IMAGES.stories.wilsonFamily,
      impactMetrics: {
        families_helped: 12,
        people_supported: 47,
        english_classes: 240,
        jobs_secured: 15,
        children_in_school: 28,
      },
      status: 'PUBLISHED',
      publishedAt: daysAgo(21),
      createdById: testUser.id,
    },
  });

  // Story 4: Sarah's Story - Mental Health
  const sarahStory = await prisma.story.create({
    data: {
      charityId: mindsMatter.id,
      donorId: manUnited.id,
      title: "Sarah's Journey: Breaking the Silence on Mental Health",
      slug: 'sarah-breaking-silence-mental-health',
      excerpt: "At 17, Sarah was drowning in depression and anxiety, too afraid to ask for help. Manchester United's support for youth mental health services gave her the courage to speak up - and saved her life.",
      content: `<div class="space-y-6">
<p>Sarah, now 19, remembers the darkness vividly. At 17, she was a straight-A student with a bright future. But behind the smiles and achievements, she was silently drowning in depression and crippling anxiety.</p>

<p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"I felt like I was suffocating," Sarah recalls, her voice steady but emotional. "I'd wake up and the world felt grey. I couldn't eat. I couldn't sleep. I had constant panic attacks. But I was too ashamed to tell anyone - I thought people would think I was weak or attention-seeking."</p>

<h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">The Breaking Point</h3>

<p>The breaking point came one night when Sarah, overwhelmed by suicidal thoughts, finally confided in her mother. Terrified but determined to help, her mother contacted Minds Matter Youth, a Manchester mental health charity supported by Manchester United's community fund.</p>

<p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"Getting help was the hardest and best decision I've ever made," Sarah shares. "That first phone call felt impossible. But the counsellor on the other end - her voice was so calm, so understanding. She told me: 'You're not weak. You're brave. Asking for help is the strongest thing you can do.'"</p>

<h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">Finding Support</h3>

<p>Through Minds Matter, Sarah accessed free counselling, joined a peer support group for young people with similar struggles, and learnt coping strategies that transformed her relationship with her mental health.</p>

<p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"The peer support group changed my life," Sarah explains. "Meeting other teenagers who understood exactly what I was going through - the anxiety, the dark thoughts, the shame - made me realise I wasn't alone. We'd laugh, we'd cry, we'd support each other. It was like finding a second family."</p>

<h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">A New Beginning</h3>

<p>Over 18 months of therapy and peer support, Sarah gradually rebuilt her life. She returned to college, started volunteering for Minds Matter (helping answer the crisis hotline), and even began sharing her mental health journey publicly to reduce stigma.</p>

<p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"Mental health struggles don't make you broken," Sarah says with quiet conviction. "They make you human. And reaching out for support doesn't make you weak - it makes you courageous."</p>

<h3 class="text-2xl font-bold text-slate-800 mt-8 mb-4">Giving Back</h3>

<p>Sarah recently gave a talk at a Manchester United Community Foundation event about youth mental health. "Standing there, sharing my story with other United fans, I felt so proud," she reflects. "Manchester United didn't just fund a counselling service - they funded hope. They funded recovery. They funded futures."</p>

<p>"When people ask me what saved my life, I tell them: asking for help, and Manchester United making that help available. Without that support, I genuinely don't think I'd be here today. Now, I want to help other young people realise they're worth fighting for too."</p>
</div>`,
      featuredImageUrl: IMAGES.stories.sarahStory,
      impactMetrics: {
        young_people_supported: 156,
        counselling_hours: 2340,
        peer_support_sessions: 312,
        lives_changed: 156,
      },
      status: 'PUBLISHED',
      publishedAt: daysAgo(28),
      createdById: testUser.id,
    },
  });

  // Add Story Milestones
  console.log('📍 Adding story milestones...');
  
  // Milestones for Emma's Story
  await prisma.storyMilestone.createMany({
    data: [
      {
        storyId: emmaStory.id,
        title: 'Diagnosis & Hospice Referral',
        description: 'Lily was diagnosed with a life-limiting condition. Emma contacted Northern Children\'s Hospice for support.',
        date: daysAgo(365),
        displayOrder: 1,
      },
      {
        storyId: emmaStory.id,
        title: 'First Hospice Visit',
        description: 'Emma and Lily\'s first visit to the hospice. The team created a personalized care plan focused on making precious memories.',
        date: daysAgo(300),
        displayOrder: 2,
      },
      {
        storyId: emmaStory.id,
        title: 'Memory-Making Programme',
        description: 'Lily began the memory-making programme: painting, music therapy, and special experiences with family.',
        date: daysAgo(240),
        displayOrder: 3,
      },
      {
        storyId: emmaStory.id,
        title: 'Manchester United Visit',
        description: 'Former United players visited the hospice. Lily met her heroes and received a signed shirt - a moment she treasured.',
        date: daysAgo(180),
        displayOrder: 4,
      },
      {
        storyId: emmaStory.id,
        title: 'Lily\'s 8th Birthday Party',
        description: 'A milestone Emma feared they\'d never reach. The hospice organized a United-themed party filled with love and joy.',
        date: daysAgo(90),
        displayOrder: 5,
      },
      {
        storyId: emmaStory.id,
        title: 'Lily\'s Legacy',
        description: 'Lily passed away peacefully at the hospice. Emma now volunteers, supporting other families on their journey.',
        date: daysAgo(40),
        displayOrder: 6,
      },
    ],
  });

  // Milestones for James's Story
  await prisma.storyMilestone.createMany({
    data: [
      {
        storyId: jamesStory.id,
        title: 'Found on the Streets',
        description: 'Outreach worker Sarah found James sleeping rough near Old Trafford. She offered immediate shelter and support.',
        date: daysAgo(240),
        displayOrder: 1,
      },
      {
        storyId: jamesStory.id,
        title: 'Emergency Accommodation',
        description: 'James moved into emergency accommodation. For the first time in 18 months, he had a safe place to sleep.',
        date: daysAgo(210),
        displayOrder: 2,
      },
      {
        storyId: jamesStory.id,
        title: 'Beginning Recovery',
        description: 'James began addiction counselling and mental health support. The journey to recovery had started.',
        date: daysAgo(180),
        displayOrder: 3,
      },
      {
        storyId: jamesStory.id,
        title: 'Skills Training',
        description: 'James completed construction site safety certification, reigniting his passion for carpentry work.',
        date: daysAgo(120),
        displayOrder: 4,
      },
      {
        storyId: jamesStory.id,
        title: 'Employment Secured',
        description: 'James secured full-time employment with a local building firm. His confidence was returning.',
        date: daysAgo(60),
        displayOrder: 5,
      },
      {
        storyId: jamesStory.id,
        title: 'First Own Flat',
        description: 'James moved into his own flat - his first home in over two years. He finally had his life back.',
        date: daysAgo(20),
        displayOrder: 6,
      },
    ],
  });

  // Milestones for Wilson Family
  await prisma.storyMilestone.createMany({
    data: [
      {
        storyId: wilsonStory.id,
        title: 'Arrival in Manchester',
        description: 'The Wilson family arrived as refugees with one suitcase and immense hope. They were frightened but determined.',
        date: daysAgo(420),
        displayOrder: 1,
      },
      {
        storyId: wilsonStory.id,
        title: 'Temporary Housing',
        description: 'New Beginnings Manchester provided temporary accommodation and began comprehensive resettlement support.',
        date: daysAgo(400),
        displayOrder: 2,
      },
      {
        storyId: wilsonStory.id,
        title: 'Children Start School',
        description: 'All three children enrolled in local schools. They began learning English and making their first friends.',
        date: daysAgo(360),
        displayOrder: 3,
      },
      {
        storyId: wilsonStory.id,
        title: 'Parents Secure Employment',
        description: 'Grace found work at a nursery. David completed IT training and joined a Manchester tech company.',
        date: daysAgo(270),
        displayOrder: 4,
      },
      {
        storyId: wilsonStory.id,
        title: 'Permanent Housing',
        description: 'The Wilsons moved into their own council flat - their first permanent home in three years.',
        date: daysAgo(120),
        displayOrder: 5,
      },
      {
        storyId: wilsonStory.id,
        title: 'First United Match',
        description: 'The family attended their first Manchester United match. They felt like true Mancunians, finally home.',
        date: daysAgo(30),
        displayOrder: 6,
      },
    ],
  });

  // Milestones for Sarah's Story
  await prisma.storyMilestone.createMany({
    data: [
      {
        storyId: sarahStory.id,
        title: 'Reaching Breaking Point',
        description: 'Sarah, overwhelmed by depression and suicidal thoughts, finally confided in her mother. Help was sought.',
        date: daysAgo(540),
        displayOrder: 1,
      },
      {
        storyId: sarahStory.id,
        title: 'First Counselling Session',
        description: 'Sarah attended her first therapy session at Minds Matter. The journey to recovery had begun.',
        date: daysAgo(520),
        displayOrder: 2,
      },
      {
        storyId: sarahStory.id,
        title: 'Joining Peer Support Group',
        description: 'Sarah joined a peer support group for young people. Finding others who understood changed everything.',
        date: daysAgo(480),
        displayOrder: 3,
      },
      {
        storyId: sarahStory.id,
        title: 'Returning to College',
        description: 'With renewed strength, Sarah returned to college. She was learning to manage her mental health.',
        date: daysAgo(360),
        displayOrder: 4,
      },
      {
        storyId: sarahStory.id,
        title: 'Becoming a Volunteer',
        description: 'Sarah began volunteering for Minds Matter, answering the crisis hotline and supporting other young people.',
        date: daysAgo(180),
        displayOrder: 5,
      },
      {
        storyId: sarahStory.id,
        title: 'Sharing Her Story Publicly',
        description: 'Sarah spoke at a United Community Foundation event, using her story to reduce mental health stigma.',
        date: daysAgo(30),
        displayOrder: 6,
      },
    ],
  });

  // Add Reactions
  console.log('😍 Adding reactions...');
  await prisma.reaction.createMany({
    data: [
      { storyId: emmaStory.id, userId: testUser.id, reactionType: 'LOVE' },
      { storyId: emmaStory.id, ipAddress: '192.168.1.1', reactionType: 'MOVED' },
      { storyId: emmaStory.id, ipAddress: '192.168.1.2', reactionType: 'GRATEFUL' },
      { storyId: emmaStory.id, ipAddress: '192.168.1.3', reactionType: 'MOVED' },
      { storyId: jamesStory.id, userId: testUser.id, reactionType: 'INSPIRED' },
      { storyId: jamesStory.id, ipAddress: '192.168.1.4', reactionType: 'APPLAUSE' },
      { storyId: jamesStory.id, ipAddress: '192.168.1.5', reactionType: 'GRATEFUL' },
      { storyId: wilsonStory.id, userId: testUser.id, reactionType: 'LOVE' },
      { storyId: wilsonStory.id, ipAddress: '192.168.1.6', reactionType: 'INSPIRED' },
      { storyId: wilsonStory.id, ipAddress: '192.168.1.7', reactionType: 'GRATEFUL' },
      { storyId: sarahStory.id, userId: testUser.id, reactionType: 'APPLAUSE' },
      { storyId: sarahStory.id, ipAddress: '192.168.1.8', reactionType: 'INSPIRED' },
      { storyId: sarahStory.id, ipAddress: '192.168.1.9', reactionType: 'MOVED' },
    ],
  });

  // Add Comments
  console.log('💬 Adding comments...');
  await prisma.comment.createMany({
    data: [
      {
        storyId: emmaStory.id,
        userId: testUser.id,
        userName: 'John Doe',
        userEmail: 'john@doe.com',
        content: 'I\'m in tears reading this. So proud to be a United supporter. Emma and Lily - you\'re heroes. ❤️',
        status: 'APPROVED',
      },
      {
        storyId: emmaStory.id,
        userName: 'RedDevil4Life',
        content: 'This is what makes Manchester United truly special. More than a club. Emma, your strength is inspiring.',
        status: 'APPROVED',
      },
      {
        storyId: jamesStory.id,
        userName: 'MancsRed',
        userEmail: 'supporter@example.com',
        content: 'James, you absolute legend. So happy you\'re back on your feet. Welcome home, mate! 🔴',
        status: 'APPROVED',
      },
      {
        storyId: jamesStory.id,
        userId: testUser.id,
        userName: 'John Doe',
        userEmail: 'john@doe.com',
        content: 'Stories like this remind me why I love this club. Real impact. Real change. GGMU! 👏',
        status: 'APPROVED',
      },
      {
        storyId: wilsonStory.id,
        userName: 'UnitedFamily',
        content: 'Welcome to Manchester, Wilson family! You belong here. So proud of what our club is doing. ❤️',
        status: 'APPROVED',
      },
      {
        storyId: sarahStory.id,
        userName: 'MindsMatterFan',
        content: 'Sarah, thank you for your courage in sharing this. You\'re saving lives. Proud of you! 💪',
        status: 'APPROVED',
      },
    ],
  });

  // Add Thank You Messages
  console.log('💝 Adding thank you messages...');
  
  await prisma.thankYouMessage.createMany({
    data: [
      {
        storyId: emmaStory.id,
        authorName: 'Emma',
        message: 'To every Manchester United supporter: you gave my daughter dignity, joy, and the most beautiful final chapter of her life. You gave us precious memories I\'ll treasure forever. You showed us what it truly means to be part of the United family. Thank you from the bottom of my heart. Lily loved you all.',
        featured: true,
        displayOrder: 1,
      },
      {
        storyId: jamesStory.id,
        authorName: 'James',
        message: 'I was invisible for 18 months. Manchester United made me visible again. You didn\'t just give me shelter - you gave me hope, dignity, and a future. I have my life back because you cared. I\'ll never forget that. I\'m proud to be a Red.',
        featured: true,
        displayOrder: 1,
      },
      {
        storyId: wilsonStory.id,
        authorName: 'David & Grace Wilson',
        message: 'We arrived in Manchester with nothing but fear and hope. Manchester United gave us belonging, opportunity, and a home. You showed us that refugees aren\'t burdens - we\'re human beings deserving of dignity. Our children now dream in English and cheer for United. We\'re not just grateful - we\'re forever proud to be part of this community. Thank you for welcoming us.',
        featured: true,
        displayOrder: 1,
      },
      {
        storyId: wilsonStory.id,
        authorName: 'Amara Wilson',
        authorPhotoUrl: null,
        message: 'I want to play for Manchester United Women one day. Not just because I love football, but because this club believed in my family when no one else did. They gave us a home. I want to make them proud. GGMU! 🔴⚽',
        featured: false,
        displayOrder: 2,
      },
      {
        storyId: sarahStory.id,
        authorName: 'Sarah',
        message: 'I don\'t know if I\'d be alive today without the mental health support Manchester United funded. You gave me counselling when I couldn\'t afford it. You gave me a peer support group when I felt utterly alone. You gave me hope when I had none. Now I\'m helping others find that same hope. Thank you for saving my life and giving me purpose.',
        featured: true,
        displayOrder: 1,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log('- 1 test user created (john@doe.com / johndoe123)');
  console.log('- 4 charities created');
  console.log('- 1 corporate donor created (Manchester United)');
  console.log('- 4 emotional impact stories created');
  console.log('- 24 story milestones added');
  console.log('- 13 reactions added');
  console.log('- 6 comments added');
  console.log('- 5 thank you messages added');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });