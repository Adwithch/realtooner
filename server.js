const express = require('express');
const cors = require('cors');
const path = require('path');
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);

// Dynamic import for node-fetch (ESM)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the current directory (project root)
app.use(express.static(__dirname));

// --- PROXY ENDPOINTS ---

// 1. MangaDex Proxy (General)
app.use('/api/mangadex', async (req, res) => {
  // Strip /api/mangadex from the path to get the relative endpoint
  const endpoint = req.originalUrl.replace('/api/mangadex', '');
  const targetUrl = `https://api.mangadex.org${endpoint}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': 'OmniRead/1.0',
        ...req.headers,
        host: 'api.mangadex.org' 
      }
    });

    if (!response.ok) {
      // Forward the status text for debugging
      return res.status(response.status).json({ error: `MangaDex API Error: ${response.statusText}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('MangaDex Proxy Error:', error);
    res.status(500).json({ error: 'Failed to connect to MangaDex' });
  }
});

// 2. Image Proxy (Crucial for Canvas/CORS)
app.get('/api/image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL is required');

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://mangadex.org/'
      }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

    // Forward content-type
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    
    // Pipe data
    if (!response.body) throw new Error('No body in response');
    await pipeline(response.body, res);
  } catch (error) {
    console.error('Image Proxy Error:', error);
    res.status(500).send('Error fetching image');
  }
});

// 3. Fallback/Scraper Proxy (Simulated)
app.get('/api/fallback/chapters', async (req, res) => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 500));
  
  // Return dummy fallback data
  const { title } = req.query;
  const dummyChapters = Array.from({ length: 10 }).map((_, i) => ({
    id: `fallback-${10-i}`,
    chapterNumber: (10 - i).toString(),
    title: `Backup Source Chapter ${10-i}`,
    releaseDate: new Date().toISOString(),
    source: 'FALLBACK',
    pages: 15
  }));
  
  res.json(dummyChapters);
});

// SPA Fallback: Serve index.html for any unknown route (except /api)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});