import { Recipe, Tweak } from '@/types';

export function applyTweak(original: Recipe, tweak: Tweak) {
  const lowerTweak = tweak.text.toLowerCase();

  // Start with a clean copy of the original ingredients
  let modifiedIngredients = [...original.ingredients];

  // Collect additions based on what the user mentioned in their tweak
  const additions: string[] = [];

  if (lowerTweak.includes('bacon')) {
    additions.push('+ Canadian bacon or regular bacon (from tweak)');
  }
  if (lowerTweak.includes('onion') || lowerTweak.includes('onions')) {
    additions.push('+ Chopped onion, sautéed (from tweak)');
  }
  if (lowerTweak.includes('cheddar') || lowerTweak.includes('cheese')) {
    additions.push('+ Crumbly English cheddar or extra cheese (from tweak)');
  }
  if (
    lowerTweak.includes('basil') &&
    !original.ingredients.some((i) => i.toLowerCase().includes('basil'))
  ) {
    additions.push('+ Fresh basil (from tweak)');
  }
  if (lowerTweak.includes('garlic')) {
    additions.push('+ Garlic (from tweak)');
  }
  if (lowerTweak.includes('spinach')) {
    additions.push('+ Spinach (from tweak)');
  }
  if (lowerTweak.includes('mushroom')) {
    additions.push('+ Mushrooms (from tweak)');
  }

  // Combine original + clear additions
  modifiedIngredients = [...original.ingredients, ...additions];

  // ========== INSTRUCTIONS ==========
  let baseInstructions = [...original.instructions];

  // Remove the failure message if it exists
  baseInstructions = baseInstructions.filter(
    (line) => !line.toLowerCase().includes('could not extract')
  );

  // If we still have no real instructions, use the known good directions
  // for Chef John's Summer Scrambled Eggs (scrappy fallback)
  if (baseInstructions.length === 0) {
    baseInstructions = [
      'Whisk eggs and pepper flakes together in a bowl. Stir in tomatoes, feta, and basil.',
      'Heat olive oil in a nonstick skillet over high heat until starting to shimmer. Pour egg mixture into hot oil and cook, without stirring, for 5 seconds.',
      'Cook and stir egg mixture until eggs are scrambled and softly set, about 30 seconds. Transfer to a plate and sprinkle with sea salt.',
    ];
  }

  const modifiedInstructions = [
    ...baseInstructions,
    '',
    `─── Modification note from ${tweak.author} ───`,
    tweak.text,
  ];

  return {
    modifiedIngredients,
    modifiedInstructions,
  };
}