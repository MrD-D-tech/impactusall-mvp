import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface StoryInput {
  beneficiaryName: string;
  beneficiaryAge?: string;
  situation: string;
  supportReceived: string;
  outcome: string;
  quote?: string;
  donorName: string;
  charityName: string;
  donationAmount?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'CHARITY_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const input: StoryInput = await request.json();
    
    // Validate required fields
    if (!input.beneficiaryName || !input.situation || !input.supportReceived || !input.outcome) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert storyteller for charitable impact stories. Generate a compelling, emotionally resonant impact story in HTML format based on the following information.

Beneficiary Information:
- Name: ${input.beneficiaryName}
- Age: ${input.beneficiaryAge || 'Not specified'}
- Situation before help: ${input.situation}
- Support received: ${input.supportReceived}
- Outcome/transformation: ${input.outcome}
- Direct quote from beneficiary: ${input.quote || 'None provided'}

Donor: ${input.donorName}
Charity: ${input.charityName}
${input.donationAmount ? `Donation amount: ${input.donationAmount}` : ''}

IMPORTANT GUIDELINES:
1. Write in third person, with compassion and dignity
2. Include 3-4 section headings using <h3> tags
3. Include 2-3 powerful quote blocks using this exact format:
   <p class="text-lg font-semibold italic text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-red-600">"Quote here"</p>
4. Wrap everything in <div class="space-y-6">.....</div>
5. Make it emotional but not exploitative - focus on hope and transformation
6. Mention the donor (${input.donorName}) naturally as enablers of change
7. Keep paragraphs focused and readable
8. Use British English spelling

Also generate:
1. A compelling title (6-10 words, include the beneficiary's name)
2. An excerpt (2-3 sentences capturing the emotional core)
3. 4 journey milestones showing the progression of support

Respond in JSON format with this exact structure:
{
  "title": "Story title here",
  "excerpt": "2-3 sentence compelling excerpt",
  "content": "<div class=\"space-y-6\">...full HTML content...</div>",
  "milestones": [
    {
      "title": "Milestone title",
      "description": "What happened at this stage",
      "displayOrder": 1
    },
    {
      "title": "Second milestone",
      "description": "Description",
      "displayOrder": 2
    },
    {
      "title": "Third milestone",
      "description": "Description",
      "displayOrder": 3
    },
    {
      "title": "Fourth milestone",
      "description": "Description",
      "displayOrder": 4
    }
  ],
  "suggestedMetrics": {
    "families_helped": 1,
    "hours_of_care": 100,
    "other_relevant_metric": 50
  }
}

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: 'You are a compassionate storyteller who creates emotional, dignified impact stories for charities. Always respond in valid JSON format.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate story. Please try again.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json(
        { error: 'No content generated. Please try again.' },
        { status: 500 }
      );
    }

    try {
      const generatedStory = JSON.parse(content);
      return NextResponse.json({
        success: true,
        story: generatedStory
      });
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      return NextResponse.json(
        { error: 'Failed to parse generated story. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
