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
You are a helpful cooking assistant.

Original Ingredients:
${original.ingredients.map((i) => `- ${i}`).join('\n')}

User Review/Tweak:
"${tweak.text}"

Task:
Based on the user's review, update the ingredients list realistically.
- Add any new ingredients the user mentioned
- Modify existing ones if the user suggested changes
- Keep the list clean and practical

Return ONLY valid JSON in this format:

{
  "modifiedIngredients": ["ingredient 1", "ingredient 2", ...]
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
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '';
    const parsed = JSON.parse(content);

    const modifiedIngredients = parsed.modifiedIngredients || original.ingredients;

    // Keep original instructions + add the tweak note at the end
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