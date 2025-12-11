export interface Manga {
  id: number; // AniList ID
  idMal?: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  description: string;
  coverImage: {
    extraLarge: string;
    large: string;
    color: string;
  };
  bannerImage?: string;
  format: 'MANGA' | 'NOVEL' | 'ONE_SHOT';
  status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED';
  chapters?: number;
  genres: string[];
  averageScore: number;
  popularity: number;
  startDate?: { year: number; month: number; day: number };
  mappings?: { mangadexId?: string }; // Local mapping cache
}

export interface Chapter {
  id: string; // Source ID (e.g. MangaDex ID)
  chapterNumber: string;
  volumeNumber?: string;
  title?: string;
  releaseDate: string;
  pages?: number;
  source: 'MANGADEX' | 'COMICK' | 'MANGAPILL' | 'FALLBACK';
  externalUrl?: string;
}

export interface PageInfo {
  url: string;
  index: number;
}

export interface ReadingProgress {
  mangaId: number;
  lastReadChapterId: string;
  lastReadPage: number;
  timestamp: number;
}

export interface LibraryItem {
  manga: Manga;
  status: 'READING' | 'COMPLETED' | 'PLAN_TO_READ' | 'DROPPED';
  addedAt: number;
}

// AniList GraphQL Types
export interface AniListResponse {
  data: {
    Page: {
      media: Array<Manga>;
    };
    Media?: Manga;
  };
}
