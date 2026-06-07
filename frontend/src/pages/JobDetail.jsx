import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, DollarSign, Clock, Building2, Briefcase, ChevronLeft, Send, CheckCircle2, FileText, X, Phone, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSocketAlert } from '../context/SocketAlertContext';

const JobDetail = () => {
  const { id } = useParams();
  const { user, token, isAuthenticated, isSeeker } = useAuth();
  const { theme } = useTheme();
  const { triggerAlert } = useSocketAlert();
  const isDark = theme === 'dark';

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  // Apply Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Google Form-like candidate details states
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  // Inquiry states
  const [inquiryText, setInquiryText] = useState('');
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);
  const [inquiryStatusMsg, setInquiryStatusMsg] = useState({ type: '', text: '' });

  // Prefill details once user data is loaded
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Fetch job details and check if applied
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        if (data.success) {
          setJob(data.data);
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
      } finally {
        setLoading(false);
      }
    };

    const checkIfApplied = async () => {
      if (!token || !isSeeker) return;
      try {
        const res = await fetch('/api/applications/seeker/my-applications', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          const applied = data.data.some((app) => app.job._id === id);
          setHasApplied(applied);
        }
      } catch (err) {
        console.error('Error checking application status:', err);
      }
    };

    fetchJobDetails();
    checkIfApplied();
  }, [id, token, isSeeker]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
    if (submitError) setSubmitError(null);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!resume) {
      setSubmitError('Please select a resume file');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append('jobId', id);
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
        triggerAlert(`Application for ${job.title} at ${job.company} submitted successfully. Real-time data handshake synchronized.`, 'Real-time Sync');
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
          setCoverLetter('');
          setResume(null);
          setPhone('');
        }, 2500);
      } else {
        setSubmitError(data.error || 'Submission failed');
      }
    } catch (err) {
      setSubmitError('Server connectivity error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow py-24">
        <div className={`w-12 h-12 rounded-full border-4 animate-spin ${
          isDark ? 'border-slate-800 border-t-primary-500' : 'border-slate-100 border-t-primary-500'
        }`}></div>
        <p className={`mt-4 text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading position details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center flex-grow flex flex-col justify-center">
        <h2 className={`text-xl font-bold ${isDark ? 'text-slate-350' : 'text-slate-700'}`}>Listing Not Found</h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>This job might have been removed or deactivated.</p>
        <Link to="/jobs" className="btn-primary mt-6 inline-flex items-center space-x-1 justify-center max-w-[160px] mx-auto">
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Jobs</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow relative z-10">
      {/* Back Button */}
      <Link 
        to="/jobs" 
        className={`inline-flex items-center space-x-1 text-sm font-bold mb-6 transition-colors ${
          isDark ? 'text-slate-200 hover:text-white' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Back to listings</span>
      </Link>

      <div className={`rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden border transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.3)]' 
          : 'bg-white border-slate-200/60 text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)]'
      }`}>
        {/* Decorative corner stripe */}
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl pointer-events-none ${
          isDark ? 'from-primary-500/10' : 'from-primary-500/5'
        } to-transparent`}></div>

        {/* Top Details Block */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b transition-colors ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="space-y-3">
            <span className={`px-3 py-1 border rounded-full text-xs font-bold uppercase tracking-wider ${
              isDark 
                ? 'bg-primary-950/40 border-primary-900/65 text-primary-300' 
                : 'bg-primary-50 border-primary-150 text-primary-700'
            }`}>
              {job.type}
            </span>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {job.title}
            </h1>
            <div className={`flex flex-wrap items-center gap-4 text-sm font-semibold transition-colors ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span className="flex items-center">
                <Building2 className="h-4.5 w-4.5 mr-1.5 text-slate-400" />
                {job.company}
              </span>
              <span className="flex items-center">
                <MapPin className="h-4.5 w-4.5 mr-1.5 text-slate-400" />
                {job.location}
              </span>
              <span className="flex items-center">
                <DollarSign className="h-4.5 w-4.5 mr-0.5 text-slate-400" />
                {job.salary}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full md:w-auto">
            {hasApplied ? (
              <div className={`w-full md:w-auto flex items-center justify-center space-x-2 border font-bold px-8 py-3.5 rounded-xl text-sm cursor-default ${
                isDark 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                <CheckCircle2 className="h-5 w-5" />
                <span>Application Submitted</span>
              </div>
            ) : isSeeker || !isAuthenticated ? (
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setIsModalOpen(true);
                  } else {
                    window.location.href = `/login?redirect=/jobs/${id}`;
                  }
                }}
                className="w-full md:w-auto btn-primary py-3.5 px-8 text-sm flex items-center justify-center space-x-2 shadow-md"
              >
                <Send className="h-4.5 w-4.5" />
                <span>{isAuthenticated ? 'Apply Now' : 'Sign in to Apply'}</span>
              </button>
            ) : (
              <div className={`text-xs font-bold px-5 py-3 rounded-xl max-w-sm text-center border ${
                isDark 
                  ? 'text-slate-400 border-slate-800 bg-slate-850/60' 
                  : 'text-slate-400 border-slate-200 bg-slate-50'
              }`}>
                Employer account logged in
              </div>
            )}
          </div>
        </div>

        {/* Specs breakdown */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Description */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className={`text-lg font-bold mb-3 uppercase tracking-wider text-xs ${
                isDark ? 'text-slate-350' : 'text-slate-500'
              }`}>
                Job Description
              </h2>
              <div className={`text-sm leading-relaxed whitespace-pre-line font-medium transition-colors ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {job.description}
              </div>
            </div>

            {/* Hotline support */}
            {job.hotline && (
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
                    <p className="text-xs font-black">{job.hotline}</p>
                  </div>
                </div>
                <a 
                  href={`tel:${job.hotline}`}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all hover:scale-105 ${
                    isDark 
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20' 
                      : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
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
                          jobId: job._id,
                          companyName: job.company,
                          queryText: inquiryText
                        })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setInquiryText('');
                        setInquiryStatusMsg({ type: 'success', text: 'Inquiry submitted successfully! Track it in your dashboard.' });
                        triggerAlert(`New Inquiry submitted for ${job.title} at ${job.company}`, 'Inquiry Alert');
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
                      ? 'bg-slate-400/10 text-slate-455 border border-slate-300/15 cursor-not-allowed'
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

          {/* Sidebar Requirements */}
          <div className={`rounded-2xl p-6 h-fit space-y-5 border transition-colors duration-300 ${
            isDark 
              ? 'bg-slate-950/20 border-slate-800/80' 
              : 'bg-slate-50/50 border-slate-150/60'
          }`}>
            <h2 className={`text-sm font-extrabold uppercase tracking-wider flex items-center ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <Briefcase className="h-4 w-4 mr-2 text-slate-400" />
              <span>Key Requirements</span>
            </h2>
            {job.requirements && job.requirements.length > 0 ? (
              <ul className="space-y-2.5">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className={`flex items-start text-xs font-semibold leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 mr-2.5 flex-shrink-0"></span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No specific requirements mentioned.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-55 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-fade-in p-4 flex justify-center items-start pt-10 pb-10">
          <div className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl relative border transition-all duration-300 ${
            isDark 
              ? 'glassmorphism border-white/10' 
              : 'bg-white border-slate-200 shadow-xl'
          }`}>
            <button
              onClick={() => setIsModalOpen(false)}
              className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors border ${
                isDark 
                  ? 'text-slate-400 hover:text-slate-200 bg-slate-800 border-slate-700 hover:bg-slate-750' 
                  : 'text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h3 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                Apply to {job.company}
              </h3>
              <p className={`text-xs font-semibold mt-1 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-505 text-slate-500'}`}>
                Position: {job.title}
              </p>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className={`inline-flex p-3 rounded-full border mb-2 ${
                  isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                }`}>
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Application Submitted!</h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Confirmation email has been logged to your inbox. Closing form...
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-5">
                {submitError && (
                  <div className="bg-rose-50 border border-rose-105 text-rose-700 p-4 rounded-xl text-sm font-medium">
                    {submitError}
                  </div>
                )}

                {/* Candidate Name */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-350' : 'text-slate-500'}`}>
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full p-3 border rounded-xl text-sm outline-none transition-all duration-200 ${
                      isDark 
                        ? 'bg-slate-850/80 border-slate-700 focus:border-primary-500 text-slate-100 placeholder-slate-500' 
                        : 'bg-slate-50/70 border-slate-200 focus:border-primary-400 focus:bg-white text-slate-800 placeholder-slate-400'
                    }`}
                    placeholder="Jane Doe"
                    required
                  />
                </div>

                {/* Candidate Email and Phone grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-350' : 'text-slate-500'}`}>
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full p-3 border rounded-xl text-sm outline-none transition-all duration-200 ${
                        isDark 
                          ? 'bg-slate-850/80 border-slate-700 focus:border-primary-500 text-slate-100 placeholder-slate-500' 
                          : 'bg-slate-50/70 border-slate-200 focus:border-primary-400 focus:bg-white text-slate-800 placeholder-slate-400'
                      }`}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-350' : 'text-slate-500'}`}>
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full p-3 border rounded-xl text-sm outline-none transition-all duration-200 ${
                        isDark 
                          ? 'bg-slate-850/80 border-slate-700 focus:border-primary-500 text-slate-100 placeholder-slate-500' 
                          : 'bg-slate-50/70 border-slate-200 focus:border-primary-400 focus:bg-white text-slate-800 placeholder-slate-400'
                      }`}
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                </div>

                {/* Resume upload */}
                <div className="space-y-2">
                  <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-350' : 'text-slate-500'}`}>
                    Upload Resume <span className="text-rose-500">*</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 relative group ${
                    isDark 
                      ? 'border-slate-700 hover:border-primary-500 bg-slate-850/40 hover:bg-slate-800/40' 
                      : 'border-slate-200 hover:border-primary-400 bg-slate-50/50 hover:bg-white'
                  }`}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <FileText className="h-8 w-8 text-slate-400 group-hover:text-primary-500 mx-auto mb-2 transition-colors" />
                    <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {resume ? resume.name : 'Choose file or drag & drop'}
                    </p>
                    <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      PDF, DOC, or DOCX formats only (Max. 5MB)
                    </p>
                  </div>
                </div>

                {/* Cover letter */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-350' : 'text-slate-500'}`}>
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className={`w-full p-3 border rounded-xl text-sm outline-none transition-all duration-200 resize-none ${
                      isDark 
                        ? 'bg-slate-850/80 border-slate-700 focus:border-primary-500 text-slate-100 placeholder-slate-500' 
                        : 'bg-slate-50/70 border-slate-200 focus:border-primary-400 focus:bg-white text-slate-800 placeholder-slate-400'
                    }`}
                    placeholder="Briefly state why you're a great fit for this position..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`flex-grow py-3 text-sm font-bold border rounded-xl transition-all cursor-pointer text-center ${
                      isDark 
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600' 
                        : 'btn-secondary'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-grow btn-primary py-3 text-sm flex items-center justify-center space-x-2 shadow-md shadow-primary-500/10"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
