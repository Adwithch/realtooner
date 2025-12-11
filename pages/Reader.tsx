import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ContentManager } from '../services/contentManager';
import { useLibrary } from '../context/LibraryContext';
import { PageInfo, Chapter } from '../types';
import { ReaderOverlay } from '../components/ReaderOverlay';
import { Loader2 } from 'lucide-react';

export const Reader: React.FC = () => {
  const { mangaId, chapterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { updateHistory } = useLibrary();

  // State
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [readingMode, setReadingMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // Passed state from details page (chapter list) to avoid refetching list
  const chapterList = (location.state as { chapters: Chapter[] })?.chapters || [];
  const currentChapter = chapterList.find(c => c.id === chapterId);
  const nextChapter = chapterList.find(c => parseFloat(c.chapterNumber) > parseFloat(currentChapter?.chapterNumber || '0'));
  const prevChapter = chapterList.find(c => parseFloat(c.chapterNumber) < parseFloat(currentChapter?.chapterNumber || '0'));

  // Refs for infinite scroll / preloading
  const containerRef = useRef<HTMLDivElement>(null);

  // Load Pages
  useEffect(() => {
    if (!chapterId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!currentChapter) throw new Error("Chapter data missing");
        
        const fetchedPages = await ContentManager.getPages(currentChapter);
        setPages(fetchedPages);
        
        // Update history
        if (mangaId) {
          updateHistory({
            mangaId: parseInt(mangaId),
            lastReadChapterId: chapterId,
            lastReadPage: 0,
            timestamp: Date.now()
          });
        }
      } catch (err) {
        setError('Failed to load pages. Source might be busy.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [chapterId]);

  // Handle Controls Visibility
  const toggleControls = () => setShowControls(prev => !prev);

  // Navigation Handlers
  const handleNextChapter = () => {
    if (nextChapter) {
      navigate(`/read/${mangaId}/${nextChapter.id}`, { state: { chapters: chapterList } });
    }
  };

  const handlePrevChapter = () => {
    if (prevChapter) {
      navigate(`/read/${mangaId}/${prevChapter.id}`, { state: { chapters: chapterList } });
    }
  };

  const handleModeChange = () => {
    setReadingMode(prev => prev === 'vertical' ? 'horizontal' : 'vertical');
  };

  // Preload Logic (Basic)
  useEffect(() => {
    if (pages.length > 0) {
      const nextIdx = currentPageIndex + 1;
      if (nextIdx < pages.length) {
        const img = new Image();
        img.src = pages[nextIdx].url;
      }
    }
  }, [currentPageIndex, pages]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Connecting to secure source...</p>
        </div>
      </div>
    );
  }

  if (error || !currentChapter) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black flex-col">
        <p className="text-red-500 mb-4">{error || "Chapter not found"}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 rounded">Go Back</button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black text-white overflow-hidden">
      <ReaderOverlay 
        title={currentChapter.title || `Chapter ${currentChapter.chapterNumber}`}
        chapter={currentChapter.chapterNumber}
        visible={showControls}
        onNext={handleNextChapter}
        onPrev={handlePrevChapter}
        onModeChange={handleModeChange}
        readingMode={readingMode}
      />

      {/* Reader Area */}
      <div 
        ref={containerRef}
        className={`h-full w-full overflow-y-auto no-scrollbar ${readingMode === 'vertical' ? '' : 'flex items-center justify-center'}`}
        onClick={toggleControls}
      >
        {readingMode === 'vertical' ? (
          // Vertical Webtoon Mode
          <div className="flex flex-col w-full max-w-3xl mx-auto pb-32">
            {pages.map((page, idx) => (
              <img 
                key={page.index}
                src={page.url}
                alt={`Page ${idx + 1}`}
                className="w-full h-auto block"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/600x800/202020/white?text=Reload";
                }}
              />
            ))}
            
            {/* End of Chapter Action */}
            <div className="p-8 text-center space-y-4">
              <p className="text-gray-500">End of Chapter</p>
              {nextChapter && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNextChapter(); }}
                  className="w-full bg-blue-600 py-3 rounded-lg font-bold"
                >
                  Next Chapter
                </button>
              )}
            </div>
          </div>
        ) : (
          // Horizontal Manga Mode
          <div 
            className="w-full h-full flex items-center justify-center"
            onClick={(e) => {
              // Tap left/right logic
              const width = window.innerWidth;
              const clickX = e.clientX;
              if (clickX > width / 2) {
                if (currentPageIndex < pages.length - 1) setCurrentPageIndex(p => p + 1);
                else handleNextChapter();
              } else {
                if (currentPageIndex > 0) setCurrentPageIndex(p => p - 1);
                else handlePrevChapter();
              }
            }}
          >
             <img 
                src={pages[currentPageIndex]?.url}
                alt={`Page ${currentPageIndex + 1}`}
                className="max-h-screen max-w-full object-contain"
              />
             <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-xs">
               {currentPageIndex + 1} / {pages.length}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
