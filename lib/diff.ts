import { diffLines } from 'diff';

export function createDiff(original: string[], modified: string[]) {
  const oldText = original.join('\n');
  const newText = modified.join('\n');
  return diffLines(oldText, newText);
}