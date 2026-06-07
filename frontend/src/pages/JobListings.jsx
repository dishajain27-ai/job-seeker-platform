import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, Briefcase, Filter, RotateCcw } from 'lucide-react';
import JobCard from '../components/JobCard';
import { useTheme } from '../context/ThemeContext';

const cityCoordinates = {
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'noida': { lat: 28.5355, lng: 77.3910 },
  'gurgaon': { lat: 28.4595, lng: 77.0266 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 }
};

const getSearchCoordinates = (locationStr) => {
  if (!locationStr) return null;
  const locLower = locationStr.toLowerCase().trim();
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (locLower.includes(city) || city.includes(locLower)) {
      return coords;
    }
  }
  return null;
};

const getHaversineDistance = (coords1, coords2) => {
  if (!coords1 || !coords2) return Infinity;
  const lat1 = coords1.lat;
  const lon1 = coords1.lng;
  const lat2 = coords2.lat;
  const lon2 = coords2.lng;
  
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
};

const JobListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Read initial states from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [searchRadius, setSearchRadius] = useState(searchParams.get('radius') || 'Anywhere');
  const [type, setType] = useState(searchParams.get('type') || 'All');

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Pagination states
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Autocomplete states
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  // Debounce refs
  const searchTimeoutRef = useRef(null);
  const locationTimeoutRef = useRef(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (locationTimeoutRef.current) clearTimeout(locationTimeoutRef.current);
    };
  }, []);

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

  // Sync state variables if URL search params change (e.g. back button)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setLocation(searchParams.get('location') || '');
    setSearchRadius(searchParams.get('radius') || 'Anywhere');
    setType(searchParams.get('type') || 'All');
  }, [searchParams]);

  // Fetch jobs on searchParams change
  useEffect(() => {
    const fetchFilteredJobs = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        const currentSearch = searchParams.get('search') || '';
        const currentLocation = searchParams.get('location') || '';
        const currentType = searchParams.get('type') || 'All';
        const currentRadius = searchParams.get('radius') || 'Anywhere';
        const currentPageVal = searchParams.get('page') || '1';

        if (currentSearch) queryParams.append('search', currentSearch);
        if (currentLocation) queryParams.append('location', currentLocation);
        if (currentType && currentType !== 'All') queryParams.append('type', currentType);
        
        // If radius is specified, fetch more listings from server so we can filter client-side
        if (currentRadius && currentRadius !== 'Anywhere') {
          queryParams.append('limit', '100');
        } else {
          queryParams.append('page', currentPageVal);
          queryParams.append('limit', '6');
        }

        const res = await fetch(`/api/jobs?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success) {
          let jobsList = data.data;

          if (currentLocation && currentRadius && currentRadius !== 'Anywhere') {
            const searchCoords = getSearchCoordinates(currentLocation);
            if (searchCoords) {
              const maxDist = currentRadius === 'Within 5 km' ? 5 : 15;
              jobsList = jobsList.filter(job => {
                if (!job.coordinates) return false;
                const dist = getHaversineDistance(searchCoords, job.coordinates);
                return dist <= maxDist;
              });
            }
          }

          if (currentRadius && currentRadius !== 'Anywhere') {
            const total = jobsList.length;
            const pageInt = parseInt(currentPageVal) || 1;
            const limitInt = 6;
            const skip = (pageInt - 1) * limitInt;
            const paginatedJobs = jobsList.slice(skip, skip + limitInt);
            setJobs(paginatedJobs);
            setTotalPages(Math.ceil(total / limitInt) || 1);
            setTotalJobs(total);
          } else {
            setJobs(jobsList);
            setTotalPages(data.pages || 1);
            setTotalJobs(data.total || data.data.length);
          }
        }
      } catch (err) {
        console.error('Error fetching filtered jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredJobs();
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const newParams = new URLSearchParams();
    if (search) newParams.set('search', search);
    if (location) newParams.set('location', location);
    if (searchRadius && searchRadius !== 'Anywhere') newParams.set('radius', searchRadius);
    if (type && type !== 'All') newParams.set('type', type);
    setSearchParams(newParams);
  };

  const handleTypeChange = (selectedType) => {
    setType(selectedType);
    const newParams = new URLSearchParams(searchParams);
    if (selectedType && selectedType !== 'All') {
      newParams.set('type', selectedType);
    } else {
      newParams.delete('type');
    }
    newParams.delete('page'); // Reset to page 1 on type change
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setSearchRadius('Anywhere');
    setType('All');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const jobTypes = ['All', 'Full-time', 'Internship', 'Part-time', 'Contract'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow flex flex-col relative">
      {/* Top Header & Search Bar */}
      <div className="mb-8">
        <h1 className={`text-3xl font-extrabold tracking-tight transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Explore <span className={isDark ? 'text-white font-black' : 'text-primary-700 font-black'}>Careers</span>
        </h1>
        <p className={`text-sm mt-1.5 font-semibold transition-colors duration-300 ${
          isDark ? 'text-slate-200' : 'text-slate-600'
        }`}>
          Filter and discover matches that align with your lifestyle and tech expertise.
        </p>
      </div>

      {/* Main Search Panel Form - Styled in Glassmorphism */}
      <form
        onSubmit={handleSearchSubmit}
        className={`p-4 rounded-3xl shadow-xl mb-8 flex flex-col md:flex-row gap-3.5 relative z-10 transition-colors duration-300 border ${
          isDark 
            ? 'bg-white/10 backdrop-blur-xl border-white/10 hover:border-white/20' 
            : 'bg-white/95 border-slate-200 hover:border-indigo-500/25 shadow-md'
        }`}
      >
        <div className={`relative flex-grow flex items-center space-x-3 rounded-2xl px-4 py-3 shadow-inner-sm transition-all border ${
          isDark 
            ? 'bg-slate-800/40 border-slate-700/60 focus-within:border-primary-450 focus-within:ring-2 focus-within:ring-primary-500/10' 
            : 'bg-slate-50 border-slate-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/10'
        }`}>
          <Search className="h-4.5 w-4.5 text-slate-750 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search keywords, titles, or company..."
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              fetchSearchSuggestions(val);
            }}
            onBlur={() => setTimeout(() => setSearchSuggestions([]), 200)}
            className={`w-full text-sm bg-transparent outline-none transition-colors duration-300 ${
              isDark ? 'text-slate-100 placeholder-slate-400' : 'text-slate-900 placeholder-slate-600'
            }`}
          />
          {/* Suggestions Dropdown */}
          {searchSuggestions.length > 0 && (
            <div className={`absolute top-[110%] left-0 right-0 mt-1 rounded-2xl shadow-xl z-50 overflow-hidden text-left max-h-60 overflow-y-auto border ${
              isDark 
                ? 'bg-slate-900/95 border-slate-800 text-slate-100' 
                : 'bg-white/95 border-slate-200 text-slate-800'
            }`}>
              {searchSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearch(item);
                    setSearchSuggestions([]);
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('search', item);
                    setSearchParams(newParams);
                  }}
                  className={`w-full px-4 py-2.5 text-xs font-bold transition-colors text-left flex items-center space-x-2 border-b last:border-0 cursor-pointer ${
                    isDark 
                      ? 'text-slate-200 hover:bg-slate-800 hover:text-indigo-400 border-slate-850' 
                      : 'text-slate-700 hover:bg-primary-50 hover:text-primary-750 border-slate-50'
                  }`}
                >
                  <Search className="h-3.5 w-3.5 text-slate-450" />
                  <span className="truncate">{item}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`relative flex-grow flex items-center space-x-3 rounded-2xl px-4 py-3 shadow-inner-sm transition-all border ${
          isDark 
            ? 'bg-slate-800/40 border-slate-700/60 focus-within:border-primary-450 focus-within:ring-2 focus-within:ring-primary-500/10' 
            : 'bg-slate-50 border-slate-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/10'
        }`}>
          <MapPin className="h-4.5 w-4.5 text-slate-750 flex-shrink-0" />
          <input
            type="text"
            placeholder="Location or remote..."
            value={location}
            onChange={(e) => {
              const val = e.target.value;
              setLocation(val);
              fetchLocationSuggestions(val);
            }}
            onBlur={() => setTimeout(() => setLocationSuggestions([]), 200)}
            className={`w-full text-sm bg-transparent outline-none transition-colors duration-300 ${
              isDark ? 'text-slate-100 placeholder-slate-400' : 'text-slate-900 placeholder-slate-600'
            }`}
          />
          {/* Location Dropdown */}
          {locationSuggestions.length > 0 && (
            <div className={`absolute top-[110%] left-0 right-0 mt-1 rounded-2xl shadow-xl z-50 overflow-hidden text-left max-h-60 overflow-y-auto border ${
              isDark 
                ? 'bg-slate-900/95 border-slate-800 text-slate-100' 
                : 'bg-white/95 border-slate-200 text-slate-800'
            }`}>
              {locationSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setLocation(item);
                    setLocationSuggestions([]);
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('location', item);
                    setSearchParams(newParams);
                  }}
                  className={`w-full px-4 py-2.5 text-xs font-bold transition-colors text-left flex items-center space-x-2 border-b last:border-0 cursor-pointer ${
                    isDark 
                      ? 'text-slate-200 hover:bg-slate-800 hover:text-indigo-400 border-slate-850' 
                      : 'text-slate-700 hover:bg-primary-50 hover:text-primary-750 border-slate-50'
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5 text-slate-455" />
                  <span className="truncate">{item}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`relative flex items-center space-x-2 rounded-2xl px-3 py-3 shadow-inner-sm transition-all border ${
          isDark 
            ? 'bg-slate-800/40 border-slate-700/60 focus-within:border-primary-450' 
            : 'bg-slate-50 border-slate-200 focus-within:border-primary-400'
        }`}>
          <select
            value={searchRadius}
            onChange={(e) => {
              setSearchRadius(e.target.value);
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value && e.target.value !== 'Anywhere') {
                newParams.set('radius', e.target.value);
              } else {
                newParams.delete('radius');
              }
              newParams.delete('page');
              setSearchParams(newParams);
            }}
            className={`text-xs font-bold bg-transparent outline-none cursor-pointer pr-2 ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}
          >
            <option value="Anywhere" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-805'}>Anywhere</option>
            <option value="Within 5 km" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-805'}>Within 5 km</option>
            <option value="Within 15 km" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-805'}>Within 15 km</option>
          </select>
        </div>

        <div className="flex gap-2">
          {/* Main Search Action Button */}
          <button
            type="submit"
            className="btn-primary py-3 px-8 text-sm flex items-center justify-center space-x-2"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className={`md:hidden flex items-center justify-center space-x-2 border font-bold px-4 py-2.5 rounded-2xl text-sm transition-all ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-200' 
                : 'bg-white/45 border-slate-200 text-slate-700'
            }`}
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
            <span>Filters</span>
          </button>
        </div>
      </form>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-grow relative z-10">
        {/* Left Sidebar Filter (Desktop) - Styled in Glassmorphism */}
        <div className={`col-span-1 space-y-6 ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
          <div className={`p-6 rounded-3xl shadow-xl sticky top-24 border transition-colors duration-300 ${
            isDark 
              ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800/80 hover:border-slate-750' 
              : 'bg-white border-slate-200 shadow-md'
          }`}>
            <div className={`flex justify-between items-center mb-5 pb-3 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-150'
            }`}>
              <div className={`flex items-center space-x-1.5 font-bold text-sm transition-colors ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                <Filter className="h-4 w-4 text-indigo-400" />
                <span>Filters</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-500 hover:text-rose-500 flex items-center space-x-1 transition-colors"
                title="Reset Filters"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* More Search Options button */}
            <button
              type="button"
              className={`w-full flex items-center space-x-2.5 border font-extrabold px-4 py-3 rounded-2xl text-xs transition-all duration-200 mb-6 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-750 text-slate-200' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-750'
              }`}
            >
              <div className="bg-primary-500/20 p-1.5 rounded-lg border border-primary-200/30">
                <Search className="h-3.5 w-3.5 text-primary-500" />
              </div>
              <span>More Search Options</span>
            </button>

            {/* Job Type Filter */}
            <div className="space-y-3">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-450' : 'text-slate-500'}`}>Job Type</h3>
              <div className="space-y-2.5">
                {jobTypes.map((t) => (
                  <label key={t} className={`flex items-center space-x-2.5 cursor-pointer text-sm font-semibold transition-colors ${
                    isDark ? 'text-slate-300 hover:text-primary-400' : 'text-slate-750 hover:text-primary-705'
                  }`}>
                    <input
                      type="radio"
                      name="jobType"
                      checked={type === t}
                      onChange={() => handleTypeChange(t)}
                      className="h-4 w-4 border-slate-300 bg-white/50 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Job list */}
        <div className="col-span-1 lg:col-span-3 flex flex-col min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 4].map((n) => (
                <div key={n} className={`rounded-2xl border p-6 animate-pulse space-y-4 shadow-sm ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200'
                }`}>
                  <div className="h-4 bg-slate-200/50 rounded w-1/4"></div>
                  <div className="h-6 bg-slate-200/50 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200/50 rounded w-1/2"></div>
                  <div className={`border-t pt-4 flex space-x-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="h-4 bg-slate-200/50 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-200/50 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <>
              <p className={`text-xs font-bold uppercase mb-4 tracking-wider pl-1 transition-colors duration-300 ${
                isDark ? 'text-slate-300' : 'text-slate-550'
              }`}>
                Showing {((currentPage - 1) * 6) + 1}–{((currentPage - 1) * 6) + jobs.length} of {totalJobs} Position{totalJobs === 1 ? '' : 's'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} onTypeClick={handleTypeChange} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8 pb-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      currentPage === 1
                        ? isDark 
                          ? 'bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed' 
                          : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : isDark
                          ? 'bg-slate-800 border-slate-700 hover:bg-slate-755 text-slate-200 hover:scale-[1.02] cursor-pointer'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:scale-[1.02] cursor-pointer'
                    }`}
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    const isActive = pageNumber === currentPage;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold border transition-all ${
                          isActive
                            ? 'bg-primary-600 border-primary-500 text-white shadow-md'
                            : isDark
                              ? 'bg-slate-800 border-slate-700 hover:bg-slate-755 text-slate-200 hover:scale-[1.02] cursor-pointer'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:scale-[1.02] cursor-pointer'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      currentPage === totalPages
                        ? isDark 
                          ? 'bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed' 
                          : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : isDark
                          ? 'bg-slate-800 border-slate-700 hover:bg-slate-755 text-slate-200 hover:scale-[1.02] cursor-pointer'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:scale-[1.02] cursor-pointer'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            // Glassmorphic placeholder for Empty state
            <div className={`p-16 text-center max-w-xl mx-auto shadow-xl my-auto transition-colors duration-300 relative border rounded-3xl ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' 
                : 'bg-white/80 border-slate-200/80 hover:border-slate-300'
            }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border ${
                isDark ? 'bg-slate-850 border-slate-700' : 'bg-white/40 border border-white/50'
              }`}>
                <Briefcase className="h-8 w-8 text-slate-500" />
              </div>
              <h2 className={`font-extrabold text-lg transition-colors ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>No career listings found</h2>
              <p className={`text-sm mt-2.5 leading-relaxed font-medium transition-colors ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>
                We couldn't find matches for the query. Try adjusting your search term, resetting filters, or switching location queries.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className={`py-2.5 px-6 text-sm font-extrabold rounded-xl mt-6 transition-all duration-200 shadow-sm mx-auto flex items-center space-x-2 border ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-200' 
                    : 'bg-white/40 border border-white/50 hover:bg-white/60 text-slate-750'
                }`}
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Sparkle star */}
      <svg 
        className={`absolute bottom-6 right-[4%] h-12 w-12 animate-pulse pointer-events-none transition-colors duration-300 ${
          isDark ? 'text-white/20' : 'text-indigo-400/20'
        }`}
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
      </svg>
    </div>
  );
};

export default JobListings;
