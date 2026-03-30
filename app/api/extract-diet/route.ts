import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const EXTRACTION_PROMPT = `You are a diet plan extraction assistant. Analyze the provided text from a diet plan document and extract structured meal data.

Extract a 7-day meal plan with the following structure for each day:
- Day number (1-7)
- Day name (Monday-Sunday)
- Meals for the day, each with:
  - meal_type: breakfast, morning_snack, lunch, afternoon_snack, dinner
  - title: A short title for the meal
  - calories: Estimated calories (or null)
  - protein_grams: Estimated protein in grams (or null)
  - carbs_grams: Estimated carbs in grams (or null)
  - fat_grams: Estimated fat in grams (or null)
  - notes: Any special instructions or notes

If macro information is not provided, make reasonable estimates based on standard nutritional data.
If a day is missing, create a placeholder with rest_day: true.

Return ONLY valid JSON in this exact format:
{
  "title": "Diet Plan Title",
  "description": "Brief description",
  "daily_calories": 2000,
  "protein_grams": 150,
  "carbs_grams": 200,
  "fat_grams": 70,
  "days": [
    {
      "day_number": 1,
      "day_name": "Monday",
      "meals": [
        {
          "meal_type": "breakfast",
          "title": "Oatmeal with Berries",
          "calories": 350,
          "protein_grams": 15,
          "carbs_grams": 50,
          "fat_grams": 10,
          "notes": null
        }
      ]
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const textContent = formData.get('text') as string | null;

    if (!file && !textContent) {
      return NextResponse.json(
        { error: 'No file or text content provided' },
        { status: 400 }
      );
    }

    let extractedText = textContent || '';

    // If we have a file, extract text from it
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      // For PDF files, try to use pdf-parse
      if (file.type === 'application/pdf') {
        try {
          // Dynamic import to handle case where pdf-parse is not installed
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require('pdf-parse');
          const data = await pdfParse(buffer);
          extractedText = data.text;
        } catch (e) {
          // If pdf-parse fails, return an error
          console.error('PDF parsing failed:', e);
          return NextResponse.json(
            { error: 'Failed to parse PDF. Please ensure the PDF contains selectable text, or paste the text directly.' },
            { status: 500 }
          );
        }
      } else if (file.type.startsWith('text/')) {
        // Text file
        extractedText = buffer.toString('utf-8');
      } else {
        return NextResponse.json(
          { error: 'Unsupported file type. Please upload a PDF or text file.' },
          { status: 400 }
        );
      }
    }

    // Send extracted text to Claude for structuring
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${EXTRACTION_PROMPT}\n\nHere is the diet plan text to extract:\n\n${extractedText}`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to extract structured data from diet plan' },
        { status: 500 }
      );
    }

    try {
      const plan = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ success: true, plan });
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse extracted diet plan' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error extracting diet plan:', error);
    return NextResponse.json(
      { error: 'Failed to process diet plan extraction' },
      { status: 500 }
    );
  }
}
