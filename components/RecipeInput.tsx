'use client';

import { useState } from 'react';

interface Props {
  onLoad: (url: string) => void;
  loading: boolean;
}

export default function RecipeInput({ onLoad, loading }: Props) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onLoad(url.trim());
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h2 className="font-semibold text-lg mb-3">Load Recipe</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="url"
          placeholder="https://www.allrecipes.com/recipe/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-60"
        >
          {loading ? 'Scraping…' : 'Load Recipe'}
        </button>
      </form>
    </div>
  );
}