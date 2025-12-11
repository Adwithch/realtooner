import React from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home as HomeIcon, Library as LibIcon, User } from 'lucide-react';
import { Home } from './pages/Home';
import { MangaDetails } from './pages/MangaDetails';
import { Reader } from './pages/Reader';
import { Library } from './pages/Library';
import { LibraryProvider } from './context/LibraryContext';

const App: React.FC = () => {
  return (
    <LibraryProvider>
      <HashRouter>
        <div className="font-sans text-slate-100 bg-slate-900 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/manga/:id" element={<MangaDetails />} />
            <Route path="/read/:mangaId/:chapterId" element={<Reader />} />
            <Route path="/library" element={<Library />} />
          </Routes>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex justify-around items-center z-40 pb-safe">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex flex-col items-center gap-1 ${isActive ? 'text-blue-400' : 'text-gray-500'}`
              }
            >
              <HomeIcon size={24} />
              <span className="text-[10px]">Home</span>
            </NavLink>
            <NavLink 
              to="/library" 
              className={({ isActive }) => 
                `flex flex-col items-center gap-1 ${isActive ? 'text-blue-400' : 'text-gray-500'}`
              }
            >
              <LibIcon size={24} />
              <span className="text-[10px]">Library</span>
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                `flex flex-col items-center gap-1 ${isActive ? 'text-blue-400' : 'text-gray-500'}`
              }
            >
              <User size={24} />
              <span className="text-[10px]">Profile</span>
            </NavLink>
          </nav>
        </div>
      </HashRouter>
    </LibraryProvider>
  );
};

export default App;
