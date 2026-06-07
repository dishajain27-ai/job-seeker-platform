import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Clock, Building2, ArrowRight, Sparkles, Bookmark } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const JobCard = ({ job, onTypeClick, onViewDetailsClick }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user, isAuthenticated, isSeeker } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const renderMatchBadge = () => {
    if (!isAuthenticated || !isSeeker) return null;

    const userSkills = user?.skills || [];
    if (userSkills.length === 0) {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-300 ${
          isDark
            ? 'bg-slate-800/80 border-slate-700 text-slate-400'
            : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}>
          Add skills to view match score
        </span>
      );
    }

    const jobRequirements = job?.requirements || [];
    let matchPercentage = 100;
    if (jobRequirements.length > 0) {
      let matchedCount = 0;
      jobRequirements.forEach(req => {
        const reqLower = req.toLowerCase().trim();
        const matches = userSkills.some(skill => {
          const skillLower = skill.toLowerCase().trim();
          if (!skillLower || !reqLower) return false;
          return reqLower.includes(skillLower) || skillLower.includes(reqLower);
        });
        if (matches) {
          matchedCount++;
        }
      });
      matchPercentage = Math.round((matchedCount / jobRequirements.length) * 100);
    }

    return (
      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-300 ${
        isDark
          ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
          : 'bg-emerald-50 border-emerald-250 text-emerald-650 shadow-[0_0_5px_rgba(16,185,129,0.1)]'
      }`}>
        <Sparkles className="h-3 w-3 text-emerald-450 animate-pulse" />
        <span>{matchPercentage}% Match Score</span>
      </span>
    );
  };

  // Helper to get job type badge colors
  const getTypeStyles = (type) => {
    switch (type) {
      case 'Full-time':
        return isDark 
          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
          : 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Internship':
        return isDark 
          ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' 
          : 'bg-purple-50 text-purple-700 border-purple-200/60';
      case 'Part-time':
        return isDark 
          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' 
          : 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'Contract':
        return isDark 
          ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' 
          : 'bg-blue-50 text-blue-700 border-blue-200/60';
      default:
        return isDark 
          ? 'bg-slate-800 text-slate-300 border-slate-700' 
          : 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  };

  // Human readable time
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className={`backdrop-blur-md rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden ${
      isDark 
        ? 'bg-slate-900/90 border-slate-800/80 hover:border-primary-400/80 text-slate-100' 
        : 'bg-white/90 border-slate-200/60 hover:border-primary-500 text-slate-800'
    }`}>
      {/* Decorative Top Accent Stripe on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

      <div>
        {/* Top Badges */}
        <div className="flex justify-between items-center mb-4">
          <span 
            onClick={(e) => {
              if (onTypeClick) {
                e.preventDefault();
                e.stopPropagation();
                onTypeClick(job.type);
              }
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeStyles(job.type)} ${
              onTypeClick ? 'hover:scale-105 transition-all cursor-pointer' : ''
            }`}
          >
            {job.type}
          </span>
          <div className="flex items-center space-x-3">
            <span className="flex items-center text-xs text-slate-400 font-bold">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {timeAgo(job.createdAt)}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
              }}
              className={`p-1.5 rounded-xl border transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center ${
                isBookmarked
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.15)]'
                  : isDark
                    ? 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    : 'bg-slate-50/80 border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
              title={isBookmarked ? 'Saved to collection' : 'Save job'}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Job Title & AI Match Score badge */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {onViewDetailsClick ? (
            <button 
              onClick={() => onViewDetailsClick(job)}
              className="block text-left cursor-pointer focus:outline-none"
            >
              <h3 className={`text-lg font-extrabold transition-colors duration-250 line-clamp-1 leading-tight ${
                isDark ? 'text-slate-100 group-hover:text-primary-400' : 'text-slate-800 group-hover:text-primary-650'
              }`}>
                {job.title}
              </h3>
            </button>
          ) : (
            <Link to={`/jobs/${job._id}`} className="block">
              <h3 className={`text-lg font-extrabold transition-colors duration-250 line-clamp-1 leading-tight ${
                isDark ? 'text-slate-100 group-hover:text-primary-400' : 'text-slate-800 group-hover:text-primary-650'
              }`}>
                {job.title}
              </h3>
            </Link>
          )}

          {renderMatchBadge()}
        </div>

        {/* Company Name */}
        <div className={`flex items-center space-x-2 mt-2.5 ${isDark ? 'text-slate-300' : 'text-slate-650'}`}>
          <div className={`p-1.5 rounded-lg border ${isDark ? 'bg-slate-800/60 border-slate-700/40' : 'bg-slate-100/80 border-slate-200/40'}`}>
            <Building2 className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-450'}`} />
          </div>
          <span className="font-bold text-sm">{job.company}</span>
        </div>

        {/* Details Grid */}
        <div className={`grid grid-cols-2 gap-3 mt-6 pt-4.5 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`flex items-center text-xs font-semibold space-x-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'} overflow-hidden w-full`}>
            <span className="truncate" title={job.address || job.location}>
              {job.address ? job.address : job.location}
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address || job.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1 rounded-md border flex-shrink-0 transition-all hover:scale-110 ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-indigo-400 hover:bg-slate-750' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-indigo-650 hover:bg-slate-200'
              }`}
              onClick={(e) => e.stopPropagation()}
              title="View on Google Maps"
            >
              <MapPin className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className={`flex items-center text-xs font-bold justify-end ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <DollarSign className={`h-4 w-4 mr-0.5 flex-shrink-0 ${isDark ? 'text-slate-550' : 'text-slate-400'}`} />
            <span>{job.salary}</span>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-6">
        {onViewDetailsClick ? (
          <button
            onClick={() => onViewDetailsClick(job)}
            className={`w-full flex items-center justify-center space-x-2 border font-bold text-xs py-3 rounded-xl transition-all duration-250 shadow-sm hover:shadow-md cursor-pointer ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700/65 hover:bg-primary-600 text-slate-200 hover:text-white' 
                : 'bg-slate-50 border-slate-150/70 hover:bg-primary-600 text-slate-700 hover:text-white'
            }`}
          >
            <span>View Details</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        ) : (
          <Link
            to={`/jobs/${job._id}`}
            className={`w-full flex items-center justify-center space-x-2 border font-bold text-xs py-3 rounded-xl transition-all duration-250 shadow-sm hover:shadow-md ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700/65 hover:bg-primary-600 text-slate-200 hover:text-white' 
                : 'bg-slate-50 border-slate-150/70 hover:bg-primary-600 text-slate-700 hover:text-white'
            }`}
          >
            <span>View Details</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default JobCard;
