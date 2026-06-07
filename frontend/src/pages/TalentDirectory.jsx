import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, User, Download, FileText, Mail, Phone, X, Award, ExternalLink, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TalentDirectory = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        const res = await fetch('/api/applications/talent', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setCandidates(data.data);
        }
      } catch (err) {
        console.error('Error fetching talent directory:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTalent();
    }
  }, [token]);

  // Prevent background scrolling when modals are open
  useEffect(() => {
    if (selectedCandidate) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedCandidate]);

  // Filter candidates based on search query
  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      {/* Title Header */}
      <div className="text-center lg:text-left mb-10">
        <div className={`inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 tracking-wide ${
          isDark ? 'text-indigo-300' : 'text-indigo-600'
        }`}>
          <Sparkles className={`h-4 w-4 animate-pulse ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
          <span>TalentHub Sourcing Portal</span>
        </div>
        <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Browse <span className="gradient-text font-black">Talent</span> Directory
        </h1>
        <p className={`max-w-2xl text-sm sm:text-base font-medium ${
          isDark ? 'text-slate-350' : 'text-slate-600'
        }`}>
          Discover and connect with top-tier developers. Access verified profiles, cover letters, and download candidate resumes instantly.
        </p>
      </div>

      {/* Search Filter Bar */}
      <div className="max-w-2xl mb-8">
        <div className={`relative rounded-2xl border p-1 flex items-center shadow-lg hover:border-indigo-500/30 transition-all duration-300 ${
          isDark 
            ? 'glassmorphism border-white/10' 
            : 'bg-white border-slate-200 shadow-md'
        }`}>
          <Search className={`h-5 w-5 ml-4 flex-shrink-0 ${isDark ? 'text-slate-300' : 'text-slate-650'}`} />
          <input
            type="text"
            placeholder="Search candidates by name, role, or technical skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-sm bg-transparent outline-none py-3 px-3 ${
              isDark 
                ? 'text-slate-100 placeholder-slate-400' 
                : 'text-slate-900 placeholder-slate-500'
            }`}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className={`p-2 mr-2 transition-colors ${
                isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Candidates Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400"></div>
          <span className={`mt-4 text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading candidate directory...</span>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className={`text-center py-20 rounded-3xl border p-8 transition-colors ${
          isDark ? 'glassmorphism border-white/10' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <User className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          <h3 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>No Candidates Found</h3>
          <p className={`max-w-md mx-auto mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Try adjusting your keywords or checking back later as new candidates register on TalentHub.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <div 
              key={candidate.id}
              className={`backdrop-blur-md rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden ${
                isDark 
                  ? 'bg-slate-900/90 border-slate-800 text-slate-100 hover:border-indigo-500/50' 
                  : 'bg-white/95 border-slate-200/60 text-slate-800 hover:border-indigo-400/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]'
              }`}
            >
              {/* Decorative Accent Stripe */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

              <div>
                {/* Header & Avatar */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-extrabold text-lg shadow-inner group-hover:scale-105 transition-transform ${
                      isDark 
                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-650'
                    }`}>
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold transition-colors ${
                        isDark ? 'text-slate-100 group-hover:text-indigo-400' : 'text-slate-800 group-hover:text-indigo-650'
                      }`}>
                        {candidate.name}
                      </h3>
                      <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-550'}`}>
                        {candidate.title}
                      </p>
                    </div>
                  </div>
                  {candidate.resumePath && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center space-x-1 shadow-sm ${
                      isDark 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                    }`}>
                      <Award className="h-3 w-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                {/* Summary Snippet */}
                <p className={`text-xs leading-relaxed mb-5 line-clamp-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {candidate.summary}
                </p>

                {/* Skill tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {candidate.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className={`border text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isDark 
                          ? 'bg-slate-800/80 border-slate-700/80 text-slate-300' 
                          : 'bg-slate-100 border-slate-200/80 text-slate-600'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex items-center gap-3 border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-150'}`}>
                <button
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`flex-grow border font-bold py-2 px-3 rounded-xl transition-all duration-200 text-xs flex items-center justify-center space-x-1.5 cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 text-slate-200' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-755 text-slate-700'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 text-indigo-500" />
                  <span>View Summary</span>
                </button>

                {candidate.resumePath ? (
                  <a
                    href={`/${candidate.resumePath}`}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md hover:scale-105 text-white font-bold"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Resume</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className={`border font-bold py-2 px-3 rounded-xl text-xs cursor-not-allowed flex items-center space-x-1.5 ${
                      isDark 
                        ? 'bg-slate-800/30 border-slate-800 text-slate-600' 
                        : 'bg-slate-50 border-slate-150 text-slate-400'
                    }`}
                    title="No resume uploaded yet"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                    <span>No Resume</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative text-left border ${
            isDark 
              ? 'glassmorphism border-white/10' 
              : 'bg-white border-slate-200'
          }`}>
            
            {/* Modal Header */}
            <div className={`p-6 sm:p-8 border-b flex items-start justify-between ${
              isDark ? 'border-slate-850' : 'border-slate-150'
            }`}>
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-extrabold text-xl shadow-inner ${
                  isDark 
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-650'
                }`}>
                  {selectedCandidate.name.charAt(0)}
                </div>
                <div>
                  <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    {selectedCandidate.name}
                  </h2>
                  <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {selectedCandidate.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                  isDark 
                    ? 'text-slate-400 hover:text-slate-205 hover:text-slate-200 bg-slate-800 border-slate-700 hover:bg-slate-750' 
                    : 'text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Contact info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`flex items-center space-x-3 p-3.5 rounded-2xl border ${
                  isDark ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <Mail className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0" />
                  <div className="truncate">
                    <p className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-450' : 'text-slate-500'}`}>Email Address</p>
                    <a href={`mailto:${selectedCandidate.email}`} className={`text-xs font-semibold transition-colors ${
                      isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-800 hover:text-indigo-650'
                    }`}>
                      {selectedCandidate.email}
                    </a>
                  </div>
                </div>
                <div className={`flex items-center space-x-3 p-3.5 rounded-2xl border ${
                  isDark ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <Phone className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-450' : 'text-slate-500'}`}>Phone Number</p>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {selectedCandidate.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills section */}
              <div>
                <h4 className={`text-xs uppercase font-extrabold tracking-wider mb-2.5 ${isDark ? 'text-indigo-300' : 'text-slate-550'}`}>Key Core Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className={`border text-[10px] font-bold px-3 py-1 rounded-lg ${
                        isDark 
                          ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' 
                          : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Summary / Cover Letter */}
              <div>
                <h4 className={`text-xs uppercase font-extrabold tracking-wider mb-2.5 ${isDark ? 'text-indigo-300' : 'text-slate-550'}`}>Profile Summary</h4>
                <p className={`text-xs sm:text-sm leading-relaxed p-5 rounded-2xl border whitespace-pre-line ${
                  isDark 
                    ? 'bg-slate-850/80 border-slate-800 text-slate-300' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  {selectedCandidate.summary}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-6 sm:p-8 border-t flex items-center justify-end gap-3.5 ${
              isDark ? 'border-slate-850 bg-slate-850/40' : 'border-slate-150 bg-slate-50'
            }`}>
              <button
                onClick={() => setSelectedCandidate(null)}
                className={`border font-bold py-2.5 px-6 rounded-xl transition-all text-xs cursor-pointer ${
                  isDark 
                    ? 'bg-transparent border-slate-700 hover:bg-slate-800 text-slate-400' 
                    : 'bg-transparent border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                Close View
              </button>

              {selectedCandidate.resumePath ? (
                <a
                  href={`/${selectedCandidate.resumePath}`}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary py-2.5 px-6 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg hover:scale-105 text-white font-bold"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Verified Resume</span>
                </a>
              ) : (
                <button
                  disabled
                  className={`border py-2.5 px-6 rounded-xl text-xs cursor-not-allowed ${
                    isDark 
                      ? 'bg-slate-800 border-slate-750 text-slate-600' 
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  No Resume Attachment
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TalentDirectory;
