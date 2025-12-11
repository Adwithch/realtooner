import React, { useEffect, useState } from 'react';
import { Manga } from '../types';
import { getTrendingManga, searchManga } from '../services/anilistService';
import { MangaCard } from '../components/MangaCard';
import { Search, Flame, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const [trending, setTrending] = useState<Manga[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Manga[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getTrendingManga().then(setTrending);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const results = await searchManga(searchQuery);
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Header / Search */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          OmniRead
        </h1>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search manga, webtoons..."
            className="w-full bg-slate-800 text-white rounded-full py-3 px-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        </form>
      </div>

      <div className="p-4 space-y-8">
        {searchResults.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Search size={24} className="text-blue-400" /> Search Results
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {searchResults.map(m => <MangaCard key={m.id} manga={m} />)}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Flame size={24} className="text-orange-500" /> Trending Now
          </h2>
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
            {trending.map(m => (
              <div key={m.id} className="snap-start flex-shrink-0 w-32 md:w-48">
                <MangaCard manga={m} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star size={24} className="text-yellow-400" /> Top Rated Webtoons
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {/* Reusing trending for demo, ideally a separate query */}
             {trending.slice(5, 15).map(m => <MangaCard key={m.id} manga={m} />)}
          </div>
        </section>
      </div>
    </div>
  );
};
