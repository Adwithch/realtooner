import React, { createContext, useContext, useEffect, useState } from 'react';
import { LibraryItem, ReadingProgress, Manga } from '../types';

interface LibraryContextType {
  library: LibraryItem[];
  history: ReadingProgress[];
  addToLibrary: (manga: Manga, status: LibraryItem['status']) => void;
  removeFromLibrary: (mangaId: number) => void;
  updateHistory: (progress: ReadingProgress) => void;
  isFavorite: (mangaId: number) => boolean;
}

const LibraryContext = createContext<LibraryContextType>({} as LibraryContextType);

export const useLibrary = () => useContext(LibraryContext);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [history, setHistory] = useState<ReadingProgress[]>([]);

  // Load from storage
  useEffect(() => {
    const savedLib = localStorage.getItem('omni_library');
    const savedHist = localStorage.getItem('omni_history');
    if (savedLib) setLibrary(JSON.parse(savedLib));
    if (savedHist) setHistory(JSON.parse(savedHist));
  }, []);

  // Save to storage on change
  useEffect(() => {
    localStorage.setItem('omni_library', JSON.stringify(library));
  }, [library]);

  useEffect(() => {
    localStorage.setItem('omni_history', JSON.stringify(history));
  }, [history]);

  const addToLibrary = (manga: Manga, status: LibraryItem['status']) => {
    setLibrary(prev => {
      const existing = prev.find(item => item.manga.id === manga.id);
      if (existing) {
        return prev.map(item => item.manga.id === manga.id ? { ...item, status } : item);
      }
      return [...prev, { manga, status, addedAt: Date.now() }];
    });
  };

  const removeFromLibrary = (mangaId: number) => {
    setLibrary(prev => prev.filter(item => item.manga.id !== mangaId));
  };

  const updateHistory = (progress: ReadingProgress) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.mangaId !== progress.mangaId);
      return [progress, ...filtered].slice(0, 50); // Keep last 50
    });
  };

  const isFavorite = (mangaId: number) => library.some(item => item.manga.id === mangaId);

  return (
    <LibraryContext.Provider value={{ library, history, addToLibrary, removeFromLibrary, updateHistory, isFavorite }}>
      {children}
    </LibraryContext.Provider>
  );
};
