import { NextRequest, NextResponse } from 'next/server';
import { scrapeRecipe } from '@/lib/scraper';
import { applyTweak } from '@/lib/modifier';
import { saveRecipe } from '@/lib/store';
import { v4 as uuid } from 'uuid';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || !url.includes('allrecipes.com')) {
      return NextResponse.json({ error: 'Invalid AllRecipes URL' }, { status: 400 });
    }

    const { original, tweaks } = await scrapeRecipe(url);

    const modifications = tweaks.map((tweak) => {
      const { modifiedIngredients, modifiedInstructions } = applyTweak(original, tweak);
      return {
        id: uuid(),
        original,
        tweak,
        modifiedIngredients,
        modifiedInstructions,
        createdAt: new Date().toISOString(),
      };
    });

    const saved = saveRecipe({
      originalUrl: url,
      original,
      modifications,
    });

    return NextResponse.json(saved);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || 'Scraping failed' },
      { status: 500 }
    );
  }
}