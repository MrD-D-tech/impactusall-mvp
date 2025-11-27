import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Image URLs from asset retrieval
const IMAGES = {
  charities: {
    hopeForHomes: 'https://cdn.abacus.ai/images/a78ebd5b-f108-4b30-9982-50044ff08513.png',
    foodShareUK: 'https://cdn.abacus.ai/images/6910a580-5813-4204-9898-424dec2cf004.png',
    youthFutures: 'https://cdn.abacus.ai/images/2f246b36-180f-4987-a13e-de9807d1fdbd.png',
  },
  donors: {
    techCorpUK: 'https://cdn.abacus.ai/images/2ad3389f-8e7a-4460-92ae-15839985013c.png',
    retailGroup: 'https://cdn.abacus.ai/images/6ff5d758-8a0c-4915-aec8-e2a35ed87b20.png',
  },
  stories: {
    sarahsJourney: 'https://cdn.abacus.ai/images/5d70fc69-b926-4489-8f5a-0ad13fded1d6.png',
    feeding500Families: 'https://www.bigissue.com/wp-content/uploads/2022/09/P1190298-scaled.jpg',
    youthMentorship: 'https://sport4life.org.uk/wp-content/uploads/2022/03/DSC_0017-scaled.jpg',
    warmHomes: 'https://nursesgrouphomecare.co.uk/images/blog/keeping-warm-in-winter-elderly.jpg',
    communityGarden: 'https://images.squarespace-cdn.com/content/v1/600c166e2c69ea16574993f0/5894ba40-5bca-4a88-bce3-00bb395ec25e/IMG_1592.jpg',
    mentalHealth: 'https://euc7zxtct58.exactdn.com/wp-content/uploads/2022/05/09132052/Workplace_Team-1200x630.jpg?strip=all&lossy=1&quality=85&ssl=1',
    jobSkills: 'https://cdn.abacus.ai/images/1e827524-97b3-49c6-8351-7ce6894dc75f.png',
    afterSchool: 'https://cdn.abacus.ai/images/d5b407dc-6aee-4640-8bf5-d35ed4860fdc.png',
    emergencyFood: 'https://i.guim.co.uk/img/media/bbfde8dfc6100b17b163ecab0cfe9c1cd4ac2344/0_196_6048_3631/master/6048.jpg?width=1200&quality=85&auto=format&fit=max&s=12eeac1a2d6bd229a6b04bdc1b82b6be',
    housingFirst: 'https://ichef.bbci.co.uk/news/1024/branded_news/029a/live/bfa396d0-9909-11f0-a4f9-7b230f03cd8e.jpg',
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

  // Create Charities
  console.log('🏥 Creating charities...');
  const hopeForHomes = await prisma.charity.create({
    data: {
      name: 'Hope for Homes',
      description: 'A London-based charity dedicated to ending homelessness by providing emergency accommodation, support services, and pathways to permanent housing. We work with individuals and families to rebuild their lives with dignity and hope.',
      logoUrl: IMAGES.charities.hopeForHomes,
      websiteUrl: 'https://hopeforhomes.org.uk',
      location: 'London',
      focusArea: 'Homelessness & Housing',
    },
  });

  const foodShareUK = await prisma.charity.create({
    data: {
      name: 'FoodShare UK',
      description: 'A network of food banks across Greater Manchester providing emergency food parcels and essential support to families facing food insecurity. We believe no one should go hungry.',
      logoUrl: IMAGES.charities.foodShareUK,
      websiteUrl: 'https://foodshareuk.org.uk',
      location: 'Manchester',
      focusArea: 'Food Banks & Nutrition',
    },
  });

  const youthFutures = await prisma.charity.create({
    data: {
      name: 'Youth Futures',
      description: 'Birmingham youth organisation providing mentorship, education support, and life skills training for young people aged 11-25. We help young people reach their full potential.',
      logoUrl: IMAGES.charities.youthFutures,
      websiteUrl: 'https://youthfutures.org.uk',
      location: 'Birmingham',
      focusArea: 'Youth Services & Education',
    },
  });

  // Create Corporate Donors
  console.log('🏢 Creating corporate donors...');
  const techCorp = await prisma.donor.create({
    data: {
      name: 'TechCorp UK',
      slug: 'techcorp-uk',
      logoUrl: IMAGES.donors.techCorpUK,
      donationAmount: 50000,
      charityId: hopeForHomes.id,
    },
  });

  const retailGroup = await prisma.donor.create({
    data: {
      name: 'RetailGroup PLC',
      slug: 'retailgroup-plc',
      logoUrl: IMAGES.donors.retailGroup,
      donationAmount: 75000,
      charityId: foodShareUK.id,
    },
  });

  // Helper function to create dates in the past
  const daysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  // Create Impact Stories
  console.log('📖 Creating impact stories...');

  // Story 1: Sarah's Journey (Hope for Homes + TechCorp)
  const story1 = await prisma.story.create({
    data: {
      charityId: hopeForHomes.id,
      donorId: techCorp.id,
      title: "Sarah's Journey from Streets to Stability",
      slug: 'sarahs-journey-from-streets-to-stability',
      excerpt: 'After two years of rough sleeping in London, Sarah found hope and a place to call home through our emergency accommodation programme.',
      content: `<p>Sarah's story is one of resilience, hope, and transformation. For two years, she experienced the harsh reality of homelessness on London's streets after losing her job and falling behind on rent.</p>

<p>"I never thought it would happen to me," Sarah recalls. "One day I had a flat and a job, the next I was sleeping in doorways. It felt like the world had forgotten me."</p>

<p>Through Hope for Homes' emergency accommodation programme, funded by TechCorp UK, Sarah was given a safe place to stay whilst working with dedicated support workers. The programme provided more than just a roof - it offered counselling, job training, and most importantly, belief in her future.</p>

<p>Within six months, Sarah secured stable employment and moved into her own flat. Today, she volunteers with Hope for Homes, helping others who are experiencing what she went through.</p>

<p>"Having somewhere safe to sleep changed everything," Sarah says. "But having people who believed in me - that's what truly saved my life. Now I want to give that same hope to others."</p>`,
      featuredImageUrl: IMAGES.stories.sarahsJourney,
      impactMetrics: {
        families_helped: 1,
        nights_of_shelter: 180,
        support_sessions: 24,
        outcome: 'Permanent housing secured',
      },
      status: 'PUBLISHED',
      publishedAt: daysAgo(15),
      createdById: testUser.id,
    },
  });

  // Story 2: Feeding 500 Families (FoodShare UK + RetailGroup)
  const story2 = await prisma.story.create({
    data: {
      charityId: foodShareUK.id,
      donorId: retailGroup.id,
      title: 'Feeding 500 Families This Winter',
      slug: 'feeding-500-families-this-winter',
      excerpt: 'Thanks to RetailGroup PLC, our Manchester food banks have provided emergency food parcels to 500 families facing food insecurity this winter.',
      content: `<p>This winter has been particularly challenging for families across Greater Manchester, with the cost of living crisis forcing more households to seek emergency food support than ever before.</p>

<p>Thanks to a generous donation from RetailGroup PLC, FoodShare UK has been able to distribute over 500 emergency food parcels to families in need across the region.</p>

<p>"We've seen a 45% increase in demand compared to last year," explains Maria, FoodShare UK's Operations Manager. "Without support from partners like RetailGroup, we simply couldn't meet this need."</p>

<p>Each food parcel contains nutritious meals for a family of four for three days, including fresh fruit and vegetables, tinned goods, and essentials like bread and milk. But it's about more than just food - it's about dignity and hope during difficult times.</p>

<p>One mother of three told us: "I never thought I'd need a food bank, but when it came to choosing between heating and eating, I had no choice. The volunteers here treated me with such kindness - they reminded me that asking for help isn't shameful, it's brave."</p>`,
      featuredImageUrl: IMAGES.stories.feeding500Families,
      impactMetrics: {
        families_helped: 500,
        food_parcels_distributed: 500,
        meals_provided: 6000,
        volunteers_involved: 45,
      },
      status: 'PUBLISHED',
      publishedAt: daysAgo(22),
      createdById: testUser.id,
    },
  });

  // Story 3: Youth Mentorship Programme
  const story3 = await prisma.story.create({
    data: {
      charityId: youthFutures.id,
      title: 'Empowering Young People Through Mentorship',
      slug: 'empowering-young-people-through-mentorship',
      excerpt: 'Our mentorship programme has matched 50 young people with dedicated mentors, helping them navigate challenges and achieve their goals.',
      content: `<p>For many young people in Birmingham, having a positive role model can make all the difference between giving up and achieving their potential.</p>

<p>Youth Futures' mentorship programme pairs young people aged 14-18 with trained volunteer mentors who provide guidance, support, and encouragement over a 12-month period.</p>

<p>James, 16, was struggling at school and considering dropping out when he was matched with his mentor, David. "David believed in me when I didn't believe in myself," James says. "He helped me see that my past doesn't define my future."</p>

<p>With David's support, James not only stayed in school but improved his grades significantly. He's now planning to go to college to study engineering.</p>

<p>"The mentorship programme gave me more than just academic support," James reflects. "It gave me someone who genuinely cared about my wellbeing and my dreams. That's priceless."</p>

<p>This year, we've matched 50 young people with mentors, with 85% reporting improved confidence and clearer goals for their future.</p>`,
      featuredImageUrl: IMAGES.stories.youthMentorship,
      impactMetrics: {
        young_people_supported: 50,
        mentorship_hours: 1200,
        improved_confidence: 85,
        stayed_in_education: 92,
      },
      status: 'PUBLISHED',
      publishedAt: daysAgo(30),
      createdById: testUser.id,
    },
  });

  // Story 4: Warm Homes Winter Campaign
  const story4 = await prisma.story.create({
    data: {
      charityId: hopeForHomes.id,
      title: 'Keeping Vulnerable People Warm This Winter',
      slug: 'keeping-vulnerable-people-warm-this-winter',
      excerpt: 'Our winter warmth programme has helped 120 elderly and vulnerable people heat their homes safely during the coldest months.',
      content: `<p>For many older people living alone, winter can be a frightening and isolating time, especially when faced with impossible choices between heating and eating.</p>

<p>Hope for Homes' Winter Warmth Programme provides emergency heating support, warm clothing, and home visits to vulnerable people across London.</p>

<p>Margaret, 78, lives alone in a small flat. Last winter, she was hospitalised with pneumonia after going without heating for weeks. "I was too proud to ask for help," she admits. "I thought I could manage."</p>

<p>This year, through our programme, Margaret received a new efficient heater, warm bedding, and regular welfare visits from volunteers. "I can't tell you what a difference it's made," she says with tears in her eyes. "Not just the practical help, but knowing that someone cares."</p>

<p>We've supported 120 people like Margaret this winter, ensuring no one has to choose between warmth and food.</p>`,
      featuredImageUrl: IMAGES.stories.warmHomes,
      impactMetrics: {
        people_supported: 120,
        heaters_provided: 45,
        home_visits: 360,
        prevented_hospital_admissions: 12,
      },
      status: 'PUBLISHED',
      publishedAt: daysAgo(40),
      createdById: testUser.id,
    },
  });

  // Story 5: Community Garden Project
  const story5 = await prisma.story.create({
    data: {
      charityId: foodShareUK.id,
      title: 'Growing Food, Growing Community',
      slug: 'growing-food-growing-community',
      excerpt: 'Our urban community garden has brought neighbours together whilst growing fresh, healthy food for local families.',
      content: `<p>In a corner of Manchester where green space is scarce, an abandoned plot has been transformed into a thriving community garden, bringing neighbours together and providing fresh produce for local families.</p>

<p>The FoodShare UK Community Garden Project started with just six volunteers and a vision. Today, over 50 local residents regularly tend the garden, growing vegetables, herbs, and fruit that supplement food bank supplies with fresh, nutritious produce.</p>

<p>"It's about so much more than vegetables," explains Amina, one of the founding volunteers. "It's given our community a heart. People who never spoke before are now friends. Isolated older people have found purpose. Kids are learning where food comes from."</p>

<p>The garden has produced over 500kg of fresh produce this year, all donated to local food banks. But perhaps more importantly, it's created a space where people from all backgrounds come together, share skills, and support one another.</p>

<p>"This garden saved me," says Tom, who was struggling with depression. "Getting my hands in the soil, watching things grow, being part of something - it gave me a reason to get out of bed again."</p>`,
      featuredImageUrl: IMAGES.stories.communityGarden,
      impactMetrics: {
        volunteers: 50,
        fresh_produce_kg: 500,
        families_benefited: 85,
        community_events: 12,
      },
      status: 'PUBLISHED',
      publishedAt: daysAgo(50),
      createdById: testUser.id,
    },
  });

  // Story 6: Mental Health Support Groups
  await prisma.story.create({
    data: {
      charityId: youthFutures.id,
      title: 'Breaking the Silence on Youth Mental Health',
      slug: 'breaking-the-silence-on-youth-mental-health',
      excerpt: 'Our peer support groups provide a safe space for young people to talk about mental health challenges and support one another.',
      content: `<p>Mental health challenges among young people have reached crisis levels, yet many struggle in silence, afraid of judgement or simply not knowing where to turn.</p>

<p>Youth Futures' peer support groups create safe, non-judgemental spaces where young people can share their experiences and support one another through difficult times.</p>

<p>Facilitated by trained youth workers and mental health professionals, the groups meet weekly and cover topics from anxiety and depression to stress management and building resilience.</p>

<p>"Before I found this group, I thought I was the only one struggling," shares Katie, 17. "Hearing others talk about similar experiences made me realise I wasn't alone or weird. It gave me permission to be honest about how I was feeling."</p>

<p>The groups emphasise peer support rather than therapy - young people helping and learning from each other. The results have been remarkable, with participants reporting reduced feelings of isolation and improved coping strategies.</p>

<p>"It's the highlight of my week," says Connor, 15. "These people get it because they've been there. We laugh, we cry, we support each other. It's like having a second family."</p>`,
      featuredImageUrl: IMAGES.stories.mentalHealth,
      impactMetrics: {
        young_people: 35,
        support_sessions: 144,
        improved_wellbeing: 89,
        peer_supporters_trained: 8,
      },
      status: 'PUBLISHED',
      publishedAt: daysAgo(60),
      createdById: testUser.id,
    },
  });

  // Story 7: Job Skills Training
  await prisma.story.create({
    data: {
      charityId: hopeForHomes.id,
      donorId: techCorp.id,
      title: 'From Unemployment to Employment',
      slug: 'from-unemployment-to-employment',
      excerpt: 'Our job readiness programme has helped 28 people secure stable employment through skills training and employer partnerships.',
      content: `<p>Finding work after a period of homelessness can feel impossible. Many employers are reluctant to hire people with gaps in their CV, and without an address, even applying for jobs becomes a challenge.</p>

<p>Hope for Homes' Job Readiness Programme, funded by TechCorp UK, provides practical skills training, CV building, interview preparation, and direct pathways to employment through partnerships with local employers.</p>

<p>Michael, 34, had been homeless for 18 months when he joined the programme. "I'd lost all confidence," he remembers. "I didn't think anyone would give me a chance."</p>

<p>Through the programme, Michael completed a forklift operator certification and received support with job applications. Within three months, he secured full-time employment at a local warehouse.</p>

<p>"Having a job has transformed my life," Michael says. "It's not just about the money - though that's obviously important. It's about having purpose, routine, and dignity again. I'm rebuilding my life step by step."</p>

<p>This year, 28 programme participants have secured employment, with an impressive 85% still employed after six months.</p>`,
      featuredImageUrl: IMAGES.stories.jobSkills,
      impactMetrics: {
        people_trained: 40,
        jobs_secured: 28,
        still_employed_6_months: 85,
        training_hours: 960,
      },
      status: 'PUBLISHED',
      publishedAt: daysAgo(70),
      createdById: testUser.id,
    },
  });

  // Story 8: After-School Club
  await prisma.story.create({
    data: {
      charityId: youthFutures.id,
      title: 'A Safe Space After School',
      slug: 'a-safe-space-after-school',
      excerpt: 'Our after-school club provides a safe, nurturing environment where 60 children can learn, play, and thrive every day.',
      content: `<p>For working parents struggling to balance jobs with childcare, the hours between school ending and work finishing can be incredibly stressful. For children, unsupervised time can mean missing out on enrichment activities and, in some cases, safety risks.</p>

<p>Youth Futures' after-school club fills this gap, providing a safe, engaging environment where children aged 5-11 can do homework, enjoy activities, and simply be children.</p>

<p>The club runs five days a week, offering a hot snack, homework support, sports, arts and crafts, and most importantly, caring adult supervision.</p>

<p>"It's been a lifeline for our family," says Rachel, mother of two. "Knowing my kids are safe, happy, and learning after school means I can work without constant worry. They love it there - they've made friends and discovered new interests I could never have afforded otherwise."</p>

<p>For many children, it's also their only chance to access activities like art, music, and sport. The club has partnerships with local coaches and artists who volunteer their time.</p>

<p>"I used to go home to an empty house," shares Lily, 9. "Now I come here and there's always someone to help with my homework, play games with me, and make sure I'm okay. I feel really looked after."</p>`,
      featuredImageUrl: IMAGES.stories.afterSchool,
      impactMetrics: {
        children_attending: 60,
        sessions_per_week: 25,
        hot_meals_provided: 1200,
        improved_school_performance: 78,
      },
      status: 'PUBLISHED',
      publishedAt: daysAgo(80),
      createdById: testUser.id,
    },
  });

  // Story 9: Emergency Food Response
  await prisma.story.create({
    data: {
      charityId: foodShareUK.id,
      donorId: retailGroup.id,
      title: 'Emergency Response to Cost of Living Crisis',
      slug: 'emergency-response-cost-of-living-crisis',
      excerpt: 'As demand for emergency food support surged, we launched a rapid response programme to ensure no family went hungry.',
      content: `<p>The cost of living crisis has pushed thousands of Manchester families to breaking point, with many facing impossible choices between essentials like food, heating, and rent.</p>

<p>In response, FoodShare UK launched an emergency food response programme, expanding opening hours, increasing stock levels, and recruiting additional volunteers to meet unprecedented demand.</p>

<p>"We've seen demand increase by 60% in just six months," explains David, FoodShare UK's Director. "These aren't the people society typically imagines needing food banks - many are working families, simply unable to make ends meet with rising costs."</p>

<p>Thanks to support from RetailGroup PLC and community donations, the programme has distributed over 2,000 emergency food parcels in three months, supporting approximately 800 families.</p>

<p>One father of two, who wished to remain anonymous, told us: "I work full-time but with rent, bills, and childcare, there's nothing left for food. Coming here saved us. The volunteers don't make you feel ashamed - they make you feel human."</p>

<p>But food is just part of the solution. The programme also connects families with debt advice, benefits support, and other services to address root causes of food insecurity.</p>`,
      featuredImageUrl: IMAGES.stories.emergencyFood,
      impactMetrics: {
        food_parcels: 2000,
        families_supported: 800,
        volunteers: 85,
        referrals_to_support_services: 340,
      },
      status: 'PUBLISHED',
      publishedAt: daysAgo(85),
      createdById: testUser.id,
    },
  });

  // Story 10: Housing First Success
  await prisma.story.create({
    data: {
      charityId: hopeForHomes.id,
      donorId: techCorp.id,
      title: 'Housing First: Ending the Cycle of Homelessness',
      slug: 'housing-first-ending-cycle-homelessness',
      excerpt: 'Our Housing First approach has helped 15 people with complex needs move from long-term homelessness into stable, permanent housing.',
      content: `<p>For people experiencing long-term homelessness, especially those with complex needs like addiction or mental health challenges, traditional homeless services often fail. The cycle continues: temporary accommodation, brief stability, then back to the streets.</p>

<p>Hope for Homes' Housing First programme takes a different approach: provide permanent housing first, then wrap support services around the individual. No preconditions, no temporary steps - straight to a place to call home.</p>

<p>Marcus had been homeless for seven years, sleeping rough across London and struggling with addiction. Traditional services required him to be "housing ready" - clean, sober, and stable. But achieving that whilst living on the streets proved impossible.</p>

<p>"Housing First changed everything," Marcus says. "Having my own place - four walls, a door I could lock, a bed - that's what gave me the foundation to start addressing my other challenges. You can't recover from addiction whilst living on the street."</p>

<p>With stable housing and intensive support from dedicated case workers, Marcus has been clean for eight months, reconnected with his family, and is exploring volunteer work.</p>

<p>The programme has achieved remarkable results: 15 people housed, with 87% maintaining their tenancies after 12 months - far exceeding traditional programme outcomes.</p>`,
      featuredImageUrl: IMAGES.stories.housingFirst,
      impactMetrics: {
        people_housed: 15,
        tenancy_sustainment: 87,
        support_hours: 1800,
        cost_saving_to_public_services: 450000,
      },
      status: 'PUBLISHED',
      publishedAt: daysAgo(90),
      createdById: testUser.id,
    },
  });

  // Add Reactions to stories
  console.log('😍 Adding reactions...');
  await prisma.reaction.createMany({
    data: [
      { storyId: story1.id, userId: testUser.id, reactionType: 'LOVE' },
      { storyId: story1.id, ipAddress: '192.168.1.1', reactionType: 'MOVED' },
      { storyId: story1.id, ipAddress: '192.168.1.2', reactionType: 'INSPIRED' },
      { storyId: story2.id, userId: testUser.id, reactionType: 'GRATEFUL' },
      { storyId: story2.id, ipAddress: '192.168.1.3', reactionType: 'LOVE' },
      { storyId: story3.id, userId: testUser.id, reactionType: 'APPLAUSE' },
      { storyId: story3.id, ipAddress: '192.168.1.4', reactionType: 'INSPIRED' },
      { storyId: story4.id, ipAddress: '192.168.1.5', reactionType: 'GRATEFUL' },
      { storyId: story5.id, userId: testUser.id, reactionType: 'LOVE' },
      { storyId: story5.id, ipAddress: '192.168.1.6', reactionType: 'MOVED' },
    ],
  });

  // Add Comments to stories
  console.log('💬 Adding comments...');
  await prisma.comment.createMany({
    data: [
      {
        storyId: story1.id,
        userId: testUser.id,
        userName: 'John Doe',
        userEmail: 'john@doe.com',
        content: 'This is such a beautiful story. So proud to see the difference being made! ❤️',
        status: 'APPROVED',
      },
      {
        storyId: story1.id,
        userName: 'Anonymous Supporter',
        content: 'Thank you for sharing Sarah\'s journey. It\'s inspiring to see how much support can change lives.',
        status: 'APPROVED',
      },
      {
        storyId: story2.id,
        userName: 'Community Member',
        userEmail: 'supporter@example.com',
        content: 'Incredible work by FoodShare UK! Every family deserves access to nutritious food.',
        status: 'APPROVED',
      },
      {
        storyId: story3.id,
        userId: testUser.id,
        userName: 'John Doe',
        userEmail: 'john@doe.com',
        content: 'Youth mentorship programmes like this are so important. Well done! 👏',
        status: 'APPROVED',
      },
      {
        storyId: story4.id,
        userName: 'Concerned Citizen',
        content: 'Keeping our elderly warm should be a priority. Thank you for this vital work.',
        status: 'PENDING',
      },
    ],
  });

  // Add Story Milestones (Timeline events)
  console.log('📍 Adding story milestones...');
  
  // Milestones for Story 1 (Sarah's Journey)
  await prisma.storyMilestone.createMany({
    data: [
      {
        storyId: story1.id,
        title: 'Emergency Accommodation',
        description: 'Sarah was provided with emergency accommodation after being referred by local services. This safe space allowed her to begin her recovery journey.',
        date: daysAgo(180),
        displayOrder: 1,
      },
      {
        storyId: story1.id,
        title: 'Support Services Begin',
        description: 'Sarah began working with our support team, accessing mental health services, budgeting advice, and employment support.',
        date: daysAgo(150),
        displayOrder: 2,
      },
      {
        storyId: story1.id,
        title: 'Part-Time Employment',
        description: 'With renewed confidence, Sarah secured part-time work at a local café. This was a major milestone in her journey towards independence.',
        date: daysAgo(90),
        displayOrder: 3,
      },
      {
        storyId: story1.id,
        title: 'Moving to Permanent Housing',
        description: 'Sarah moved into her own flat - a permanent home where she can rebuild her life with dignity and stability.',
        date: daysAgo(30),
        displayOrder: 4,
      },
    ],
  });

  // Milestones for Story 2 (Feeding 500 Families)
  await prisma.storyMilestone.createMany({
    data: [
      {
        storyId: story2.id,
        title: 'Campaign Launch',
        description: 'Our Winter Food Campaign launched to provide emergency food parcels to families facing food insecurity.',
        date: daysAgo(120),
        displayOrder: 1,
      },
      {
        storyId: story2.id,
        title: '100 Families Reached',
        description: 'Milestone achieved! We\'ve now provided food parcels to 100 families across Greater Manchester.',
        date: daysAgo(90),
        displayOrder: 2,
      },
      {
        storyId: story2.id,
        title: '250 Families Supported',
        description: 'Halfway to our goal! Thanks to generous donors, we\'ve now helped 250 families access nutritious food.',
        date: daysAgo(60),
        displayOrder: 3,
      },
      {
        storyId: story2.id,
        title: '500 Families Milestone',
        description: 'We did it! 500 families have now received support through this campaign. Over 12,000 meals provided.',
        date: daysAgo(14),
        displayOrder: 4,
      },
    ],
  });

  // Milestones for Story 3 (Youth Mentorship)
  await prisma.storyMilestone.createMany({
    data: [
      {
        storyId: story3.id,
        title: 'Programme Launch',
        description: 'Our youth mentorship programme launched with 20 young people and 10 dedicated mentors.',
        date: daysAgo(365),
        displayOrder: 1,
      },
      {
        storyId: story3.id,
        title: 'First Success Stories',
        description: 'Three of our mentees secured apprenticeships, showing the real-world impact of consistent support.',
        date: daysAgo(270),
        displayOrder: 2,
      },
      {
        storyId: story3.id,
        title: 'Programme Expansion',
        description: 'Due to high demand and proven results, we expanded to support 50 young people across Birmingham.',
        date: daysAgo(180),
        displayOrder: 3,
      },
      {
        storyId: story3.id,
        title: 'Year One Complete',
        description: '75 young people have now completed the programme, with 85% achieving their goals.',
        date: daysAgo(45),
        displayOrder: 4,
      },
    ],
  });

  // Add Thank You Messages
  console.log('💝 Adding thank you messages...');
  
  await prisma.thankYouMessage.createMany({
    data: [
      {
        storyId: story1.id,
        authorName: 'Sarah',
        message: 'I cannot thank Hope for Homes enough for believing in me when I had lost all hope. Having a safe place to stay gave me the foundation I needed to rebuild my life. Now I have my own flat, a job, and most importantly, my dignity back. This charity truly saved my life.',
        featured: true,
        displayOrder: 1,
      },
      {
        storyId: story2.id,
        authorName: 'Emma\'s Family',
        message: 'When we lost our income due to redundancy, we didn\'t know how we would feed our children. FoodShare UK provided not just food, but hope and dignity. The volunteers never made us feel judged. We\'re back on our feet now, and we\'ll never forget their kindness.',
        featured: true,
        displayOrder: 1,
      },
      {
        storyId: story3.id,
        authorName: 'Marcus',
        message: 'My mentor believed in me when I didn\'t believe in myself. Through Youth Futures, I discovered skills I didn\'t know I had and got the confidence to apply for an apprenticeship. I\'m now training to be an electrician and I have a future to look forward to. Thank you!',
        featured: true,
        displayOrder: 1,
      },
      {
        storyId: story4.id,
        authorName: 'Margaret, 82',
        message: 'At my age, the cold winters frighten me. Thanks to this programme, I now have proper heating and warm blankets. The volunteers even check in on me weekly. It\'s comforting to know someone cares. God bless everyone involved.',
        featured: true,
        displayOrder: 1,
      },
      {
        storyId: story5.id,
        authorName: 'Tom',
        message: 'This garden saved me during the darkest period of my life. When depression had me isolated and hopeless, getting my hands in the soil and being part of this community gave me purpose again. Watching things grow reminded me that I could grow too. The friendships I\'ve made here are precious - we\'re not just growing vegetables, we\'re growing hope.',
        featured: true,
        displayOrder: 1,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log('- 1 test user created (john@doe.com / johndoe123)');
  console.log('- 3 charities created');
  console.log('- 2 corporate donors created');
  console.log('- 10 impact stories created');
  console.log('- 10 reactions added');
  console.log('- 5 comments added');
  console.log('- 12 story milestones added');
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
