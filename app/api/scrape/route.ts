import { NextRequest, NextResponse } from 'next/server';
import { scrapeRecipe } from '@/lib/scraper';
import { applyTweak } from '@/lib/modifier';
import { saveRecipe } from '@/lib/store';
import { v4 as uuid } from 'uuid';

export const maxDuration = 60; // Allow more time for LLM calls
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !url.includes('allrecipes.com')) {
      return NextResponse.json(
        { error: 'Please provide a valid AllRecipes URL' },
        { status: 400 }
      );
    }

    // 1. Scrape the recipe + featured tweaks
    const { original, tweaks } = await scrapeRecipe(url);

    // 2. Apply each tweak using Groq (with fallback)
    const modifications = await Promise.all(
      tweaks.map(async (tweak) => {
        const { modifiedIngredients, modifiedInstructions } = await applyTweak(
          original,
          tweak
        );

        return {
          id: uuid(),
          original,
          tweak,
          modifiedIngredients,
          modifiedInstructions,
          createdAt: new Date().toISOString(),
        };
      })
    );

    // 3. Save everything
    const saved = saveRecipe({
      originalUrl: url,
      original,
      modifications,
    });

    return NextResponse.json(saved);
  } catch (error: any) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process recipe' },
      { status: 500 }
    );
  }
}