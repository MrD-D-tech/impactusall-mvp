import { prisma } from './lib/db';
import { sendNewStoryNotification, getCorporateDonorEmails } from './lib/email';

async function testStoryCreation() {
  const charityId = 'cmimw27590000udil6q9hkohw'; // Northern Children's Hospice
  const donorId = 'cmimw27bw0009udil17ikjsif'; // Manchester United
  
  console.log('1. Creating a test story...');
  
  // Create a simple story
  const story = await prisma.story.create({
    data: {
      title: 'Email Test Story - ' + new Date().toISOString(),
      slug: 'email-test-' + Date.now(),
      excerpt: 'This is a test story to verify email notifications',
      content: 'Testing the email notification system for ImpactusAll.',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      charityId: charityId,
      donorId: donorId,
      createdById: 'cmimw279r0006udilrwu4l0jp', // Sarah Thompson (Charity Admin)
      updatedById: 'cmimw279r0006udilrwu4l0jp',
      impactMetrics: {
        lives_changed: 5,
        families_helped: 3
      }
    },
    include: {
      charity: true,
      donor: true
    }
  });
  
  console.log('2. Story created with ID:', story.id);
  console.log('3. Story status:', story.status);
  console.log('4. Donor ID:', story.donorId);
  
  // Get recipient emails
  console.log('\n5. Getting corporate donor emails...');
  const recipientEmails = await getCorporateDonorEmails(donorId);
  console.log('6. Recipients:', recipientEmails);
  
  if (recipientEmails.length === 0) {
    console.log('❌ No recipients found!');
    await prisma.$disconnect();
    return;
  }
  
  // Send email notification
  console.log('\n7. Sending email notification...');
  const emailResult = await sendNewStoryNotification({
    to: recipientEmails,
    storyTitle: story.title,
    storyExcerpt: story.excerpt || '',
    charityName: story.charity.name,
    charityLogo: story.charity.logoUrl || undefined,
    donorName: story.donor!.name,
    impactMetrics: [
      { label: 'Lives Changed', value: 5 },
      { label: 'Families Helped', value: 3 }
    ],
    storyUrl: `https://impactusall.abacusai.app/${story.donor!.slug}/${story.slug}`,
  });
  
  console.log('\n8. Email Result:', JSON.stringify(emailResult, null, 2));
  
  if (emailResult.success) {
    console.log('\n✅ SUCCESS! Email sent with ID:', emailResult.data?.id);
    console.log('Check dermot@clickonic.co for the email');
    console.log('Also check Resend dashboard: https://resend.com/emails');
  } else {
    console.log('\n❌ FAILED to send email');
    console.log('Error:', emailResult.error);
  }
  
  await prisma.$disconnect();
}

testStoryCreation().catch(console.error);
