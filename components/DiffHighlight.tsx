'use client';

import { diffLines, Change } from 'diff';

interface Props {
  original: string[];
  modified: string[];
}

export default function DiffHighlight({ original, modified }: Props) {
  const changes: Change[] = diffLines(original.join('\n'), modified.join('\n'));

  return (
    <div className="space-y-1 text-sm">
      {changes.map((part, idx) => {
        if (part.added) {
          return (
            <div
              key={idx}
              className="bg-green-100 border-l-4 border-green-500 text-green-900 px-3 py-1.5 rounded"
            >
              {part.value}
            </div>
          );
        }
        if (part.removed) {
          return (
            <div
              key={idx}
              className="bg-red-50 text-red-700 px-3 py-1 line-through opacity-70"
            >
              {part.value}
            </div>
          );
        }
        return (
          <div key={idx} className="px-3 py-0.5 text-gray-800">
            {part.value}
          </div>
        );
      })}
    </div>
  );
}