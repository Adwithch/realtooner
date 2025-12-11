import { Chapter, PageInfo } from '../types';

// Point to local proxy
const MANGADEX_PROXY = '/api/mangadex';

// Helper to handle fetches via backend
const fetchDex = async (path: string, options?: RequestInit) => {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${MANGADEX_PROXY}${cleanPath}`, options);
  
  if (!res.ok) {
    // Attempt to read error text
    const txt = await res.text().catch(() => 'Unknown error');
    throw new Error(`MangaDex Proxy Error (${res.status}): ${txt}`);
  }
  return res.json();
};

/**
 * MAPPING LOGIC: AniList ID -> MangaDex ID
 */
export const resolveMangaDexId = async (title: string, alId: number): Promise<string | null> => {
  const cacheKey = `mapping_al_${alId}_md`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      title: title,
      limit: '5',
      'order[relevance]': 'desc',
    });
    
    // Calls /api/mangadex/manga?...
    const data = await fetchDex(`/manga?${params.toString()}`);
    const match = data.data?.[0];

    if (match) {
      localStorage.setItem(cacheKey, match.id);
      return match.id;
    }
    return null;
  } catch (e) {
    console.error('Mapping failed', e);
    return null;
  }
};

export const getChapters = async (mangadexId: string): Promise<Chapter[]> => {
  try {
    const params = new URLSearchParams({
      limit: '100',
      'translatedLanguage[]': 'en',
      'order[chapter]': 'desc',
    });

    const data = await fetchDex(`/manga/${mangadexId}/feed?${params.toString()}`);
    
    return data.data.map((ch: any) => ({
      id: ch.id,
      chapterNumber: ch.attributes.chapter,
      volumeNumber: ch.attributes.volume,
      title: ch.attributes.title,
      releaseDate: ch.attributes.publishAt,
      pages: ch.attributes.pages,
      source: 'MANGADEX',
    }));
  } catch (e) {
    console.error('Failed to fetch chapters', e);
    return [];
  }
};

export const getChapterPages = async (chapterId: string): Promise<PageInfo[]> => {
  try {
    const data = await fetchDex(`/at-home/server/${chapterId}`);
    const baseUrl = data.baseUrl;
    const hash = data.chapter.hash;
    
    const useDataSaver = true; 
    const type = useDataSaver ? 'data-saver' : 'data';
    const files = useDataSaver ? data.chapter.dataSaver : data.chapter.data;

    return files.map((file: string, index: number) => {
      // Original External URL
      const externalUrl = `${baseUrl}/${type}/${hash}/${file}`;
      // Proxy URL for Canvas environment
      const proxyUrl = `/api/image?url=${encodeURIComponent(externalUrl)}`;
      
      return {
        index,
        url: proxyUrl
      };
    });
  } catch (e) {
    console.error('Failed to get pages', e);
    return [];
  }
};