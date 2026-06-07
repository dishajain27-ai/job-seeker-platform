import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Calendar, FileText, Briefcase, Plus, Users, Check, X, ShieldCheck, ChevronDown, ChevronUp, AlertCircle, ExternalLink, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSocketAlert } from '../context/SocketAlertContext';

const EmployerDashboard = () => {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const { triggerAlert } = useSocketAlert();
  const isDark = theme === 'dark';
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Track applicants for active job IDs
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [expandedJobId, setExpandedJobId] = useState(null);
  
  // Meeting link inputs
  const [meetingLinks, setMeetingLinks] = useState({});

  // Recruiter Match Score and Timings
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [selectedTimings, setSelectedTimings] = useState({});
  const [allApplicants, setAllApplicants] = useState([]);
  const [viewingProfileApp, setViewingProfileApp] = useState(null);

  // Post Job modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    type: 'Full-time',
    salary: '',
    requirements: ''
  });
  const [postError, setPostError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShowInvoice = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Please allow popups to download/print the invoice.');
      return;
    }
    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - TalentHub Premium</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              color: #1e293b;
              padding: 40px;
              line-height: 1.5;
            }
            .invoice-box {
              max-width: 700px;
              margin: auto;
              border: 1px solid #e2e8f0;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: 800;
              color: #4f46e5;
            }
            .invoice-details {
              text-align: right;
            }
            .details-grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
            }
            .details-title {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              color: #64748b;
              letter-spacing: 0.05em;
              margin-bottom: 6px;
            }
            .details-val {
              font-size: 14px;
              font-weight: 600;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            th {
              background: #f8fafc;
              text-align: left;
              padding: 12px;
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
            }
            td {
              padding: 16px 12px;
              border-bottom: 1px solid #f1f5f9;
              font-size: 14px;
            }
            .totals {
              width: 50%;
              margin-left: auto;
              margin-top: 20px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              font-size: 14px;
            }
            .grand-total {
              font-size: 18px;
              font-weight: 800;
              border-top: 2px solid #e2e8f0;
              padding-top: 12px;
              color: #0f172a;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #94a3b8;
              margin-top: 60px;
              border-top: 1px solid #f1f5f9;
              padding-top: 20px;
            }
            .badge {
              display: inline-block;
              padding: 4px 10px;
              background: #ecfdf5;
              color: #047857;
              font-size: 11px;
              font-weight: 700;
              border-radius: 9999px;
              border: 1px solid #a7f3d0;
            }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
              .invoice-box { border: none; box-shadow: none; padding: 0; }
            }
            .print-btn {
              display: inline-block;
              background: #4f46e5;
              color: white;
              padding: 10px 20px;
              font-size: 13px;
              font-weight: 700;
              border-radius: 8px;
              text-decoration: none;
              cursor: pointer;
              border: none;
              margin-bottom: 20px;
            }
            .print-btn:hover {
              background: #4338ca;
            }
          </style>
        </head>
        <body>
          <div style="max-width: 700px; margin: auto;" class="no-print">
            <button class="print-btn" onclick="window.print()">Print Invoice PDF</button>
          </div>
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="logo">TalentHub</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Premium Talent Acquisition Ecosystem</div>
              </div>
              <div class="invoice-details">
                <h2 style="margin: 0; font-size: 20px; font-weight: 800;">INVOICE</h2>
                <div style="font-size: 13px; color: #64748b; margin-top: 4px;">#INV-2026-0892</div>
              </div>
            </div>

            <div class="details-grid">
              <div>
                <div class="details-title">Billed By</div>
                <div class="details-val">TalentHub Technologies Pvt. Ltd.</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                  Outer Ring Road, Bellandur<br/>
                  Bangalore, KA 560103<br/>
                  GSTIN: 29AAFCT9082M1Z0
                </div>
              </div>
              <div>
                <div class="details-title">Billed To</div>
                <div class="details-val">${user?.name || 'Recruiter'}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                  Role: Employer / Recruiter<br/>
                  Email: ${user?.email || 'employer@talenthub.com'}<br/>
                  Date: June 06, 2026
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>TalentHub Recruiter Premium Plan</strong><br/>
                    <span style="font-size: 11px; color: #64748b;">Annual subscription for unlimited vacancy postings, sourcing directory lookups, AI match screening, and candidate pipeline tracking.</span>
                  </td>
                  <td style="text-align: right; vertical-align: top;">₹14,999.00</td>
                  <td style="text-align: right; vertical-align: top; font-weight: 600;">₹14,999.00</td>
                </tr>
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row">
                <span style="color: #64748b;">Subtotal:</span>
                <span>₹14,999.00</span>
              </div>
              <div class="total-row">
                <span style="color: #64748b;">IGST (18%):</span>
                <span>₹2,699.82</span>
              </div>
              <div class="total-row grand-total">
                <span>Total Due:</span>
                <span>₹17,698.82</span>
              </div>
              <div class="total-row" style="margin-top: 15px;">
                <span style="color: #64748b;">Payment Status:</span>
                <div><span class="badge">PAID / SUCCESS</span></div>
              </div>
            </div>

            <div class="footer">
              Thank you for partner-sourcing with TalentHub! For any queries regarding this transaction, contact support@talenthub.co.
            </div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  // Fetch all applicants for all jobs owned by the employer
  const fetchAllApplicants = async () => {
    try {
      const res = await fetch('/api/employer/applicants', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setAllApplicants(data.data);
      }
    } catch (err) {
      console.error('Error fetching all applicants:', err);
    }
  };

  // Fetch employer's jobs
  const fetchMyJobs = async () => {
    try {
      const res = await fetch('/api/jobs/employer/my-jobs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
        fetchAllApplicants();
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchMyJobs();
  }, [token]);

  useEffect(() => {
    if (isModalOpen || viewingProfileApp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen, viewingProfileApp]);

  // Fetch applicants for a job when expanded
  const fetchApplicants = async (jobId) => {
    try {
      const res = await fetch(`/api/applications/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setApplicantsByJob((prev) => ({
          ...prev,
          [jobId]: data.data
        }));
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
    }
  };

  const handleToggleExpand = (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
      if (!applicantsByJob[jobId]) {
        fetchApplicants(jobId);
      }
    }
  };

  // Update status (Accept / Reject / Interview candidate)
  const handleUpdateStatus = async (appId, jobId, newStatus, meetingLink = '') => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, meetingLink })
      });
      const data = await res.json();
      if (data.success) {
        // Refetch applicants for expanded job if relevant
        if (jobId) {
          fetchApplicants(jobId);
        }
        // Refetch all jobs and compiled applicants to keep everything in sync
        fetchMyJobs();
        triggerAlert(`Application status updated to '${newStatus}' successfully. Real-time data handshake synchronized.`, 'Real-time Sync');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const { title, company, description, location, type, salary, requirements } = formData;
    if (!title || !company || !description || !location || !salary) {
      setPostError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setPostError(null);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          company,
          description,
          location,
          type,
          salary,
          requirements
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          company: '',
          description: '',
          location: '',
          type: 'Full-time',
          salary: '',
          requirements: ''
        });
        fetchMyJobs(); // refetch jobs
        triggerAlert(`Job listing '${title}' posted successfully. Real-time data handshake synchronized.`, 'Real-time Sync');
      } else {
        setPostError(data.error || 'Failed to post job');
      }
    } catch (err) {
      setPostError('Network connection error. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow relative z-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Employer <span className="gradient-text font-black">Dashboard</span>
          </h1>
          <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>
            Post vacancies, manage active listings, and review candidate applications.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary py-3 px-6 flex items-center space-x-2 text-sm shadow-md"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Post a New Job</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Profile card */}
        <div className="col-span-1">
          <div className={`p-6 rounded-2xl border space-y-6 transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.3)]' 
              : 'bg-white border-slate-200/50 text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)]'
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
                  ? 'bg-accent-950/40 border-accent-900/50 text-accent-300' 
                  : 'bg-accent-50 border-accent-150 text-accent-700'
              }`}>
                {user?.role}
              </span>
            </div>

            <div className={`space-y-3.5 text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <div className="flex items-center">
                <Mail className="h-4.5 w-4.5 mr-2.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4.5 w-4.5 mr-2.5 text-slate-400 flex-shrink-0" />
                <span>Joined {formatDate(user?.createdAt || new Date())}</span>
              </div>
              <div className={`flex items-center ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <ShieldCheck className="h-4.5 w-4.5 mr-2.5 text-emerald-500 flex-shrink-0" />
                <span>Verified Employer</span>
              </div>
            </div>
          </div>

          {/* Billing Summary Card */}
          <div className={`mt-6 p-6 rounded-2xl border space-y-4 transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.3)]' 
              : 'bg-white border-slate-200/50 text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)]'
          }`}>
            <h3 className={`text-sm font-extrabold border-b pb-2 ${isDark ? 'border-slate-800 text-slate-100' : 'border-slate-100 text-slate-800'}`}>
              Billing & Subscription
            </h3>
            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Plan:</span>
                <span className="gradient-text font-black">TalentHub Premium</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-500 flex items-center gap-1 font-bold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Next Billing:</span>
                <span>July 6, 2026</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Amount:</span>
                <span>₹14,999 / year</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShowInvoice}
              className="w-full btn-primary text-xs py-2.5 rounded-xl shadow-md text-white font-bold flex items-center justify-center space-x-1.5 hover:scale-102 transition-all cursor-pointer mt-2"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Download Latest Invoice (PDF)</span>
            </button>
          </div>
        </div>

        {/* Postings listing */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Your Active Postings</h3>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className={`h-20 rounded-2xl animate-pulse border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}></div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => {
                const isExpanded = expandedJobId === job._id;
                const rawApplicants = applicantsByJob[job._id] || [];
                const jobApplicants = rawApplicants.filter(app => (app.matchScore || 75) >= minMatchScore);
                return (
                  <div key={job._id} className={`rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${
                    isDark 
                      ? 'bg-slate-900/90 border-slate-800 text-slate-100' 
                      : 'bg-white border-slate-200/60 text-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]'
                  }`}>
                    {/* Collapsible main header */}
                    <div
                      onClick={() => handleToggleExpand(job._id)}
                      className={`p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer select-none transition-colors ${
                        isDark ? 'hover:bg-slate-800/25' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <h4 className={`text-base font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{job.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-semibold mt-1">
                          <span>{job.company}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.type}</span>
                          <span>•</span>
                          <span className={`${isDark ? 'text-primary-400' : 'text-primary-600'}`}>{job.salary}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                        <div className={`flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg border ${
                          isDark ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-500 bg-slate-100 border-slate-200'
                        }`}>
                          <Users className="h-4 w-4" />
                          <span>View Applicants</span>
                        </div>
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                      </div>
                    </div>

                    {/* Applicants collapse section */}
                    {isExpanded && (
                      <div className={`p-5 sm:p-6 space-y-4 animate-in slide-in-from-top-3 duration-250 border-t ${
                        isDark ? 'bg-slate-950/45 border-slate-850' : 'bg-slate-50/40 border-slate-100'
                      }`}>
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Applicants For This Role</h5>

                        {/* Match-Score Filter Slider */}
                        {rawApplicants.length > 0 && (
                          <div className={`p-4 mb-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                            isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <div className="flex-grow">
                              <label htmlFor={`min-match-${job._id}`} className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                Filter by Minimum Match Score: <span className="gradient-text font-black text-sm">{minMatchScore}%</span>
                              </label>
                              <input
                                id={`min-match-${job._id}`}
                                type="range"
                                min="0"
                                max="100"
                                value={minMatchScore}
                                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-800 accent-primary-500 focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setMinMatchScore(0)}
                              className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                                isDark 
                                  ? 'text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60' 
                                  : 'text-slate-550 border-slate-200 hover:text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              Reset Filter
                            </button>
                          </div>
                        )}

                        {rawApplicants.length > 0 ? (
                          jobApplicants.length > 0 ? (
                            <div className="space-y-3.5">
                              {jobApplicants.map((app) => (
                                <div key={app._id} className={`rounded-xl p-5 flex flex-col gap-4 border transition-colors ${
                                  isDark 
                                    ? 'bg-slate-900/80 border-slate-800 text-slate-100 shadow-md' 
                                    : 'bg-white border-slate-150 text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.015)]'
                                }`}>
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                        <button
                                          type="button"
                                          onClick={() => setViewingProfileApp(app)}
                                          className={`font-bold text-sm hover:underline cursor-pointer flex items-center space-x-1 ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-650 hover:text-indigo-750'}`}
                                        >
                                          <span>{app.seeker?.name || app.fullName}</span>
                                          <User className="h-3.5 w-3.5 inline-block" />
                                        </button>
                                        <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-650'}`}>
                                          applied for your '{job.title}' position
                                        </span>
                                      </div>
                                      {app.coverLetter && (
                                        <p className={`text-xs p-2.5 rounded-lg border font-medium max-w-xl ${
                                          isDark ? 'text-slate-300 bg-slate-850/60 border-slate-800' : 'text-slate-500 bg-slate-50/50 border-slate-100'
                                        }`}>
                                          <span className="font-bold text-slate-600">Cover Letter: </span>
                                          "{app.coverLetter}"
                                        </p>
                                      )}
                                      <p className="text-[10px] text-slate-400 font-bold">Applied: {formatDate(app.appliedAt)}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                                      {/* AI Match Score Display */}
                                      <div className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border flex items-center space-x-1.5 ${
                                        isDark ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-500 bg-slate-100 border-slate-200'
                                      }`}>
                                        <span>Match Score:</span>
                                        <span className={`${
                                          (app.matchScore || 75) >= 85 ? 'text-emerald-500' : (app.matchScore || 75) >= 75 ? 'text-primary-500' : 'text-amber-500'
                                        } font-black`}>{app.matchScore || 75}%</span>
                                      </div>

                                      {/* Resume link */}
                                      <a
                                        href={`/${app.resumePath}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                                          isDark 
                                            ? 'text-primary-300 bg-primary-950/40 border-primary-900 hover:bg-primary-900/40' 
                                            : 'text-primary-650 hover:text-primary-750 bg-primary-50 border border-primary-100'
                                        }`}
                                      >
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>Resume</span>
                                        <ExternalLink className="h-3 w-3" />
                                      </a>

                                      {/* One-Click Quick Actions */}
                                      {app.status !== 'interview scheduled' && app.status !== 'accepted' && app.status !== 'rejected' && (
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateStatus(app._id, job._id, 'interview scheduled', '')}
                                          className={`text-xs font-bold px-3 py-2 rounded-xl border flex items-center space-x-1 transition-all hover:scale-102 cursor-pointer ${
                                            isDark
                                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                                              : 'bg-emerald-50 border-emerald-150 text-emerald-700 hover:bg-emerald-100'
                                          }`}
                                        >
                                          <Check className="h-3.5 w-3.5" />
                                          <span>Shortlist Candidate</span>
                                        </button>
                                      )}
                                      
                                      {app.status !== 'rejected' && (
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateStatus(app._id, job._id, 'rejected', '')}
                                          className={`text-xs font-bold px-3 py-2 rounded-xl border flex items-center space-x-1 transition-all hover:scale-102 cursor-pointer ${
                                            isDark
                                              ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                                              : 'bg-rose-50 border-rose-150 text-rose-705 hover:bg-rose-100'
                                          }`}
                                        >
                                          <X className="h-3.5 w-3.5" />
                                          <span>Reject</span>
                                        </button>
                                      )}

                                      {/* Status Switcher Dropdown */}
                                      <div className="flex items-center space-x-2">
                                        <label htmlFor={`status-select-${app._id}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</label>
                                        <select
                                          id={`status-select-${app._id}`}
                                          value={app.status}
                                          onChange={(e) => {
                                            const nextStatus = e.target.value;
                                            if (nextStatus !== 'interview scheduled') {
                                              handleUpdateStatus(app._id, job._id, nextStatus, '');
                                            } else {
                                              handleUpdateStatus(app._id, job._id, nextStatus, meetingLinks[app._id] || app.meetingLink || '');
                                            }
                                          }}
                                          className={`text-xs font-bold rounded-xl p-2 focus:outline-none cursor-pointer border ${
                                            isDark 
                                              ? 'text-slate-200 bg-slate-800 border-slate-700 focus:border-primary-500' 
                                              : 'text-slate-700 bg-white border-slate-200 focus:border-primary-500'
                                          }`}
                                        >
                                          <option value="pending">Applied</option>
                                          <option value="under review">Under Review</option>
                                          <option value="interview scheduled">Interview Scheduled</option>
                                          <option value="accepted">Accepted / Hired</option>
                                          <option value="rejected">Rejected</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Quick Schedule Interview Dropdown Panel */}
                                  {app.status === 'interview scheduled' && (() => {
                                    const currentLinkVal = meetingLinks[app._id] !== undefined ? meetingLinks[app._id] : app.meetingLink || '';
                                    let defaultTiming = "Monday, 11:00 AM";
                                    let defaultUrl = "https://zoom.us/j/9876543210";
                                    
                                    if (currentLinkVal) {
                                      const match = currentLinkVal.match(/Interview Timing:\s*([^(\n|)]+)(?:\s*\(Zoom Room link:\s*([^)]+)\))?/);
                                      if (match) {
                                        defaultTiming = match[1].trim();
                                        if (match[2]) {
                                          defaultUrl = match[2].trim();
                                        }
                                      } else if (currentLinkVal.startsWith('http')) {
                                        defaultUrl = currentLinkVal;
                                      }
                                    }

                                    const selectedTiming = selectedTimings[app._id] || defaultTiming;
                                    const zoomUrl = meetingLinks[app._id] !== undefined ? meetingLinks[app._id] : defaultUrl;

                                    return (
                                      <div className={`w-full p-5 rounded-2xl border space-y-4 animate-in slide-in-from-top-2 duration-200 mt-2 ${
                                        isDark 
                                          ? 'bg-slate-950/60 border-slate-800' 
                                          : 'bg-slate-50 border-slate-200'
                                      }`}>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                          {/* Timing dropdown */}
                                          <div className="flex-1">
                                            <label htmlFor={`timing-select-${app._id}`} className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-550'}`}>
                                              Select Interview Timing
                                            </label>
                                            <select
                                              id={`timing-select-${app._id}`}
                                              value={selectedTiming}
                                              onChange={(e) => setSelectedTimings({
                                                ...selectedTimings,
                                                [app._id]: e.target.value
                                              })}
                                              className={`w-full text-xs font-semibold p-2.5 rounded-xl outline-none cursor-pointer border transition-all ${
                                                isDark 
                                                  ? 'bg-slate-850 border-slate-750 text-slate-100 focus:border-primary-500' 
                                                  : 'bg-white border-slate-200 text-slate-800 focus:border-primary-400'
                                              }`}
                                            >
                                              <option value="Monday, 11:00 AM">Monday, 11:00 AM</option>
                                              <option value="Tuesday, 2:00 PM">Tuesday, 2:00 PM</option>
                                              <option value="Wednesday, 3:30 PM">Wednesday, 3:30 PM</option>
                                              <option value="Thursday, 10:00 AM">Thursday, 10:00 AM</option>
                                              <option value="Friday, 4:00 PM">Friday, 4:00 PM</option>
                                            </select>
                                          </div>

                                          {/* Zoom link field */}
                                          <div className="flex-1">
                                            <label htmlFor={`zoom-link-${app._id}`} className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-550'}`}>
                                              Zoom / Google Meet URL
                                            </label>
                                            <input
                                              id={`zoom-link-${app._id}`}
                                              type="url"
                                              placeholder="https://zoom.us/j/9876543210"
                                              value={zoomUrl}
                                              onChange={(e) => setMeetingLinks({
                                                ...meetingLinks,
                                                [app._id]: e.target.value
                                              })}
                                              className={`w-full text-xs p-2.5 rounded-xl outline-none border transition-all ${
                                                isDark 
                                                  ? 'bg-slate-850 border-slate-750 text-slate-100 focus:border-primary-500' 
                                                  : 'bg-white border-slate-200 text-slate-800 focus:border-primary-400'
                                              }`}
                                            />
                                          </div>
                                        </div>

                                        <div className="flex justify-end gap-2.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              // Reset status back to under review
                                              handleUpdateStatus(app._id, job._id, 'under review', '');
                                            }}
                                            className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                                              isDark 
                                                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750' 
                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}
                                          >
                                            Cancel Selection
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const finalTiming = selectedTiming;
                                              let finalUrl = zoomUrl.trim();
                                              if (!finalUrl) {
                                                finalUrl = "https://zoom.us/j/9876543210";
                                              }
                                              // Construct structured string
                                              const structuredString = `Interview Timing: ${finalTiming} (Zoom Room link: ${finalUrl})`;
                                              handleUpdateStatus(app._id, job._id, 'interview scheduled', structuredString);
                                              triggerAlert(`Interview scheduled for ${finalTiming} successfully. Candidate notified.`, 'Interview Scheduled');
                                            }}
                                            className="btn-primary text-xs py-2 px-4.5 font-bold rounded-xl cursor-pointer"
                                          >
                                            Save & Send Invitation
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className={`text-xs italic py-4 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              No candidates meet the minimum match score of {minMatchScore}%.
                            </p>
                          )
                        ) : (
                          <p className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            No candidates have applied to this posting yet.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`rounded-2xl p-16 text-center border shadow-sm ${
              isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-150 text-slate-700'
            }`}>
              <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>No active job listings found</p>
              <p className={`text-sm mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>You haven't posted any positions yet. Click "Post a New Job" to begin.</p>
            </div>
          )}

          {/* Review Incoming Candidates Grid Panel */}
          <div className="space-y-4 pt-6 border-t border-slate-200/50 dark:border-slate-800 mt-8">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Review Incoming Candidates</h3>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className={`h-20 rounded-2xl animate-pulse border ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-100'
                  }`}></div>
                ))}
              </div>
            ) : allApplicants.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {allApplicants.map((app) => (
                  <div key={app._id} className={`rounded-2xl p-5 border transition-all duration-300 ${
                    isDark 
                      ? 'bg-slate-900/90 border-slate-800 text-slate-100' 
                      : 'bg-white border-slate-200/60 text-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]'
                  }`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      {/* Left info */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                          <button
                            type="button"
                            onClick={() => setViewingProfileApp(app)}
                            className={`font-bold text-sm hover:underline cursor-pointer flex items-center space-x-1 ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-650 hover:text-indigo-755'}`}
                          >
                            <span>{app.seeker?.name || app.fullName}</span>
                            <User className="h-3.5 w-3.5 inline-block" />
                          </button>
                          <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-650'}`}>
                            applied for your '{app.job?.title}' position
                          </span>
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                            app.status === 'accepted'
                              ? isDark ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200 text-emerald-750'
                              : app.status === 'rejected'
                              ? isDark ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-rose-50 border-rose-200 text-rose-750'
                              : isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-50 border-amber-200 text-amber-750'
                          }`}>
                            {app.status === 'interview scheduled' ? 'Interview' : app.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-semibold mt-1">
                          <span>Email: {app.seeker?.email || app.email}</span>
                          <span>•</span>
                          <span>Applied: {formatDate(app.appliedAt)}</span>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                        {/* Match Score Display */}
                        <div className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border flex items-center space-x-1.5 ${
                          isDark ? 'text-slate-350 bg-slate-800 border-slate-700' : 'text-slate-500 bg-slate-100 border-slate-200'
                        }`}>
                          <span>Match Score:</span>
                          <span className={`${
                            (app.matchScore || 75) >= 85 ? 'text-emerald-550' : (app.matchScore || 75) >= 75 ? 'text-primary-500' : 'text-amber-500'
                          } font-black`}>{app.matchScore || 75}%</span>
                        </div>

                        {/* State mutation controls */}
                        {app.status !== 'interview scheduled' && app.status !== 'accepted' && app.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => {
                              const defaultMeetingLink = "Interview Timing: Monday, 11:00 AM (Zoom Room link: https://zoom.us/j/9876543210)";
                              handleUpdateStatus(app._id, app.job?._id, 'interview scheduled', defaultMeetingLink);
                            }}
                            className="btn-primary text-xs py-2 px-4 font-bold rounded-xl cursor-pointer"
                          >
                            Approve / Move to Interview
                          </button>
                        )}

                        {app.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app._id, app.job?._id, 'rejected', '')}
                            className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                              isDark 
                                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750' 
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`rounded-2xl p-10 text-center border shadow-sm ${
                isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-150 text-slate-700'
              }`}>
                <p className="font-bold">No incoming candidates to review</p>
                <p className="text-xs text-slate-400 mt-1">Applicants for your postings will show up here for immediate review.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post a New Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-55 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-fade-in p-4 flex justify-center items-start pt-10 pb-10">
          <div className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl relative border animate-in fade-in zoom-in-95 duration-200 transition-all ${
            isDark 
              ? 'bg-slate-900 border-white/10 text-slate-100' 
              : 'bg-white border-slate-200 shadow-xl'
          }`}>
            <button
              onClick={() => setIsModalOpen(false)}
              className={`absolute top-4 right-4 p-1 rounded-full transition-colors border ${
                isDark 
                  ? 'text-slate-400 hover:text-slate-200 bg-slate-800 border-slate-700 hover:bg-slate-750' 
                  : 'text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h3 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Post a Job Opening</h3>
              <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Publish a vacancy to candidates on the board.</p>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-4">
              {postError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-sm font-medium">
                  {postError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl text-sm outline-none transition-all ${
                      isDark 
                        ? 'bg-slate-850/80 border-slate-700 focus:border-primary-500 text-slate-100 focus:bg-slate-800/80 placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-200 focus:border-primary-400 focus:bg-white text-slate-800 placeholder-slate-400'
                    }`}
                    placeholder="Software Engineer"
                    required
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Company Name *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl text-sm outline-none transition-all ${
                      isDark 
                        ? 'bg-slate-850/80 border-slate-700 focus:border-primary-500 text-slate-100 focus:bg-slate-800/80 placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-200 focus:border-primary-400 focus:bg-white text-slate-800 placeholder-slate-400'
                    }`}
                    placeholder="TalentHub Corp"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl text-sm outline-none transition-all ${
                      isDark 
                        ? 'bg-slate-850/80 border-slate-700 focus:border-primary-500 text-slate-100 focus:bg-slate-800/80 placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-200 focus:border-primary-400 focus:bg-white text-slate-800 placeholder-slate-400'
                    }`}
                    placeholder="New York, NY or Remote"
                    required
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Job Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-xl text-sm outline-none cursor-pointer font-medium transition-all ${
                      isDark 
                        ? 'bg-slate-850/80 border-slate-700 focus:border-primary-500 text-slate-100 focus:bg-slate-800/80' 
                        : 'bg-slate-50 border-slate-200 focus:border-primary-400 focus:bg-white text-slate-800'
                    }`}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Salary Range/Rate *</label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-xl text-sm outline-none transition-all ${
                    isDark 
                      ? 'bg-slate-850/80 border-slate-700 focus:border-primary-500 text-slate-100 focus:bg-slate-800/80 placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200 focus:border-primary-400 focus:bg-white text-slate-800 placeholder-slate-400'
                  }`}
                  placeholder="$110,000 - $140,000 / year"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Job Description *</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-xl text-sm outline-none resize-none transition-all ${
                    isDark 
                      ? 'bg-slate-850/80 border-slate-700 focus:border-primary-500 text-slate-100 focus:bg-slate-800/80 placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200 focus:border-primary-400 focus:bg-white text-slate-800 placeholder-slate-400'
                  }`}
                  placeholder="Describe the responsibilities and day-to-day operations..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Requirements (comma-separated)</label>
                <input
                  type="text"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-xl text-sm outline-none transition-all ${
                    isDark 
                      ? 'bg-slate-850/80 border-slate-700 focus:border-primary-500 text-slate-100 focus:bg-slate-800/80 placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200 focus:border-primary-400 focus:bg-white text-slate-800 placeholder-slate-400'
                  }`}
                  placeholder="React, Node.js, REST API, Git, 3+ years experience"
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
                  className="flex-grow btn-primary py-3 text-sm flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Post Job</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Candidate Profile Modal */}
      {viewingProfileApp && (
        <div className="fixed inset-0 z-55 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-fade-in p-4 flex justify-center items-start pt-10 pb-10">
          <div className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl relative border animate-in fade-in zoom-in-95 duration-200 transition-all ${
            isDark 
              ? 'bg-slate-900 border-white/10 text-slate-100' 
              : 'bg-white border-slate-200 text-slate-800 shadow-xl'
          }`}>
            <button
              onClick={() => setViewingProfileApp(null)}
              className={`absolute top-4 right-4 p-1 rounded-full transition-colors border ${
                isDark 
                  ? 'text-slate-400 hover:text-slate-200 bg-slate-800 border-slate-700 hover:bg-slate-750' 
                  : 'text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-inner ${
                isDark 
                  ? 'bg-primary-950/40 border border-primary-900/40 text-primary-400' 
                  : 'bg-primary-100/60 text-primary-600'
              }`}>
                {(viewingProfileApp.seeker?.name || viewingProfileApp.fullName).charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  {viewingProfileApp.seeker?.name || viewingProfileApp.fullName}
                </h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-550'}`}>
                  Candidate Profile Details
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Core Information */}
              <div className={`p-4.5 rounded-2xl border space-y-2.5 ${
                isDark ? 'bg-slate-950/45 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Email:</span>
                  <span className="font-semibold">{viewingProfileApp.seeker?.email || viewingProfileApp.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Phone:</span>
                  <span className="font-semibold">{viewingProfileApp.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Applied Position:</span>
                  <span className="font-semibold text-primary-500">{viewingProfileApp.job?.title || 'Job Posting'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Match Score:</span>
                  <span className={`font-black ${(viewingProfileApp.matchScore || 75) >= 85 ? 'text-emerald-500' : 'text-primary-500'}`}>
                    {viewingProfileApp.matchScore || 75}% Match
                  </span>
                </div>
              </div>

              {/* Technical Stack Tags */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Candidate Core Tech Stack</h4>
                {viewingProfileApp.seeker?.skills && viewingProfileApp.seeker.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {viewingProfileApp.seeker.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className={`inline-block px-3 py-1 rounded-xl text-xs font-bold border ${
                          isDark 
                            ? 'bg-indigo-950/40 border-indigo-900/40 text-indigo-400' 
                            : 'bg-indigo-50 border-indigo-150 text-indigo-700'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {/* Fallback skills if not defined */}
                    {['React', 'Javascript', 'HTML', 'CSS'].map((skill, idx) => (
                      <span
                        key={idx}
                        className={`inline-block px-3 py-1 rounded-xl text-xs font-bold border ${
                          isDark 
                            ? 'bg-slate-800 border-slate-700 text-slate-450' 
                            : 'bg-slate-105 border-slate-200 text-slate-500'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              {viewingProfileApp.coverLetter && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Cover Letter Introduction</h4>
                  <p className={`text-xs p-3.5 rounded-2xl border font-medium leading-relaxed ${
                    isDark ? 'bg-slate-850/60 border-slate-800 text-slate-300' : 'bg-slate-50/50 border-slate-150 text-slate-650'
                  }`}>
                    "{viewingProfileApp.coverLetter}"
                  </p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex gap-3 pt-3">
                <a
                  href={`/${viewingProfileApp.resumePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-grow inline-flex items-center justify-center space-x-2 text-xs font-bold py-3 px-4.5 rounded-xl border transition-all ${
                    isDark 
                      ? 'text-primary-300 bg-primary-950/40 border-primary-900/60 hover:bg-primary-900/40' 
                      : 'text-primary-650 bg-primary-50/50 hover:bg-primary-50 border border-primary-100'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Open Resume PDF</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setViewingProfileApp(null)}
                  className={`py-3 px-6 text-xs font-bold border rounded-xl transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
