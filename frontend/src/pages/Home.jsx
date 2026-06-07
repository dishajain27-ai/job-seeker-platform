import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Sparkles, ArrowRight, Briefcase, Users, TrendingUp, Cpu, Award, PlusCircle, X, CheckCircle2, Send, FileText, AlertCircle, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocketAlert } from '../context/SocketAlertContext';
import JobCard from '../components/JobCard';

const Home = () => {
  const { isAuthenticated, isEmployer, isSeeker, token, user, logout } = useAuth();
  const { theme } = useTheme();
  const { triggerAlert } = useSocketAlert();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState('Anywhere');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAccessModal, setShowAccessModal] = useState(false);

  // Inquiry form states
  const [inquiryText, setInquiryText] = useState('');
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);
  const [inquiryStatusMsg, setInquiryStatusMsg] = useState({ type: '', text: '' });

  // Autocomplete state
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  // Debounce refs
  const searchTimeoutRef = useRef(null);
  const locationTimeoutRef = useRef(null);

  // Clickable Job Type Filter state
  const [typeFilter, setTypeFilter] = useState('All');

  // Slide-over drawer states
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Drawer Instant Apply Form states
  const [isApplying, setIsApplying] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (locationTimeoutRef.current) clearTimeout(locationTimeoutRef.current);
    };
  }, []);

  // Sync user details when loaded
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Check for employer-access error in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'employer-access') {
      setShowAccessModal(true);
      // Clean URL search parameters without page reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleRecruitingClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/register?role=employer');
    } else if (isEmployer) {
      navigate('/employer-dashboard');
    } else {
      // Authenticated but is a seeker (candidate)
      setShowAccessModal(true);
    }
  };

  const handleLogoutAndSwitch = () => {
    logout();
    setShowAccessModal(false);
    navigate('/register?role=employer');
  };

  // Fetch search keyword suggestions with debounce
  const fetchSearchSuggestions = (val) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (!val.trim()) {
      setSearchSuggestions([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/jobs/suggestions?field=search&query=${encodeURIComponent(val)}`);
        const data = await res.json();
        if (data.success) {
          setSearchSuggestions(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };

  // Fetch location suggestions with debounce
  const fetchLocationSuggestions = (val) => {
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }
    if (!val.trim()) {
      setLocationSuggestions([]);
      return;
    }
    locationTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/jobs/suggestions?field=location&query=${encodeURIComponent(val)}`);
        const data = await res.json();
        if (data.success) {
          setLocationSuggestions(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };

  // Fetch featured jobs (first 3)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        if (data.success) {
          setFeaturedJobs(data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (isDrawerOpen || showAccessModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, showAccessModal]);

  // Clickable Job Type Filtering logic
  const filteredFeaturedJobs = typeFilter === 'All'
    ? featuredJobs
    : featuredJobs.filter(job => job.type === typeFilter);

  // Check application status
  const checkHasApplied = async (jobId) => {
    if (!isAuthenticated || !isSeeker) return;
    try {
      const res = await fetch(`/api/applications/check/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setHasApplied(data.applied);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDrawer = (job) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
    setIsApplying(false);
    setSubmitSuccess(false);
    setSubmitError(null);
    setPhone('');
    setCoverLetter('');
    setResume(null);
    setInquiryText('');
    setInquiryStatusMsg({ type: '', text: '' });
    checkHasApplied(job._id);
  };

  // Drawer apply submission
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!resume) {
      setSubmitError('Please select a resume file');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append('jobId', selectedJob._id);
    formData.append('coverLetter', coverLetter);
    formData.append('resume', resume);
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('phone', phone);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setHasApplied(true);
        triggerAlert(`Application for ${selectedJob.title} at ${selectedJob.company} submitted successfully. Real-time data handshake synchronized.`, 'Real-time Sync');
        setTimeout(() => {
          setIsDrawerOpen(false);
          setIsApplying(false);
          setSubmitSuccess(false);
          setCoverLetter('');
          setResume(null);
          setPhone('');
        }, 2200);
      } else {
        setSubmitError(data.error || 'Submission failed');
      }
    } catch (err) {
      setSubmitError('Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (locationQuery) params.append('location', locationQuery);
    if (searchRadius && searchRadius !== 'Anywhere') params.append('radius', searchRadius);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="flex-grow">
      {/* Hero Section with Grid and Radial Gradients */}
      <section className={`relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28 px-4 sm:px-6 lg:px-8 border-b transition-colors duration-300 ${
        isDark ? 'border-slate-800/80 bg-grid-pattern-dark' : 'border-slate-200/50 bg-grid-pattern'
      }`}>
        
        {/* Dynamic Slow-Floating Blur Blobs */}
        <div className={`absolute top-12 left-10 w-80 h-80 rounded-full filter blur-3xl animate-float-slow transition-colors duration-300 ${
          isDark ? 'bg-primary-400/20' : 'bg-primary-400/10'
        }`}></div>
        <div className={`absolute top-20 right-10 w-96 h-96 rounded-full filter blur-3xl animate-float-delayed transition-colors duration-300 ${
          isDark ? 'bg-accent-400/15' : 'bg-accent-400/10'
        }`}></div>
        <div className={`absolute -bottom-10 left-1/3 w-80 h-80 rounded-full filter blur-3xl animate-float-slow transition-colors duration-300 ${
          isDark ? 'bg-rose-300/10' : 'bg-rose-300/5'
        }`}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            
            {/* Left Column: Title, Description, CTA Buttons, Search Form */}
            <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
              {/* Top Pill badge with sparkle */}
              <div className={`inline-flex items-center space-x-2 border px-4 py-2 rounded-full text-xs font-bold tracking-wide hover:scale-105 transition-all duration-300 shadow-sm ${
                isDark 
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' 
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700'
              }`}>
                <Sparkles className="h-4.5 w-4.5 text-indigo-505 animate-pulse" />
                <span>Discover Elite Tech Opportunities</span>
              </div>

              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Find Your Dream Job <br className="hidden sm:inline" />
                With <span className="gradient-text font-black">TalentHub</span>
              </h1>

              <p className={`text-base sm:text-lg max-w-xl lg:mx-0 mx-auto font-medium mb-8 leading-relaxed transition-colors duration-300 ${
                isDark ? 'text-slate-200' : 'text-slate-600'
              }`}>
                Connect with forward-thinking companies. Post resume uploads, get reviewed by verified tech employers, and unlock matching developer positions.
              </p>

              {/* Buttons Row (CTA) */}
              <div className="flex flex-wrap gap-4 mb-8 justify-center lg:justify-start">
                <Link
                  to="/jobs"
                  className="btn-primary flex items-center space-x-2 text-sm shadow-lg hover:scale-105 transition-transform text-white"
                >
                  <Search className="h-4.5 w-4.5" />
                  <span>Explore Careers</span>
                </Link>
                
                <button
                  onClick={handleRecruitingClick}
                  className={`font-extrabold px-6 py-2.5 rounded-xl border flex items-center space-x-2 transition-all duration-300 text-sm shadow-md hover:scale-105 cursor-pointer ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20 backdrop-blur-md'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-750'
                  }`}
                >
                  <PlusCircle className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Recruiting? Post a Job</span>
                </button>
              </div>

              {/* Search bar with Glassmorphism */}
              <form
                onSubmit={handleSearch}
                className={`w-full p-3 sm:p-4 rounded-3xl border shadow-2xl flex flex-col md:flex-row gap-3.5 relative transition-all duration-300 text-left ${
                  isDark 
                    ? 'glassmorphism border-white/10 hover:border-indigo-500/25' 
                    : 'bg-white/95 border-slate-200 hover:border-indigo-500/35 shadow-lg'
                }`}
              >
                <div className="relative flex-grow flex items-center space-x-3 px-3.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0">
                  <Search className="h-5 w-5 text-slate-700 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company..."
                    value={searchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchQuery(val);
                      fetchSearchSuggestions(val);
                    }}
                    onBlur={() => setTimeout(() => setSearchSuggestions([]), 200)}
                    className="w-full text-sm text-slate-900 placeholder-slate-700 bg-transparent outline-none py-1.5 focus:placeholder-slate-500"
                  />
                  {/* Keyword Dropdown */}
                  {searchSuggestions.length > 0 && (
                    <div className="absolute top-[110%] left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-slate-200/70 rounded-2xl shadow-xl z-50 overflow-hidden text-left max-h-60 overflow-y-auto">
                      {searchSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input blur from firing before state changes
                            setSearchQuery(item);
                            setSearchSuggestions([]);
                          }}
                          className="w-full px-4 py-2.5 text-xs text-slate-700 font-bold hover:bg-primary-50 hover:text-primary-750 transition-colors text-left flex items-center space-x-2 border-b border-slate-50 last:border-0 cursor-pointer"
                        >
                          <Search className="h-3.5 w-3.5 text-slate-455" />
                          <span className="truncate">{item}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative flex-grow flex items-center space-x-3 px-3.5 pb-3 md:pb-0">
                  <MapPin className="h-5 w-5 text-slate-700 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="City, state, or remote..."
                    value={locationQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocationQuery(val);
                      fetchLocationSuggestions(val);
                    }}
                    onBlur={() => setTimeout(() => setLocationSuggestions([]), 200)}
                    className="w-full text-sm text-slate-900 placeholder-slate-700 bg-transparent outline-none py-1.5 focus:placeholder-slate-500"
                  />
                  {/* Location Dropdown */}
                  {locationSuggestions.length > 0 && (
                    <div className="absolute top-[110%] left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-slate-200/70 rounded-2xl shadow-xl z-50 overflow-hidden text-left max-h-60 overflow-y-auto">
                      {locationSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input blur from firing before state changes
                            setLocationQuery(item);
                            setLocationSuggestions([]);
                          }}
                          className="w-full px-4 py-2.5 text-xs text-slate-700 font-bold hover:bg-primary-50 hover:text-primary-750 transition-colors text-left flex items-center space-x-2 border-b border-slate-50 last:border-0 cursor-pointer"
                        >
                          <MapPin className="h-3.5 w-3.5 text-slate-455" />
                          <span className="truncate">{item}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative flex items-center space-x-2 px-3.5 pb-3 md:pb-0 border-t md:border-t-0 md:border-l border-slate-200/50">
                  <select
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(e.target.value)}
                    className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer pr-2 py-1.5 focus:text-slate-900"
                  >
                    <option value="Anywhere">Anywhere</option>
                    <option value="Within 5 km">Within 5 km</option>
                    <option value="Within 15 km">Within 15 km</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary py-3.5 px-6 md:w-auto w-full flex items-center justify-center space-x-2 text-sm shadow-md text-white">
                  <Search className="h-4.5 w-4.5" />
                  <span>Search Jobs</span>
                </button>
              </form>
            </div>

            {/* Right Column: Dashboard Preview Panel with anchored flanking badges */}
            <div className="lg:col-span-5 relative hidden lg:block select-none">
              
              {/* Recruiter Panel Mockup Card */}
              <div className={`p-6 rounded-3xl shadow-2xl relative w-full overflow-hidden text-left border transition-all duration-300 ${
                isDark ? 'bg-slate-900/90 border-slate-800/80 text-slate-100 backdrop-blur-md' : 'bg-white border-slate-200/60 shadow-lg'
              }`}>
                {/* Glow effects */}
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-2xl"></div>

                <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-5 flex items-center justify-between ${
                  isDark ? 'text-slate-400' : 'text-slate-405'
                }`}>
                  <span>Talent Sourcing Board</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </h3>

                {/* Mock applicants */}
                <div className="space-y-4">
                  <div className={`p-3.5 rounded-2xl flex items-center justify-between shadow-sm border transition-all duration-300 ${
                    isDark ? 'bg-slate-800/65 border-slate-700/50 text-slate-105' : 'bg-slate-50 border-slate-200/50 text-slate-800'
                  }`}>
                    <div>
                      <p className={`text-sm font-bold transition-colors ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Aarav Sharma</p>
                      <p className={`text-[10px] font-semibold transition-colors ${isDark ? 'text-slate-350' : 'text-slate-500'}`}>Full Stack Developer</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border transition-colors duration-300 ${
                        isDark 
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-[0_0_6px_rgba(99,102,241,0.15)]' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>94% Match</span>
                      <p className={`text-[9px] font-semibold mt-1 transition-colors duration-300 ${
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>Interview Scheduled</p>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-2xl flex items-center justify-between shadow-sm border transition-all duration-300 ${
                    isDark ? 'bg-slate-800/65 border-slate-700/50 text-slate-105' : 'bg-slate-50 border-slate-200/50 text-slate-800'
                  }`}>
                    <div>
                      <p className={`text-sm font-bold transition-colors ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Neha Gupta</p>
                      <p className={`text-[10px] font-semibold transition-colors ${isDark ? 'text-slate-350' : 'text-slate-500'}`}>Frontend Engineer</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border transition-colors duration-300 ${
                        isDark 
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-[0_0_6px_rgba(99,102,241,0.15)]' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>88% Match</span>
                      <p className={`text-[9px] font-semibold mt-1 transition-colors duration-300 ${
                        isDark ? 'text-indigo-400' : 'text-indigo-650'
                      }`}>Shortlisted</p>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-2xl flex items-center justify-between shadow-sm border transition-all duration-300 ${
                    isDark ? 'bg-slate-800/65 border-slate-700/50 text-slate-105' : 'bg-slate-50 border-slate-200/50 text-slate-800'
                  }`}>
                    <div>
                      <p className={`text-sm font-bold transition-colors ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Dev Patel</p>
                      <p className={`text-[10px] font-semibold transition-colors ${isDark ? 'text-slate-350' : 'text-slate-500'}`}>Python Developer</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border transition-colors duration-300 ${
                        isDark 
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-[0_0_6px_rgba(99,102,241,0.15)]' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>91% Match</span>
                      <p className={`text-[9px] font-semibold mt-1 transition-colors duration-300 ${
                        isDark ? 'text-amber-400' : 'text-amber-700'
                      }`}>Under Review</p>
                    </div>
                  </div>

                </div>

                {/* Statistics panel */}
                <div className={`mt-5 pt-4 border-t grid grid-cols-2 gap-4 text-center transition-colors duration-300 ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Matched Talent</p>
                    <p className={`text-sm font-extrabold mt-0.5 transition-colors ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>91% Average</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Sourcing Speed</p>
                    <p className={`text-sm font-extrabold mt-0.5 transition-colors duration-300 ${
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>3.2 Days</p>
                  </div>
                </div>
              </div>

              {/* Anchored Badges flanking the dashboard card */}
              <div className={`absolute -top-12 -left-10 animate-float-slow backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border text-[10px] font-bold flex items-center space-x-2 transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0b1329]/80 border-white/10 text-slate-200' 
                  : 'bg-white/95 border-slate-200 text-slate-700 shadow-md'
              }`}>
                <Cpu className="h-4.5 w-4.5 text-indigo-400" />
                <span>React Developer</span>
              </div>

              <div className={`absolute top-[32%] -right-18 animate-float-delayed backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border text-[10px] font-bold flex items-center space-x-2 transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0b1329]/80 border-white/10 text-slate-200' 
                  : 'bg-white/95 border-slate-200 text-slate-700 shadow-md'
              }`}>
                <Award className="h-4.5 w-4.5 text-amber-500" />
                <span>₹12L+ Average</span>
              </div>

              <div className={`absolute -bottom-12 left-12 animate-float-slow backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border text-[10px] font-bold flex items-center space-x-2 transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0b1329]/80 border-white/10 text-slate-200' 
                  : 'bg-white/95 border-slate-200 text-slate-700 shadow-md'
              }`}>
                <Users className="h-4.5 w-4.5 text-emerald-400" />
                <span>Verified Recruiters</span>
              </div>
            </div>

          </div>

          {/* Stats Section with Hover Effect */}
          <div className={`grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto mt-20 text-center border-t pt-10 transition-colors duration-300 ${
            isDark ? 'border-white/10' : 'border-slate-200'
          }`}>
            <div className="p-2 sm:p-3 hover:scale-105 transition-transform duration-250">
              <p className={`text-2xl sm:text-4xl font-extrabold transition-colors duration-300 ${isDark ? 'text-white' : 'text-primary-750'}`}>12k+</p>
              <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wide mt-1.5 leading-snug break-words transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Live Listings</p>
            </div>
            <div className="p-2 sm:p-3 hover:scale-105 transition-transform duration-250">
              <p className={`text-2xl sm:text-4xl font-extrabold transition-colors duration-300 ${isDark ? 'text-white' : 'text-primary-750'}`}>4.8k+</p>
              <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wide mt-1.5 leading-snug break-words transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Hired Candidates</p>
            </div>
            <div className="p-2 sm:p-3 hover:scale-105 transition-transform duration-250">
              <p className={`text-2xl sm:text-4xl font-extrabold transition-colors duration-300 ${isDark ? 'text-white' : 'text-primary-750'}`}>800+</p>
              <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wide mt-1.5 leading-snug break-words transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Top Employers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3 flex-wrap transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <span>Featured <span className="gradient-text font-black">Jobs</span></span>
              {typeFilter !== 'All' && (
                <span className={`text-[10px] border px-3 py-1 rounded-full flex items-center gap-1.5 font-bold tracking-wide transition-colors ${
                  isDark ? 'bg-indigo-500/25 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-755 border-indigo-200'
                }`}>
                  <span>Type: {typeFilter}</span>
                  <button
                    onClick={() => setTypeFilter('All')}
                    className="hover:text-white cursor-pointer p-0.5 text-indigo-400 bg-transparent outline-none focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </h2>
            <p className={`text-sm font-semibold mt-1 transition-colors duration-300 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Explore recently uploaded engineering and design opportunities.
            </p>
          </div>
          <Link
            to="/jobs"
            className={`group hidden sm:flex items-center space-x-1 text-sm font-bold transition-colors ${
              isDark ? 'text-primary-300 hover:text-primary-100' : 'text-primary-600 hover:text-primary-800'
            }`}
          >
            <span>Explore All Jobs</span>
            <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1.5 transition-transform duration-250" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse space-y-4 shadow-sm">
                <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                <div className="border-t border-slate-100 pt-4 flex space-x-3">
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredFeaturedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredFeaturedJobs.map((job) => (
              // Reused component now benefits from hover effects automatically!
              <JobCard 
                key={job._id} 
                job={job} 
                onTypeClick={(type) => setTypeFilter(type)}
                onViewDetailsClick={handleOpenDrawer}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/60 rounded-2xl p-16 text-center max-w-xl mx-auto shadow-sm">
            <Briefcase className="h-12 w-12 text-slate-350 mx-auto mb-4" />
            <p className="font-bold text-slate-700">No job postings found</p>
            <p className="text-sm text-slate-400 mt-1.5">No positions match the "{typeFilter}" employment type category.</p>
            <button 
              onClick={() => setTypeFilter('All')} 
              className="mt-4 text-xs font-bold text-indigo-650 hover:text-indigo-850 underline cursor-pointer bg-transparent border-0 focus:outline-none"
            >
              Reset Filters
            </button>
          </div>
        )}

        <div className="sm:hidden mt-8 text-center">
          <Link
            to="/jobs"
            className="inline-flex items-center space-x-1.5 text-sm font-bold text-primary-600"
          >
            <span>Explore All Jobs</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
        </div>
      </section>

      {/* Centered Modal for Job Details */}
      {isDrawerOpen && selectedJob && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-55 overflow-y-auto p-4 flex justify-center items-start pt-10 pb-10 animate-in fade-in duration-250"
          onClick={() => {
            setIsDrawerOpen(false);
            setIsApplying(false);
          }}
        >
          <div 
            className={`w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col justify-between transform transition-all duration-300 relative text-left border overflow-hidden ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Gradient Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-accent-500" />

            {/* Close Button */}
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setIsApplying(false);
              }}
              className={`absolute top-5 right-5 p-1.5 rounded-full transition-colors cursor-pointer border focus:outline-none ${
                isDark 
                  ? 'text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border-slate-700' 
                  : 'text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200/60'
              }`}
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Scrollable Drawer Body */}
            <div className="flex-grow p-6 sm:p-8 overflow-y-auto pt-10">
              <div className="space-y-6">
                <div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isDark 
                      ? 'bg-primary-500/10 border-primary-500/25 text-primary-300' 
                      : 'bg-primary-50 border-primary-150 text-primary-700'
                  }`}>
                    {selectedJob.type}
                  </span>
                  <h3 className={`text-xl sm:text-2xl font-black tracking-tight leading-tight mt-3 transition-colors ${
                    isDark ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    {selectedJob.title}
                  </h3>
                  <div className={`flex flex-wrap gap-x-4 gap-y-2 mt-2 text-xs font-bold transition-colors ${
                    isDark ? 'text-slate-400' : 'text-slate-550'
                  }`}>
                    <span>{selectedJob.company}</span>
                    <span>•</span>
                    <span>{selectedJob.location}</span>
                    <span>•</span>
                    <span className={isDark ? 'text-indigo-400' : 'text-primary-650'}>{selectedJob.salary}</span>
                  </div>
                </div>

                {!isApplying ? (
                  /* Job Specs Content */
                  <div className={`space-y-6 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div>
                      <h4 className={`text-xs uppercase font-extrabold tracking-wider mb-2 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>Job Description</h4>
                      <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium p-4.5 rounded-2xl border transition-all ${
                        isDark 
                          ? 'bg-slate-800/40 border-slate-800/80 text-slate-300' 
                          : 'bg-slate-50/50 border-slate-150/50 text-slate-650'
                      }`}>
                        {selectedJob.description}
                      </p>
                    </div>

                    <div>
                      <h4 className={`text-xs uppercase font-extrabold tracking-wider mb-2.5 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>Key Requirements</h4>
                      {selectedJob.requirements && selectedJob.requirements.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedJob.requirements.map((req, idx) => (
                            <li key={idx} className={`flex items-start text-xs font-semibold leading-relaxed transition-colors ${
                              isDark ? 'text-slate-350' : 'text-slate-600'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 mr-2.5 flex-shrink-0"></span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-455 italic">No specific requirements mentioned.</p>
                      )}
                    </div>

                    {/* Hotline support */}
                    {selectedJob.hotline && (
                      <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        isDark 
                          ? 'bg-slate-800/40 border-slate-800/80 text-slate-300' 
                          : 'bg-slate-50/50 border-slate-150/50 text-slate-655'
                      }`}>
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-650'}`}>
                            <Phone className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Hiring Hotline</p>
                            <p className="text-xs font-black">{selectedJob.hotline}</p>
                          </div>
                        </div>
                        <a 
                          href={`tel:${selectedJob.hotline}`}
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all hover:scale-105 ${
                            isDark 
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20' 
                              : 'bg-indigo-50 border-indigo-200 text-indigo-750 hover:bg-indigo-100'
                          }`}
                        >
                          Call Now
                        </a>
                      </div>
                    )}

                    {/* Job Query Box */}
                    {isAuthenticated && isSeeker && (
                      <div className={`p-4.5 rounded-2xl border space-y-3 transition-all ${
                        isDark 
                          ? 'bg-slate-850/40 border-slate-800/80 text-slate-350' 
                          : 'bg-slate-50/30 border-slate-150/50 text-slate-600'
                      }`}>
                        <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Have a Question? Ask the Hiring Team</h4>
                        <textarea
                          placeholder="Type your query about assignments, location, or scheduling here..."
                          value={inquiryText}
                          onChange={(e) => setInquiryText(e.target.value)}
                          rows={3}
                          className={`w-full text-xs font-semibold p-3.5 rounded-xl border bg-transparent outline-none resize-none transition-all focus:ring-2 focus:ring-primary-500/15 ${
                            isDark 
                              ? 'border-slate-800 placeholder-slate-500 focus:border-primary-450 text-slate-200' 
                              : 'border-slate-200 placeholder-slate-400 focus:border-primary-400 text-slate-800'
                          }`}
                        />
                        {inquiryStatusMsg.text && (
                          <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                            inquiryStatusMsg.type === 'success'
                              ? isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-705 border border-emerald-250'
                              : isDark ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' : 'bg-rose-50 text-rose-705 border border-rose-250'
                          }`}>
                            {inquiryStatusMsg.type === 'success' ? (
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span>{inquiryStatusMsg.text}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          disabled={isInquirySubmitting || !inquiryText.trim()}
                          onClick={async () => {
                            if (!inquiryText.trim()) return;
                            setIsInquirySubmitting(true);
                            setInquiryStatusMsg({ type: '', text: '' });
                            try {
                              const res = await fetch('/api/applications/inquiries', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                  jobId: selectedJob._id,
                                  companyName: selectedJob.company,
                                  queryText: inquiryText
                                })
                              });
                              const data = await res.json();
                              if (data.success) {
                                setInquiryText('');
                                setInquiryStatusMsg({ type: 'success', text: 'Inquiry submitted successfully! Track it in your dashboard.' });
                                triggerAlert(`New Inquiry submitted for ${selectedJob.title} at ${selectedJob.company}`, 'Inquiry Alert');
                              } else {
                                setInquiryStatusMsg({ type: 'error', text: data.error || 'Failed to submit inquiry' });
                              }
                            } catch (err) {
                              setInquiryStatusMsg({ type: 'error', text: 'Network error. Please try again.' });
                            } finally {
                              setIsInquirySubmitting(false);
                            }
                          }}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-2 ${
                            !inquiryText.trim()
                              ? 'bg-slate-400/10 text-slate-450 border border-slate-300/15 cursor-not-allowed'
                              : isDark 
                                ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg' 
                                : 'bg-primary-600 hover:bg-primary-750 text-white shadow-md hover:shadow-lg'
                          }`}
                        >
                          {isInquirySubmitting ? (
                            <span>Sending...</span>
                          ) : (
                            <>
                              <Send className="h-3 w-3" />
                              <span>Send Message</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Instant Apply Form Content */
                  <div className={`space-y-5 pt-4 border-t animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    <h4 className={`text-xs uppercase font-extrabold tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-slate-550'
                    }`}>Submit Application Form</h4>
                    
                    {submitSuccess ? (
                      <div className="py-6 text-center space-y-3">
                        <div className="inline-flex p-3 bg-emerald-50 rounded-full text-emerald-500 border border-emerald-100 mb-1">
                          <CheckCircle2 className="h-8 w-8 animate-bounce" />
                        </div>
                        <h5 className={`text-base font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Application Submitted!</h5>
                        <p className="text-xs text-slate-450 leading-relaxed">
                          Confirmation email has been logged to your inbox. Closing details...
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleApplySubmit} className="space-y-4">
                        {submitError && (
                          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-xl text-xs font-medium">
                            {submitError}
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase tracking-wider pl-0.5 ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>Full Name *</label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={`w-full text-xs p-3 rounded-xl border outline-none font-semibold transition-all ${
                              isDark 
                                ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-primary-550 focus:bg-slate-850' 
                                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-primary-400 focus:bg-white'
                            }`}
                            placeholder="John Doe"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase tracking-wider pl-0.5 ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>Email Address *</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full text-xs p-3 rounded-xl border outline-none font-semibold transition-all ${
                              isDark 
                                ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-primary-550 focus:bg-slate-850' 
                                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-primary-400 focus:bg-white'
                            }`}
                            placeholder="you@example.com"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase tracking-wider pl-0.5 ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>Phone Number *</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`w-full text-xs p-3 rounded-xl border outline-none font-semibold transition-all ${
                              isDark 
                                ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-primary-550 focus:bg-slate-850' 
                                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-primary-400 focus:bg-white'
                            }`}
                            placeholder="+91 9999999999"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={`text-[10px] font-bold uppercase tracking-wider pl-0.5 ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>Cover Letter Summary</label>
                          <textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            className={`w-full text-xs p-3 rounded-xl border outline-none font-semibold min-h-[80px] resize-none transition-all ${
                              isDark 
                                ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-primary-550 focus:bg-slate-850' 
                                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-primary-400 focus:bg-white'
                            }`}
                            placeholder="Introduce yourself and explain why you're a great fit..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className={`text-[10px] font-bold uppercase tracking-wider pl-0.5 ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>Upload Resume (PDF/Docx) *</label>
                          <div className={`relative border border-dashed rounded-xl p-3.5 flex flex-col items-center justify-center transition-colors ${
                            isDark ? 'border-slate-700 hover:border-primary-500 bg-slate-800/30' : 'border-slate-200 hover:border-primary-400 bg-slate-50/50'
                          }`}>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                setResume(e.target.files[0]);
                                if (submitError) setSubmitError(null);
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              required
                            />
                            <FileText className="h-6 w-6 text-slate-400 mb-1" />
                            <span className={`text-[10px] font-extrabold truncate max-w-[200px] transition-colors ${
                              isDark ? 'text-slate-300' : 'text-slate-650'
                            }`}>
                              {resume ? resume.name : 'Select resume file...'}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsApplying(false)}
                            className={`flex-grow border font-bold text-xs py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                              isDark ? 'bg-slate-850 border-slate-700 hover:bg-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-grow btn-primary text-xs py-3 rounded-xl shadow-md text-white font-bold flex items-center justify-center space-x-1.5"
                          >
                            {isSubmitting ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5" />
                                <span>Submit application</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Panel CTA Buttons */}
            {!submitSuccess && (
              <div className={`p-6 border-t flex gap-3 z-10 transition-colors duration-300 ${
                isDark ? 'bg-slate-900 border-slate-850' : 'bg-slate-50 border-slate-150'
              }`}>
                {!isApplying ? (
                  <>
                    {hasApplied ? (
                      <div className="w-full flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold py-3.5 rounded-xl text-xs cursor-default shadow-inner">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Application Submitted</span>
                      </div>
                    ) : isSeeker || !isAuthenticated ? (
                      <button
                        onClick={() => {
                          if (isAuthenticated) {
                            setIsApplying(true);
                          } else {
                            window.location.href = `/login?redirect=/jobs/${selectedJob._id}`;
                          }
                        }}
                        className="w-full btn-primary py-3.5 text-xs rounded-xl shadow-md text-white font-bold flex items-center justify-center space-x-2 hover:scale-[1.02] cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                        <span>{isAuthenticated ? 'Apply Now' : 'Sign in to Apply'}</span>
                      </button>
                    ) : (
                      <div className={`w-full text-[10px] font-bold border p-3 rounded-xl text-center transition-colors ${
                        isDark ? 'text-slate-450 border-slate-800 bg-slate-850/60' : 'text-slate-400 border-slate-205 bg-white/60'
                      }`}>
                        Employer account logged in
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Access Restriction Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md overflow-y-auto p-4 z-50 flex justify-center items-start pt-10 pb-10 animate-fade-in">
          <div className={`rounded-3xl border max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-colors duration-300 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200/80 text-slate-800'
          }`}>
            {/* Modal header decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
            
            <button
              onClick={() => setShowAccessModal(false)}
              className={`absolute top-5 right-5 transition-colors p-1.5 rounded-xl cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-450 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2 text-rose-500 font-extrabold text-lg">
                <AlertCircle className="h-6 w-6 animate-pulse" />
                <span>Employer Access Required</span>
              </div>
              <p className={`text-sm leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Employer Access Required. You are currently signed in as a Candidate. Please log out or use an Employer account to post job listings.
              </p>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAccessModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isDark ? 'bg-slate-850 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutAndSwitch}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md hover:scale-102 transition-all cursor-pointer"
                >
                  Logout & Switch to Employer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
