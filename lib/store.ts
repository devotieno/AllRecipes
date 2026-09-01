import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { StoredRecipe } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'recipes.json');

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');
}

export function getAllRecipes(): StoredRecipe[] {
  ensureDb();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function getRecipeById(id: string): StoredRecipe | null {
  return getAllRecipes().find((r) => r.id === id) || null;
}

export function saveRecipe(data: Omit<StoredRecipe, 'id' | 'createdAt'>): StoredRecipe {
  ensureDb();
  const recipes = getAllRecipes();
  const newRecipe: StoredRecipe = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    ...data,
  };
  recipes.unshift(newRecipe);
  fs.writeFileSync(DB_FILE, JSON.stringify(recipes, null, 2));
  return newRecipe;
}