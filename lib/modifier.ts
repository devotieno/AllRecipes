import { Recipe, Tweak } from '@/types';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function applyTweak(original: Recipe, tweak: Tweak) {
  try {
    const prompt = `
You are a helpful cooking assistant.

Here is the original recipe:

Title: ${original.title}

Ingredients:
${original.ingredients.map((i) => `- ${i}`).join('\n')}

Instructions:
${original.instructions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

Here is a user tweak/review:
"${tweak.text}"

Task:
Apply the user's suggestions to the recipe in a realistic way.
Return the result in this exact JSON format:

{
  "modifiedIngredients": ["ingredient 1", "ingredient 2", ...],
  "modifiedInstructions": ["step 1", "step 2", ...]
}

Only return valid JSON. Do not add any explanation.
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '';
    const parsed = JSON.parse(content);

    return {
      modifiedIngredients: parsed.modifiedIngredients || original.ingredients,
      modifiedInstructions: parsed.modifiedInstructions || original.instructions,
    };
  } catch (error) {
    console.error('Groq error:', error);

    // Minimal emergency fallback
    return {
      modifiedIngredients: original.ingredients,
      modifiedInstructions: [
        ...original.instructions,
        '',
        `─── Modification note from ${tweak.author} ───`,
        tweak.text,
      ],
    };
  }
}