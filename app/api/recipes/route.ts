import { NextResponse } from 'next/server';
import { getAllRecipes } from '@/lib/store';

export async function GET() {
  const recipes = getAllRecipes();
  return NextResponse.json(recipes);
}