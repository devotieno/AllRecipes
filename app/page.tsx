'use client';

import { useState, useEffect } from 'react';
import RecipeInput from '@/components/RecipeInput';
import TweakList from '@/components/TweakList';
import RecipeView from '@/components/RecipeView';
import { StoredRecipe, ModifiedRecipe } from '@/types';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<StoredRecipe | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<StoredRecipe[]>([]);

  // Load history on mount
  useEffect(() => {
    fetch('/api/recipes')
      .then((r) => r.json())
      .then(setHistory)
      .catch(console.error);
  }, []);

  const handleLoad = async (url: string) => {
    setLoading(true);
    setCurrent(null);
    setSelectedId(null);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      setCurrent(data);
      setSelectedId(data.modifications[0]?.id || null);
      setHistory((prev) => [data, ...prev.filter((r) => r.id !== data.id)]);
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const selectedMod: ModifiedRecipe | null =
    current?.modifications.find((m) => m.id === selectedId) || null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <header className="mb-8">
        <p className="text-gray-600 mt-1">
          Paste any AllRecipes link 
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="lg:col-span-3 space-y-5">
          <RecipeInput onLoad={handleLoad} loading={loading} />
          <TweakList
            modifications={current?.modifications || []}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Main content */}
        <div className="lg:col-span-9">
          {current ? (
            <RecipeView original={current.original} selected={selectedMod} />
          ) : (
            <div className="bg-white rounded-xl border shadow-sm p-16 text-center text-gray-500">
              {loading ? 'Scraping recipe & tweaks…' : 'Enter an AllRecipes URL to get started'}
            </div>
          )}
        </div>
      </div>

      {/* Simple history */}
      {history.length > 0 && (
        <div className="mt-10">
          <h3 className="font-semibold mb-3">Previously loaded</h3>
          <div className="flex flex-wrap gap-2">
            {history.slice(0, 8).map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setCurrent(r);
                  setSelectedId(r.modifications[0]?.id || null);
                }}
                className="text-sm px-3 py-1.5 bg-white border rounded-full hover:bg-gray-50"
              >
                {r.original.title.slice(0, 40)}…
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}