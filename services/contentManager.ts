import { Chapter, Manga, PageInfo } from '../types';
import * as MangaDex from './mangadexService';

// Fallback logic now goes through backend proxy
const fetchFallbackChapters = async (title: string): Promise<Chapter[]> => {
  try {
    console.warn(`[Fallback System] MangaDex failed for ${title}. Switching to Backup Source via Proxy.`);
    const params = new URLSearchParams({ title });
    const response = await fetch(`/api/fallback/chapters?${params.toString()}`);
    if (!response.ok) throw new Error('Fallback API failed');
    return await response.json();
  } catch (e) {
    console.error("Fallback failed", e);
    return [];
  }
};

const fetchFallbackPages = async (chapterId: string): Promise<PageInfo[]> => {
  // Return placeholder images proxied (or local)
  return Array.from({ length: 10 }).map((_, i) => ({
    index: i,
    url: `https://picsum.photos/600/900?random=${chapterId}-${i}` 
    // Picsum usually works, but if strict strict, we would wrap this too:
    // url: `/api/image?url=${encodeURIComponent(`https://picsum.photos/600/900?random=${chapterId}-${i}`)}`
  }));
};

export const ContentManager = {
  async getChapters(manga: Manga): Promise<Chapter[]> {
    try {
      // 1. Try to resolve ID
      const mdId = await MangaDex.resolveMangaDexId(manga.title.english || manga.title.romaji, manga.id);
      
      if (mdId) {
        // 2. Fetch from MangaDex
        const chapters = await MangaDex.getChapters(mdId);
        if (chapters.length > 0) return chapters;
      }
      
      throw new Error('No chapters found on primary source');
    } catch (e) {
      // 3. Fallback
      return await fetchFallbackChapters(manga.title.english || manga.title.romaji);
    }
  },

  async getPages(chapter: Chapter): Promise<PageInfo[]> {
    if (chapter.source === 'MANGADEX') {
      return await MangaDex.getChapterPages(chapter.id);
    } else {
      return await fetchFallbackPages(chapter.id);
    }
  }
};