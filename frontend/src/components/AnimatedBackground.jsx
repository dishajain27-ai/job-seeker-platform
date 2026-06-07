import React from 'react';
import { useTheme } from '../context/ThemeContext';

const AnimatedBackground = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none -z-10 transition-colors duration-300 ${
      isDark ? 'bg-[#060919]' : 'bg-slate-50'
    }`}>

      {/* Moving Circuit Board Wallpaper (Ken Burns slowly panning camera) with blur overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 animate-pan-bg transition-all duration-300"
        style={{ 
          backgroundImage: `url('/assets/circuit-bg.jpg')`,
          filter: isDark 
            ? 'blur(12px) brightness(0.5) contrast(1.1)' 
            : 'blur(12px) brightness(1.0) opacity(0.15)'
        }}
      ></div>

      {/* Floating Animated Aurora Glassmorphic Blobs */}
      <div className={`absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full blur-[120px] animate-blob-float-1 transition-colors duration-300 ${
        isDark ? 'bg-blue-600/15' : 'bg-blue-400/10'
      }`}></div>
      
      <div className={`absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[130px] animate-blob-float-2 transition-colors duration-300 ${
        isDark ? 'bg-purple-600/15' : 'bg-purple-400/10'
      }`}></div>
      
      <div className={`absolute top-[25%] left-[55%] w-[45%] h-[45%] rounded-full blur-[110px] animate-blob-float-3 transition-colors duration-300 ${
        isDark ? 'bg-fuchsia-500/10' : 'bg-fuchsia-400/8'
      }`}></div>
      
      <div className={`absolute bottom-[35%] -left-[5%] w-[50%] h-[50%] rounded-full blur-[125px] animate-blob-float-4 transition-colors duration-300 ${
        isDark ? 'bg-indigo-500/12' : 'bg-indigo-400/10'
      }`}></div>
      
      {/* Moving scanline laser sweep across the background */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent -translate-x-full animate-laser-sweep ${
        isDark ? 'via-blue-500/3' : 'via-indigo-500/2'
      }`}></div>
    </div>
  );
};

export default AnimatedBackground;
