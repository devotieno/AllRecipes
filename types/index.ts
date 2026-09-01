export interface Tweak {
  id: string;
  author: string;
  rating?: number;
  text: string;
  date?: string;
}

export interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  url: string;
}

export interface ModifiedRecipe {
  id: string;
  original: Recipe;
  tweak: Tweak;
  modifiedIngredients: string[];
  modifiedInstructions: string[];
  createdAt: string;
}

export interface StoredRecipe {
  id: string;
  originalUrl: string;
  original: Recipe;
  modifications: ModifiedRecipe[];
  createdAt: string;
}