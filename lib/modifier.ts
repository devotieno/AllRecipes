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

    const prompt = `
You are an expert recipe editor.

Original Ingredients:
${original.ingredients.map((i) => `- ${i}`).join('\n')}

User Review:
"${tweak.text}"

Instructions:
- Carefully read the user's review.
- If the user says they added extra of something (e.g. "extra tablespoon feta"), increase the quantity of that ingredient.
- If they substituted something, replace it.
- If they added a completely new ingredient, add it to the list.
- Keep the rest of the ingredients the same.
- Return a clean list of individual ingredients.

Return ONLY valid JSON in this exact format:

{
  "modifiedIngredients": [
    "3 large eggs",
    "1 pinch red pepper flakes",
    "9 cherry tomatoes, halved",
    "3 tablespoons crumbled feta cheese"
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
    const parsed = JSON.parse(content);

    const modifiedIngredients =
      parsed.modifiedIngredients || original.ingredients;

    // Keep original instructions + add the tweak note
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