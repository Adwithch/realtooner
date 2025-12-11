import { AniListResponse, Manga } from '../types';

// Restore direct API URL
const ANILIST_API = 'https://graphql.anilist.co';

const FETCH_OPTS = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

const MANGA_FRAGMENT = `
  id
  idMal
  title {
    romaji
    english
    native
  }
  description
  coverImage {
    extraLarge
    large
    color
  }
  bannerImage
  format
  status
  chapters
  genres
  averageScore
  popularity
  startDate {
    year
    month
    day
  }
`;

export const getTrendingManga = async (page = 1, perPage = 20): Promise<Manga[]> => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page (page: $page, perPage: $perPage) {
        media (sort: TRENDING_DESC, type: MANGA, isAdult: false) {
          ${MANGA_FRAGMENT}
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_API, {
      ...FETCH_OPTS,
      body: JSON.stringify({ query, variables: { page, perPage } }),
    });
    const json: AniListResponse = await response.json();
    return json.data.Page.media;
  } catch (error) {
    console.error('AniList Trending Error:', error);
    return [];
  }
};

export const searchManga = async (search: string): Promise<Manga[]> => {
  const query = `
    query ($search: String) {
      Page (page: 1, perPage: 20) {
        media (search: $search, type: MANGA, isAdult: false, sort: POPULARITY_DESC) {
          ${MANGA_FRAGMENT}
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_API, {
      ...FETCH_OPTS,
      body: JSON.stringify({ query, variables: { search } }),
    });
    const json: AniListResponse = await response.json();
    return json.data.Page.media;
  } catch (error) {
    console.error('AniList Search Error:', error);
    return [];
  }
};

export const getMangaDetails = async (id: number): Promise<Manga | null> => {
  const query = `
    query ($id: Int) {
      Media (id: $id, type: MANGA) {
        ${MANGA_FRAGMENT}
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_API, {
      ...FETCH_OPTS,
      body: JSON.stringify({ query, variables: { id } }),
    });
    const json: AniListResponse = await response.json();
    return json.data.Media || null;
  } catch (error) {
    console.error('AniList Details Error:', error);
    return null;
  }
};