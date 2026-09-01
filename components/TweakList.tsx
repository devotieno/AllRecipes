'use client';

import { ModifiedRecipe } from '@/types';
import clsx from 'clsx';

interface Props {
  modifications: ModifiedRecipe[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function TweakList({ modifications, selectedId, onSelect }: Props) {
  if (modifications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="font-semibold text-lg mb-2">Featured Tweaks</h2>
        <p className="text-sm text-gray-500">No tweaks loaded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-lg">Featured Tweaks</h2>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
          {modifications.length}
        </span>
      </div>

      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        {modifications.map((mod) => (
          <button
            key={mod.id}
            onClick={() => onSelect(mod.id)}
            className={clsx(
              'w-full text-left p-3 rounded-lg border transition',
              selectedId === mod.id
                ? 'border-black bg-gray-50'
                : 'border-gray-200 hover:border-gray-400'
            )}
          >
            <div className="text-xs font-medium text-gray-500 mb-1">
              {mod.tweak.author}
            </div>
            <p className="text-sm line-clamp-3">{mod.tweak.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
}