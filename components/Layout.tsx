import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { CloudSun, Search, GitCompare, Home } from 'lucide-react';
import AIAgent from './AIAgent';

interface LayoutProps {
  children: ReactNode;
  isNight?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, isNight = false }) => {
  const bgClass = isNight
    ? 'bg-gradient-to-b from-slate-900 via-indigo-950 to-purple-900 text-white'
    : 'bg-gradient-to-b from-sky-400 via-sky-200 to-white text-slate-800';

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center w-full h-full space-y-1 ${
      isActive 
        ? (isNight ? 'text-purple-300' : 'text-blue-600') 
        : (isNight ? 'text-gray-400' : 'text-gray-500')
    }`;

  return (
    <div className={`min-h-screen transition-colors duration-700 ${bgClass} flex flex-col`}>
      <main className="flex-grow p-4 pb-24 md:pb-4 max-w-4xl mx-auto w-full">
        {children}
      </main>

      {/* AI Agent Overlay */}
      <AIAgent />

      {/* Mobile/Desktop Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 h-16 border-t ${
          isNight ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-sky-100'
        } backdrop-blur-md z-50`}>
        <div className="flex justify-around items-center h-full max-w-4xl mx-auto">
          <NavLink to="/" className={navClass}>
            <Home size={24} />
            <span className="text-xs font-medium">Home</span>
          </NavLink>
          <NavLink to="/search" className={navClass}>
            <Search size={24} />
            <span className="text-xs font-medium">Search</span>
          </NavLink>
          <NavLink to="/compare" className={navClass}>
            <GitCompare size={24} />
            <span className="text-xs font-medium">Compare</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
