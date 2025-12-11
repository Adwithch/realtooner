import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { MangaCard } from '../components/MangaCard';
import { BookMarked } from 'lucide-react';

export const Library: React.FC = () => {
  const { library } = useLibrary();

  return (
    <div className="min-h-screen bg-slate-900 p-4 pb-24">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <BookMarked className="text-blue-500" /> Your Library
      </h1>

      {library.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <p>No manga added yet.</p>
          <p className="text-sm">Explore and add some titles to read offline!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {library.map(item => (
            <div key={item.manga.id} className="relative">
              <MangaCard manga={item.manga} />
              <div className="absolute top-2 right-2 bg-blue-600 text-xs px-2 py-1 rounded shadow">
                {item.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
