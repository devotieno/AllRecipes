'use client';

import { ModifiedRecipe, Recipe } from '@/types';
import DiffHighlight from './DiffHighlight';

interface Props {
  original: Recipe;
  selected: ModifiedRecipe | null;
}

export default function RecipeView({ original, selected }: Props) {
  if (!selected) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
        Select a Featured Tweak on the left to see the modified recipe
      </div>
    );
  }

  // Clean the original instructions (remove extraction failure messages)
  const cleanOriginalInstructions = original.instructions.filter(
    (line) => !line.toLowerCase().includes('could not extract')
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{original.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Modified by <span className="font-medium">{selected.tweak.author}</span>
        </p>
      </div>

      {/* Tweak text */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <p className="text-sm italic text-blue-900">{selected.tweak.text}</p>
      </div>

      {/* Ingredients with diff */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Ingredients</h2>
        <DiffHighlight
          original={original.ingredients}
          modified={selected.modifiedIngredients}
        />
      </div>

      {/* Instructions with diff */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Instructions</h2>
        <DiffHighlight
          original={cleanOriginalInstructions}
          modified={selected.modifiedInstructions}
        />
      </div>
    </div>
  );
}