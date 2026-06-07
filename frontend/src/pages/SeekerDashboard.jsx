import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Calendar, FileText, Briefcase, ExternalLink, ShieldCheck, CheckCircle2, Clock, AlertCircle, MessageSquare, Phone, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSocketAlert } from '../context/SocketAlertContext';
const parseMeetingLink = (link) => {
  if (!link) return { timing: '', url: '' };
  // Regex to match "Interview Timing: [Timing] (Zoom Room link: [URL])"
  const match = link.match(/Interview Timing:\s*([^(\n|)]+)(?:\s*\(Zoom Room link:\s*([^)]+)\))?/);
  if (match) {
    return {
      timing: match[1].trim(),
      url: match[2] ? match[2].trim() : ''
    };
  }
  // Fallback for simple links or other formats
  if (link.startsWith('http') || link.includes('.')) {
    return { timing: 'Scheduled (Confirm details with recruiter)', url: link };
  }
  return { timing: link, url: '' };
};

const SeekerDashboard = () => {
  const { user, token, updateUserSkills } = useAuth();
  const { theme } = useTheme();
  const { triggerAlert } = useSocketAlert();
  const isDark = theme === 'dark';
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inquiries states
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);

  // Update Resume states
  const [updatingAppId, setUpdatingAppId] = useState(null);
  const [newResumeUrl, setNewResumeUrl] = useState('');
  const [isUpdatingResume, setIsUpdatingResume] = useState(false);

  // Invitation details toggle state
  const [activeInvitationAppId, setActiveInvitationAppId] = useState(null);

  // Profile Skills Stack states
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [isSavingSkills, setIsSavingSkills] = useState(false);

  // Sync skills when user object loads
  useEffect(() => {
    if (user?.skills) {
      setSkills(user.skills);
    }
  }, [user]);

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    const newSkills = skillInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !skills.includes(s));
    
    if (newSkills.length > 0) {
      setSkills((prev) => [...prev, ...newSkills]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSkillsSubmit = async (e) => {
    e.preventDefault();
    setIsSavingSkills(true);
    const result = await updateUserSkills(skills);
    setIsSavingSkills(false);
    if (result.success) {
      triggerAlert('Candidate tech stack skills profile updated successfully. Real-time data handshake synchronized.', 'Real-time Sync');
    } else {
      alert(result.error || 'Failed to update skills');
    }
  };

  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const res = await fetch('/api/applications/seeker/my-applications', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setApplications(data.data);
        }
      } catch (err) {
        console.error('Error fetching seeker applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyApplications();
  }, [token]);

  useEffect(() => {
    const fetchMyInquiries = async () => {
      try {
        const res = await fetch('/api/applications/inquiries/my-inquiries', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setInquiries(data.data);
        }
      } catch (err) {
        console.error('Error fetching seeker inquiries:', err);
      } finally {
        setLoadingInquiries(false);
      }
    };
    if (token) {
      fetchMyInquiries();
    }
  }, [token]);

  useEffect(() => {
    if (updatingAppId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [updatingAppId]);

  // Compute stat boxes
  const totalApps = applications.length;
  const pendingApps = applications.filter((app) => app.status === 'pending').length;
  const acceptedApps = applications.filter((app) => app.status === 'interview scheduled' || app.status === 'accepted').length;

  const getStatusStyles = (status) => {
    switch (status) {
      case 'accepted':
        return isDark 
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return isDark 
          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' 
          : 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return isDark 
          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
          : 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderTimeline = (status) => {
    const steps = ['Applied', 'Under Review', 'Interview', 'Decision'];
    let currentIndex = 0;
    let isTerminal = false; 
    let isRejected = status === 'rejected';

    if (status === 'under review') currentIndex = 1;
    else if (status === 'interview scheduled') currentIndex = 2;
    else if (status === 'accepted' || status === 'rejected') {
      currentIndex = 3;
      isTerminal = true;
    }

    return (
      <div className="w-full pt-4 pb-2">
        <div className="flex items-center justify-between relative max-w-md mx-auto">
          {/* Timeline connecting line */}
          <div className={`absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full z-0 ${
            isDark ? 'bg-slate-800' : 'bg-slate-100'
          }`}>
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isRejected && currentIndex === 3 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isActive = idx === currentIndex;
            
            let circleBg = isDark 
              ? 'bg-slate-900 border-2 border-slate-850 text-slate-500' 
              : 'bg-white border-2 border-slate-200 text-slate-400';
            let labelColor = isDark ? 'text-slate-500 font-bold' : 'text-slate-400 font-bold';

            if (isCompleted) {
              if (idx === 3 && isRejected) {
                circleBg = isDark 
                  ? 'bg-rose-500 border-2 border-rose-500 text-white shadow-md shadow-rose-950/20' 
                  : 'bg-rose-500 border-2 border-rose-500 text-white shadow-md shadow-rose-200';
                labelColor = 'text-rose-500 font-extrabold';
              } else if (idx === 3 && status === 'accepted') {
                circleBg = isDark 
                  ? 'bg-emerald-500 border-2 border-emerald-500 text-white shadow-md shadow-emerald-950/20' 
                  : 'bg-emerald-500 border-2 border-emerald-500 text-white shadow-md shadow-emerald-200';
                labelColor = 'text-emerald-550 dark:text-emerald-400 font-extrabold';
              } else {
                circleBg = isDark 
                  ? 'bg-primary-500 border-2 border-primary-500 text-white shadow-md shadow-primary-950/20' 
                  : 'bg-primary-500 border-2 border-primary-500 text-white shadow-md shadow-primary-100';
                labelColor = isDark ? 'text-primary-400 font-extrabold' : 'text-primary-750 font-extrabold';
              }
            } else if (isActive) {
              circleBg = isDark 
                ? 'bg-slate-900 border-2 border-primary-500 text-primary-400' 
                : 'bg-white border-2 border-primary-500 text-primary-600';
              labelColor = isDark ? 'text-primary-400 font-extrabold' : 'text-primary-600 font-extrabold';
            }

            let displayText = step;
            if (idx === 3) {
              if (status === 'accepted') displayText = 'Hired';
              else if (status === 'rejected') displayText = 'Declined';
              else displayText = 'Decision';
            }

            return (
              <div key={idx} className="flex flex-col items-center relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] ${circleBg} font-black`}>
                  {idx + 1}
                </div>
                <span className={`text-[10px] uppercase tracking-wider mt-1.5 ${labelColor}`}>
                  {displayText}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow relative z-10">
      {/* Welcome Title */}
      <div className="mb-8">
        <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Candidate <span className="gradient-text font-black">Dashboard</span>
        </h1>
        <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>
          Track and manage your submitted applications and hiring stages.
        </p>
      </div>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Summary Column */}
        <div className="col-span-1 space-y-6">
          {/* Profile Summary Card */}
          <div className={`p-6 rounded-2xl border space-y-6 transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.3)]' 
              : 'bg-white border-slate-200/60 text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)]'
          }`}>
            <div className={`text-center pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto font-extrabold text-xl shadow-inner ${
                isDark 
                  ? 'bg-primary-950/40 border border-primary-900/40 text-primary-400' 
                  : 'bg-primary-100/60 text-primary-600'
              }`}>
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <h2 className={`text-lg font-bold mt-3 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{user?.name}</h2>
              <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border mt-1 ${
                isDark 
                  ? 'bg-primary-950/40 border-primary-900/50 text-primary-300' 
                  : 'bg-primary-50 border-primary-150 text-primary-700'
              }`}>
                {user?.role}
              </span>
            </div>

            <div className={`space-y-3.5 text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <div className="flex items-center">
                <Mail className="h-4.5 w-4.5 mr-2.5 text-slate-405 text-slate-400 flex-shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4.5 w-4.5 mr-2.5 text-slate-405 text-slate-400 flex-shrink-0" />
                <span>Joined {formatDate(user?.createdAt || new Date())}</span>
              </div>
              <div className={`flex items-center ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <ShieldCheck className="h-4.5 w-4.5 mr-2.5 text-emerald-505 text-emerald-500 flex-shrink-0" />
                <span>Verified Account</span>
              </div>
            </div>
          </div>

          {/* Professional Profile & Tech Stack */}
          <div className={`p-6 rounded-2xl border space-y-5 transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.3)]' 
              : 'bg-white border-slate-200/60 text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)]'
          }`}>
            <h3 className={`text-sm font-extrabold border-b pb-2 ${isDark ? 'border-slate-800 text-slate-100' : 'border-slate-100 text-slate-800'}`}>
              Professional Profile & Tech Stack
            </h3>
            
            <form onSubmit={handleSkillsSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Core Skills / Technologies
                </label>
                
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-xl text-xs font-bold border transition-colors ${
                          isDark 
                            ? 'bg-primary-950/45 border-primary-900/40 text-primary-400' 
                            : 'bg-primary-50 border-primary-150 text-primary-700'
                        }`}
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-rose-500 font-extrabold text-[10px] ml-1.5 focus:outline-none cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic mb-3">No skills added yet.</p>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className={`flex-grow text-xs rounded-xl px-3 py-2 outline-none border transition-all ${
                      isDark 
                        ? 'bg-slate-850 border-slate-800 text-slate-200 focus:border-primary-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-850 focus:border-primary-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all hover:scale-102 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingSkills}
                className="w-full btn-primary text-xs py-2.5 rounded-xl shadow-md text-white font-bold flex items-center justify-center space-x-1 hover:scale-102 transition-all cursor-pointer"
              >
                {isSavingSkills ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Save Profile Skills</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Applications Breakdown */}
        <div className="col-span-1 lg:col-span-3 space-y-8">
          {/* Stat metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border text-center transition-all duration-300 ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-md' 
                : 'bg-white border-slate-150 text-slate-800 shadow-sm'
            }`}>
              <Briefcase className="h-6 w-6 text-slate-400 mx-auto mb-2" />
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-850 text-slate-800'}`}>{totalApps}</p>
              <p className={`text-[10px] font-bold uppercase mt-0.5 tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Total Applied</p>
            </div>
            <div className={`p-5 rounded-2xl border text-center transition-all duration-300 ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-md' 
                : 'bg-white border-slate-150 text-slate-800 shadow-sm'
            }`}>
              <Clock className="h-6 w-6 text-amber-500 mx-auto mb-2" />
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-850 text-slate-800'}`}>{pendingApps}</p>
              <p className={`text-[10px] font-bold uppercase mt-0.5 tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Pending Review</p>
            </div>
            <div className={`p-5 rounded-2xl border text-center transition-all duration-300 ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-md' 
                : 'bg-white border-slate-150 text-slate-800 shadow-sm'
            }`}>
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-850 text-slate-800'}`}>{acceptedApps}</p>
              <p className={`text-[10px] font-bold uppercase mt-0.5 tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Interviews/Offers</p>
            </div>
          </div>

          {/* History Applications */}
          <div className="space-y-6">
            <h3 className={`text-lg font-bold pl-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Applications</h3>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className={`h-32 rounded-3xl animate-pulse border ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}></div>
                ))}
              </div>
            ) : applications.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {applications.map((app) => (
                  <div key={app._id} className={`rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border ${
                    isDark 
                      ? 'bg-slate-900/90 border-slate-800 text-slate-100' 
                      : 'bg-white border-slate-200/60 text-slate-800'
                  }`}>
                    {/* Header: Title, Company, Date */}
                    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 ${
                      isDark ? 'border-slate-850' : 'border-slate-100'
                    }`}>
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <h4 className={`text-base font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            {app.job?.title || 'Technical Specialist'}
                          </h4>
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getStatusStyles(app.status)}`}>
                            {app.status === 'interview scheduled' ? 'Interview' : app.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2.5 text-xs text-slate-400 font-semibold mt-1">
                          <span>{app.job?.company || 'TalentHub Partner'}</span>
                          <span>•</span>
                          <span>{app.job?.location || 'Remote'}</span>
                          <span>•</span>
                          <span>Applied {formatDate(app.appliedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                        <a
                          href={`/${app.resumePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                            isDark 
                              ? 'text-primary-300 bg-primary-950/40 border-primary-900/60 hover:bg-primary-900/40' 
                              : 'text-primary-650 bg-primary-50/50 hover:bg-primary-50 border border-primary-100'
                          }`}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Resume PDF</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setUpdatingAppId(app._id);
                            setNewResumeUrl(app.resumePath || '');
                          }}
                          className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                            isDark 
                              ? 'text-slate-300 hover:text-slate-100 bg-slate-800 border-slate-700 hover:bg-slate-750' 
                              : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Update Resume</span>
                        </button>

                        {(app.status === 'interview scheduled' || app.status === 'accepted') && (
                          <button
                            onClick={() => {
                              setActiveInvitationAppId(activeInvitationAppId === app._id ? null : app._id);
                            }}
                            className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                              activeInvitationAppId === app._id
                                ? isDark
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                  : 'bg-primary-700 border-primary-700 text-white shadow-md'
                                : isDark
                                  ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20'
                                  : 'text-primary-700 bg-primary-50 border-primary-150 hover:bg-primary-100'
                            }`}
                          >
                            <span>
                              {activeInvitationAppId === app._id 
                                ? 'Hide Details' 
                                : app.status === 'accepted' ? 'View Invitation Details' : 'Message Employer'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Body: Timeline and AI Score */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 items-center">
                      {/* AI Match Score Card */}
                      <div className={`col-span-1 border rounded-2xl p-4 flex flex-col justify-center text-center ${
                        isDark ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50/50 border-slate-150'
                      }`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Resume Match Score</span>
                        <div className="my-2 flex items-center justify-center space-x-1.5">
                          <span className={`text-3xl font-black ${
                            (app.matchScore || 75) >= 85 ? 'text-emerald-500' : (app.matchScore || 75) >= 75 ? 'text-primary-500' : 'text-amber-500'
                          }`}>{app.matchScore || 75}%</span>
                        </div>
                        <p className={`text-[10px] font-semibold leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-450'}`}>
                          Your resume is a {app.matchScore || 75}% match for this position!
                        </p>
                      </div>

                      {/* Package Delivery Timeline */}
                      <div className="col-span-1 md:col-span-2 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 text-center md:text-left">Application Stage Timeline</span>
                        {renderTimeline(app.status)}
                      </div>
                    </div>

                    {/* Interview Link Banner */}
                    {app.status === 'interview scheduled' && app.meetingLink && (() => {
                      const { timing, url } = parseMeetingLink(app.meetingLink);
                      return (
                        <div className={`mt-2 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border ${
                          isDark 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-200' 
                            : 'bg-emerald-50/60 border-emerald-150 text-slate-800'
                        }`}>
                          <div>
                            <p className={`text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                              <Calendar className="h-4 w-4" />
                              <span>Interview Scheduled!</span>
                            </p>
                            {timing && (
                              <p className={`text-sm font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Timing: {timing}
                              </p>
                            )}
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              Please click below to join the live meeting room at the scheduled time.
                            </p>
                          </div>
                          {url && (
                            <a
                              href={url.startsWith('http') ? url : `https://${url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-center text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>Join Meeting</span>
                            </a>
                          )}
                        </div>
                      );
                    })()}

                    {/* Conditionally Rendered Sub-layout for Invitation Details */}
                    {activeInvitationAppId === app._id && (
                      <div className={`mt-4 p-4.5 rounded-2xl border space-y-3 animate-in slide-in-from-top duration-300 ${
                        isDark 
                          ? 'bg-slate-950/45 border-slate-800 text-slate-200' 
                          : 'bg-slate-50 border-slate-205 text-slate-800 shadow-inner-sm'
                      }`}>
                        <h5 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Employer Contact & Invitation Details</h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          {/* Corporate Hotline */}
                          {app.job?.hotline && (
                            <div className={`p-3 rounded-xl border flex items-center justify-between ${
                              isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-150'
                            }`}>
                              <div className="flex items-center space-x-2.5">
                                <Phone className="h-4 w-4 text-indigo-400" />
                                <div>
                                  <p className="text-[9px] uppercase font-bold text-slate-400">Recruiter Hotline</p>
                                  <p className="text-xs font-black">{app.job.hotline}</p>
                                </div>
                              </div>
                              <a 
                                href={`tel:${app.job.hotline}`}
                                className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all hover:scale-105 ${
                                  isDark 
                                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20' 
                                    : 'bg-indigo-50 border-indigo-205 text-indigo-700 hover:bg-indigo-100'
                                }`}
                              >
                                Call
                              </a>
                            </div>
                          )}

                          {/* Meeting Link / Query Response Platform */}
                          {app.meetingLink && (() => {
                            const { timing, url } = parseMeetingLink(app.meetingLink);
                            return (
                              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                                isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-150'
                              }`}>
                                <div className="flex items-center space-x-2.5 flex-grow min-w-0">
                                  <ExternalLink className="h-4 w-4 text-emerald-450 flex-shrink-0" />
                                  <div className="truncate">
                                    <p className="text-[9px] uppercase font-bold text-slate-450">Interview Platform</p>
                                    <p className="text-xs font-black truncate">{timing || 'Live Session'}</p>
                                  </div>
                                </div>
                                {url && (
                                  <a 
                                    href={url.startsWith('http') ? url : `https://${url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all hover:scale-105 flex-shrink-0 ml-2 ${
                                      isDark 
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20' 
                                        : 'bg-emerald-50 border-emerald-205 text-emerald-700 hover:bg-indigo-100'
                                    }`}
                                  >
                                    Join
                                  </a>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {!app.job?.hotline && !app.meetingLink && (
                          <p className="text-xs text-slate-400 italic">No additional contact details provided by the employer yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`rounded-3xl p-16 text-center max-w-xl mx-auto border shadow-sm ${
                isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200/60 text-slate-700'
              }`}>
                <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>No applications submitted yet</p>
                <p className={`text-xs mt-1 leading-relaxed max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-450'}`}>
                  Submit a resume to matching jobs and they'll show up here with live status updates.
                </p>
              </div>
            )}
          </div>

          {/* Queries Log / My Inquiries */}
          <div className="space-y-6 pt-6 border-t border-slate-200/50 dark:border-slate-800">
            <h3 className={`text-lg font-bold pl-1 flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <MessageSquare className="h-5 w-5 text-slate-400" />
              <span>My Inquiries</span>
            </h3>

            {loadingInquiries ? (
              <div className="space-y-4">
                <div className={`h-24 rounded-3xl animate-pulse border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}></div>
              </div>
            ) : inquiries.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {inquiries.map((inq) => (
                  <div key={inq._id} className={`rounded-3xl p-5 border shadow-sm transition-all ${
                    isDark 
                      ? 'bg-slate-900/90 border-slate-800 text-slate-100' 
                      : 'bg-white border-slate-200/65 text-slate-800 shadow-sm'
                  }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            inq.status === 'Resolved'
                              ? isDark ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-705 border-emerald-200'
                              : isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-705 border-amber-200'
                          }`}>
                            {inq.status}
                          </span>
                          <span className="text-xs text-slate-450 font-bold">•</span>
                          <span className="text-xs text-slate-450 font-semibold">{formatDate(inq.createdAt)}</span>
                        </div>
                        <h4 className={`text-sm font-extrabold mt-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          Inquiry about: {inq.job?.title || 'Technical Specialist'}
                        </h4>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">Company: {inq.companyName || 'TalentHub Partner'}</p>
                      </div>
                    </div>
                    <p className={`text-xs mt-3.5 leading-relaxed font-semibold p-3.5 rounded-2xl border ${
                      isDark ? 'bg-slate-800/40 border-slate-800/80 text-slate-300' : 'bg-slate-50/50 border-slate-150/50 text-slate-655'
                    }`}>
                      {inq.queryText}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`rounded-3xl p-10 text-center max-w-xl mx-auto border shadow-sm ${
                isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200/60 text-slate-700'
              }`}>
                <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-755'}`}>No inquiries submitted yet</p>
                <p className={`text-xs mt-1 leading-relaxed max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-450'}`}>
                  Have questions about job details or interview stages? Submit an inquiry directly from a job listing page!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Resume Modal */}
      {updatingAppId && (
        <div className="fixed inset-0 z-55 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-fade-in p-4 flex justify-center items-start pt-10 pb-10">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl relative border animate-in fade-in zoom-in-95 duration-200 transition-all ${
            isDark 
              ? 'bg-slate-900 border-white/10 text-slate-100' 
              : 'bg-white border-slate-200 text-slate-800 shadow-xl'
          }`}>
            <button
              onClick={() => setUpdatingAppId(null)}
              className={`absolute top-4 right-4 p-1 rounded-full transition-colors border ${
                isDark 
                  ? 'text-slate-400 hover:text-slate-200 bg-slate-800 border-slate-700 hover:bg-slate-750' 
                  : 'text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-lg font-bold">Update Resume Link</h3>
              <p className="text-xs text-slate-400 mt-1">Simulate updating your application's resume document link in the database.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Resume Path / URL</label>
                <input
                  type="text"
                  value={newResumeUrl}
                  onChange={(e) => setNewResumeUrl(e.target.value)}
                  placeholder="uploads/my_new_resume.pdf"
                  className={`w-full text-xs p-3 rounded-xl outline-none border transition-all ${
                    isDark 
                      ? 'bg-slate-850 border-slate-750 text-slate-105 focus:border-primary-500' 
                      : 'bg-white border-slate-200 text-slate-800 focus:border-primary-400'
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdatingAppId(null)}
                  className={`flex-grow py-2.5 text-xs font-bold border rounded-xl transition-all cursor-pointer text-center ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUpdatingResume}
                  onClick={async () => {
                    setIsUpdatingResume(true);
                    try {
                      const res = await fetch(`/api/applications/${updatingAppId}/resume`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ resumePath: newResumeUrl })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setApplications(prev => prev.map(app => app._id === updatingAppId ? { ...app, resumePath: newResumeUrl } : app));
                        triggerAlert('Resume document link updated successfully. Real-time data handshake synchronized.', 'Real-time Sync');
                        setUpdatingAppId(null);
                      } else {
                        alert(data.error || 'Failed to update resume');
                      }
                    } catch (err) {
                      console.error('Error updating resume:', err);
                    } finally {
                      setIsUpdatingResume(false);
                    }
                  }}
                  className="flex-grow btn-primary text-xs py-2.5 font-bold rounded-xl"
                >
                  {isUpdatingResume ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;
