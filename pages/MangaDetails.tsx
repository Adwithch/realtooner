import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Heart, Share2, AlertCircle } from 'lucide-react';
import { getMangaDetails } from '../services/anilistService';
import { ContentManager } from '../services/contentManager';
import { useLibrary } from '../context/LibraryContext';
import { Manga, Chapter } from '../types';

export const MangaDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToLibrary, isFavorite, removeFromLibrary } = useLibrary();

  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingChapters, setFetchingChapters] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      // 1. Get Metadata
      const data = await getMangaDetails(parseInt(id));
      if (!data) {
        setLoading(false);
        return;
      }
      setManga(data);
      setLoading(false);

      // 2. Get Chapters (Simulate Backend/Proxy)
      try {
        const ch = await ContentManager.getChapters(data);
        // Sort DESC
        setChapters(ch.sort((a, b) => parseFloat(b.chapterNumber) - parseFloat(a.chapterNumber)));
      } catch (e) {
        console.error("Failed to fetch chapters", e);
      } finally {
        setFetchingChapters(false);
      }
    };

    loadData();
  }, [id]);

  const toggleFavorite = () => {
    if (!manga) return;
    if (isFavorite(manga.id)) {
      removeFromLibrary(manga.id);
    } else {
      addToLibrary(manga, 'READING');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading details...</div>;
  if (!manga) return <div className="p-8 text-center text-red-400">Manga not found.</div>;

  const isFav = isFavorite(manga.id);

  return (
    <div className="min-h-screen pb-20 bg-slate-900">
      {/* Header Image */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden">
        {manga.bannerImage ? (
           <img src={manga.bannerImage} className="w-full h-full object-cover opacity-60" alt="Banner" />
        ) : (
           <div className="w-full h-full bg-slate-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur rounded-full text-white hover:bg-black/60"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Content Info */}
      <div className="px-4 -mt-20 relative flex flex-col md:flex-row gap-6">
        {/* Cover */}
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <img 
            src={manga.coverImage.extraLarge} 
            alt={manga.title.english}
            className="w-40 h-60 md:w-52 md:h-80 rounded-lg shadow-2xl object-cover border-4 border-slate-900"
          />
        </div>

        {/* Text Details */}
        <div className="flex-1 mt-4 md:mt-24 space-y-4">
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
            {manga.title.english || manga.title.romaji}
          </h1>
          <div className="flex flex-wrap gap-2">
            {manga.genres.map(g => (
              <span key={g} className="px-2 py-1 text-xs rounded bg-slate-700 text-blue-300 font-medium">
                {g}
              </span>
            ))}
          </div>
          <div 
            className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-4"
            dangerouslySetInnerHTML={{ __html: manga.description }} 
          />
          
          {/* Actions */}
          <div className="flex gap-4 pt-2">
             <button 
               onClick={toggleFavorite}
               className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
                 isFav ? 'bg-red-500/20 text-red-400 border border-red-500' : 'bg-blue-600 text-white hover:bg-blue-700'
               }`}
             >
               <Heart size={20} fill={isFav ? "currentColor" : "none"} />
               {isFav ? 'In Library' : 'Add to Library'}
             </button>
             <button className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600">
               <Share2 size={20} />
             </button>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="mt-8 px-4 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen size={20} />
          Chapters
          {fetchingChapters && <span className="text-sm font-normal text-gray-400 ml-2">(Syncing sources...)</span>}
        </h2>

        {chapters.length === 0 && !fetchingChapters && (
          <div className="p-4 rounded border border-yellow-700 bg-yellow-900/20 text-yellow-500 flex items-center gap-2">
            <AlertCircle size={20} />
            No chapters found. Source might be unavailable.
          </div>
        )}

        <div className="space-y-2">
          {chapters.map(chapter => (
            <button
              key={chapter.id}
              onClick={() => navigate(`/read/${manga.id}/${chapter.id}`, { state: { chapters } })}
              className="w-full flex justify-between items-center p-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition text-left group"
            >
              <div>
                <p className="font-semibold text-slate-200 group-hover:text-blue-400">
                  {chapter.chapterNumber ? `Chapter ${chapter.chapterNumber}` : 'One Shot'}
                </p>
                <p className="text-xs text-gray-500">
                  {chapter.title || `Vol ${chapter.volumeNumber || '-'}`} • {new Date(chapter.releaseDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-xs px-2 py-1 rounded bg-slate-900 text-gray-400 border border-slate-700">
                {chapter.source}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
