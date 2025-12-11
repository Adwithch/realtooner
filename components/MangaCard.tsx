import React from 'react';
import { Manga } from '../types';
import { useNavigate } from 'react-router-dom';

interface Props {
  manga: Manga;
}

export const MangaCard: React.FC<Props> = ({ manga }) => {
  const navigate = useNavigate();
  const title = manga.title.english || manga.title.romaji;

  return (
    <div 
      onClick={() => navigate(`/manga/${manga.id}`)}
      className="cursor-pointer group relative flex flex-col gap-2 w-full sm:w-40 md:w-48 transition-transform hover:scale-105"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-800 shadow-lg">
        <img 
          src={manga.coverImage.large} 
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-opacity duration-300 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-2 left-2 right-2">
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">{manga.format}</span>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-slate-200 line-clamp-2 leading-tight group-hover:text-blue-400">
        {title}
      </h3>
    </div>
  );
};
