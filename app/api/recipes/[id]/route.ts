import { NextRequest, NextResponse } from 'next/server';
import { getRecipeById } from '@/lib/store';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const recipe = getRecipeById(params.id);
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(recipe);
}