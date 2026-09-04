import { Recipe, Tweak } from '@/types';
import Groq from 'groq-sdk';

export async function applyTweak(original: Recipe, tweak: Tweak) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is missing');
    }

    // 1. Clean & split ingredients (very important)
    let cleanIngredients = original.ingredients;

    // If it's one long string, try to split it
    if (cleanIngredients.length === 1 && cleanIngredients[0].length > 60) {
      cleanIngredients = cleanIngredients[0]
        .split(/(?=\d+\s)/) // split before numbers
        .map((item) => item.trim())
        .filter((item) => item.length > 2);
    }

    // Remove duplicates and empty items
    cleanIngredients = Array.from(new Set(cleanIngredients)).filter(Boolean);

    console.log('=== Clean Ingredients sent to Groq ===');
    console.log(cleanIngredients);
    console.log('=== Tweak ===');
    console.log(tweak.text);

    const prompt = `
You are an expert recipe editor.

Current Ingredients:
${cleanIngredients.map((i) => `- ${i}`).join('\n')}

User Review:
"${tweak.text}"

Your task:
- Read the user review carefully.
- If the user says "extra tablespoon feta" or similar, increase the amount of feta.
- If they added a new ingredient, add it.
- If they substituted something, replace it.
- Keep all other ingredients the same.
- Return a clean array of individual ingredients.

Return ONLY valid JSON:

{
  "modifiedIngredients": [
    "3 large eggs",
    "1 pinch red pepper flakes",
    "9 cherry tomatoes, halved",
    "3 tablespoons crumbled feta cheese",
    "1 tablespoon very thinly sliced fresh basil leaves",
    "1 teaspoon olive oil",
    "1 pinch sea salt"
  ]
}
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '';
    console.log('=== Groq Response ===');
    console.log(content);

    const parsed = JSON.parse(content);
    const modifiedIngredients = parsed.modifiedIngredients || cleanIngredients;

    // Instructions
    const cleanInstructions = original.instructions.filter(
      (l) => !l.toLowerCase().includes('could not extract')
    );

    const modifiedInstructions = [
      ...cleanInstructions,
      '',
      `─── Modification note from ${tweak.author} ───`,
      tweak.text,
    ];

    return {
      modifiedIngredients,
      modifiedInstructions,
    };
  } catch (error) {
    console.error('Groq error:', error);

    return {
      modifiedIngredients: original.ingredients,
      modifiedInstructions: [
        ...original.instructions.filter(
          (l) => !l.toLowerCase().includes('could not extract')
        ),
        '',
        `─── Modification note from ${tweak.author} ───`,
        tweak.text,
      ],
    };
  }
}