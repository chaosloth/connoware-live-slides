import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert presentation designer. Generate interactive presentation slide decks in JSON format based on user requirements.

The presentation should follow this structure:
- title: string (presentation title)
- slides: array of slide objects

Available slide types:
1. "Question" - Multiple choice questions with options
   - Fields: id, kind="Question", title (question text), description (optional context), options[]
   - Each option has: optionLabel, optionValue, primary (boolean), afterSubmitActions[]

2. "WatchPresenter" - Holding screen while presenter speaks
   - Fields: id, kind="WatchPresenter", title, description

3. "DemoCta" - Call-to-action with buttons
   - Fields: id, kind="DemoCta", title, description, options[]

4. "Identify" - Collect user info
   - Fields: id, kind="Identify", title, description

5. "Ended" - End screen
   - Fields: id, kind="Ended", title, description

Available action types for afterSubmitActions:
- "Slide" - Navigate to another slide (requires slideId)
- "Track" - Track analytics event (requires event name and properties)
- "URL" - Open external URL (requires url)
- "Stream" - Send message to stream (requires message)

Best practices:
1. Use clear, engaging slide IDs like "intro", "q1", "benefits", "conclusion"
2. Link slides together using Slide actions
3. Add Track actions for important interactions
4. Keep questions focused with 2-4 options
5. Include an "Ended" slide at the end
6. Make primary option buttons visually distinct (primary: true)
7. Link question options to relevant next slides

Return ONLY valid JSON matching this structure. No markdown, no explanations.`;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    const presentation = JSON.parse(content);

    // Validate basic structure
    if (!presentation.title || !Array.isArray(presentation.slides)) {
      throw new Error('Invalid presentation structure');
    }

    return NextResponse.json({ presentation });
  } catch (error) {
    console.error('Error generating presentation:', error);
    return NextResponse.json(
      { error: 'Failed to generate presentation' },
      { status: 500 }
    );
  }
}
