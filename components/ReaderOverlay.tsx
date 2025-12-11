import React from 'react';
import { ArrowLeft, Settings, SkipBack, SkipForward, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  chapter: string;
  visible: boolean;
  onPrev: () => void;
  onNext: () => void;
  onModeChange: () => void;
  readingMode: 'vertical' | 'horizontal';
}

export const ReaderOverlay: React.FC<Props> = ({ 
  title, chapter, visible, onPrev, onNext, onModeChange, readingMode 
}) => {
  const navigate = useNavigate();

  if (!visible) return null;

  return (
    <>
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-black/90 text-white flex items-center px-4 z-50 backdrop-blur-sm">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div className="ml-4 flex-1 truncate">
          <h1 className="text-sm font-bold truncate">{title}</h1>
          <p className="text-xs text-gray-400">Chapter {chapter}</p>
        </div>
        <button onClick={onModeChange} className="p-2 hover:bg-white/10 rounded-full">
          {readingMode === 'vertical' ? 'Webtoon' : 'Manga'}
        </button>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-black/90 text-white flex items-center justify-around px-4 z-50 backdrop-blur-sm pb-4">
        <button onClick={onPrev} className="flex flex-col items-center gap-1 p-2 hover:text-blue-400">
          <SkipBack size={24} />
          <span className="text-xs">Prev</span>
        </button>
        
        <button className="flex flex-col items-center gap-1 p-2 hover:text-blue-400">
          <Settings size={24} />
          <span className="text-xs">Settings</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-2 hover:text-blue-400">
          <Download size={24} />
          <span className="text-xs">Save</span>
        </button>

        <button onClick={onNext} className="flex flex-col items-center gap-1 p-2 hover:text-blue-400">
          <SkipForward size={24} />
          <span className="text-xs">Next</span>
        </button>
      </div>
    </>
  );
};
