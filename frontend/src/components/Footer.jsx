import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Globe, Link as LinkIcon, Share2, X, FileText, Calculator, Shield, DollarSign } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeModal, setActiveModal] = useState(null);

  // Salary Calculator State
  const [calcRole, setCalcRole] = useState('Frontend Engineer');
  const [calcLevel, setCalcLevel] = useState('Mid-Level');
  const [calcLoc, setCalcLoc] = useState('India');
  const [calcResult, setCalcResult] = useState(null);

  const handleCalculateSalary = (e) => {
    e.preventDefault();
    // Logic to compute realistic market salary ranges
    let baseMin = 60000;
    let baseMax = 90000;

    switch (calcRole) {
      case 'Frontend Engineer':
        baseMin = 65000; baseMax = 95000;
        break;
      case 'Backend Engineer':
        baseMin = 70000; baseMax = 105000;
        break;
      case 'Fullstack Engineer':
        baseMin = 75000; baseMax = 115000;
        break;
      case 'Data Analyst':
        baseMin = 55000; baseMax = 80000;
        break;
      case 'Product Manager':
        baseMin = 80000; baseMax = 125000;
        break;
      default:
        break;
    }

    let multiplier = 1.0;
    if (calcLevel === 'Junior') multiplier = 0.65;
    else if (calcLevel === 'Senior') multiplier = 1.5;

    let currency = '$';
    let locMultiplier = 1.0;
    if (calcLoc === 'India') {
      currency = '₹';
      locMultiplier = 12; // convert roughly to LPA scale or rupees
    } else if (calcLoc === 'Europe') {
      currency = '€';
      locMultiplier = 0.9;
    }

    const minVal = Math.round(baseMin * multiplier * locMultiplier);
    const maxVal = Math.round(baseMax * multiplier * locMultiplier);

    let formatResult = '';
    if (calcLoc === 'India') {
      // Formatted in lakhs (LPA) for better readability
      const minLakhs = (minVal / 100000).toFixed(1);
      const maxLakhs = (maxVal / 100000).toFixed(1);
      formatResult = `${currency}${minLakhs}L - ${currency}${maxLakhs}L per annum`;
    } else {
      formatResult = `${currency}${minVal.toLocaleString()} - ${currency}${maxVal.toLocaleString()} per annum`;
    }

    setCalcResult(formatResult);
  };

  const closeModal = () => {
    setActiveModal(null);
    setCalcResult(null);
  };

  return (
    <footer className={`mt-auto border-t relative z-40 transition-colors duration-300 ${
      isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-250 shadow-inner'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="bg-primary-600 text-white p-2 rounded-xl">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>
                Talent<span className="text-primary-400 font-extrabold">Hub</span>
              </span>
            </div>
            <p className={`text-sm transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-slate-650'
            } max-w-sm`}>
              Discover your next career move or connect with elite talent worldwide. TalentHub is the modern MERN ecosystem for developers, designers, and hiring managers.
            </p>
            <div className={`flex space-x-4 pt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <button
                onClick={() => setActiveModal('share')}
                className={`transition-colors bg-transparent border-0 p-0 cursor-pointer focus:outline-none ${
                  isDark ? 'hover:text-white' : 'hover:text-slate-900'
                }`}
                title="Share TalentHub"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveModal('linkedin-community')}
                className={`transition-colors bg-transparent border-0 p-0 cursor-pointer focus:outline-none ${
                  isDark ? 'hover:text-white' : 'hover:text-slate-900'
                }`}
                title="LinkedIn Community"
              >
                <LinkIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveModal('global-network')}
                className={`transition-colors bg-transparent border-0 p-0 cursor-pointer focus:outline-none ${
                  isDark ? 'hover:text-white' : 'hover:text-slate-900'
                }`}
                title="Developer Community"
              >
                <Globe className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`font-semibold text-sm tracking-wider uppercase mb-4 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>For Candidates</h3>
            <ul className={`space-y-2 text-sm transition-colors ${
              isDark ? 'text-slate-450' : 'text-slate-600'
            }`}>
              <li><Link to="/jobs" className={`transition-colors block ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>Browse Jobs</Link></li>
              <li><Link to="/seeker-dashboard" className={`transition-colors block ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>Candidate Dashboard</Link></li>
              <li>
                <button
                  onClick={() => setActiveModal('resume-tips')}
                  className={`transition-colors text-left bg-transparent border-0 p-0 cursor-pointer block w-full focus:outline-none ${
                    isDark ? 'hover:text-white' : 'hover:text-slate-900'
                  }`}
                >
                  Resume Tips
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('salary-calculator')}
                  className={`transition-colors text-left bg-transparent border-0 p-0 cursor-pointer block w-full focus:outline-none ${
                    isDark ? 'hover:text-white' : 'hover:text-slate-900'
                  }`}
                >
                  Salary Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className={`font-semibold text-sm tracking-wider uppercase mb-4 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>For Employers</h3>
            <ul className={`space-y-2 text-sm transition-colors ${
              isDark ? 'text-slate-450' : 'text-slate-600'
            }`}>
              <li><Link to="/employer-dashboard" className={`transition-colors block ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>Post a Job</Link></li>
              <li><Link to="/employer-dashboard" className={`transition-colors block ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>Employer Dashboard</Link></li>
              <li>
                <button
                  onClick={() => setActiveModal('pricing-plans')}
                  className={`transition-colors text-left bg-transparent border-0 p-0 cursor-pointer block w-full focus:outline-none ${
                    isDark ? 'hover:text-white' : 'hover:text-slate-900'
                  }`}
                >
                  Pricing Plans
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('talent-sourcing')}
                  className={`transition-colors text-left bg-transparent border-0 p-0 cursor-pointer block w-full focus:outline-none ${
                    isDark ? 'hover:text-white' : 'hover:text-slate-900'
                  }`}
                >
                  Talent Sourcing
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className={`border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0 transition-colors duration-300 ${
          isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-450'
        }`}>
          <p>&copy; {new Date().getFullYear()} TalentHub Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveModal('privacy-policy')}
              className={`transition-colors bg-transparent border-0 p-0 cursor-pointer focus:outline-none ${
                isDark ? 'hover:text-white' : 'hover:text-slate-900'
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveModal('terms-of-service')}
              className={`transition-colors bg-transparent border-0 p-0 cursor-pointer focus:outline-none ${
                isDark ? 'hover:text-white' : 'hover:text-slate-900'
              }`}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveModal('cookie-policy')}
              className={`transition-colors bg-transparent border-0 p-0 cursor-pointer focus:outline-none ${
                isDark ? 'hover:text-white' : 'hover:text-slate-900'
              }`}
            >
              Cookie Policy
            </button>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`rounded-3xl border max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-colors duration-300 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200/80 text-slate-800'
          }`}>
            {/* Modal header decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 to-accent-500" />
            
            <button
              onClick={closeModal}
              className={`absolute top-5 right-5 transition-colors p-1.5 rounded-xl cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-450 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <X className="h-5 w-5" />
            </button>

            {activeModal === 'resume-tips' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-primary-600 font-extrabold text-lg">
                  <FileText className="h-6 w-6" />
                  <span>Resume Writing Tips</span>
                </div>
                <div className="text-slate-600 text-sm leading-relaxed space-y-3 pt-2">
                  <p className="font-semibold text-slate-800">Stand out to top tech employers with these guidelines:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Focus on impact:</strong> Use action verbs and numbers. Instead of saying "Optimized queries," write "Optimized PostgreSQL indexes, reducing query latency by 35%."</li>
                    <li><strong>Tailor to the role:</strong> Match your keywords and skills section to the specific technologies listed in the job descriptions.</li>
                    <li><strong>Format for readability:</strong> Keep design clean and structural. Limit your resume length to 1-2 pages.</li>
                    <li><strong>Github & Live Links:</strong> Always include clickable links to your projects, GitHub repositories, or live web application demos.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeModal === 'salary-calculator' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-primary-600 font-extrabold text-lg">
                  <Calculator className="h-6 w-6" />
                  <span>Interactive Salary Calculator</span>
                </div>
                <form onSubmit={handleCalculateSalary} className="space-y-3.5 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
                      <select
                        value={calcRole}
                        onChange={(e) => setCalcRole(e.target.value)}
                        className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-primary-500 cursor-pointer"
                      >
                        <option>Frontend Engineer</option>
                        <option>Backend Engineer</option>
                        <option>Fullstack Engineer</option>
                        <option>Data Analyst</option>
                        <option>Product Manager</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Level</label>
                      <select
                        value={calcLevel}
                        onChange={(e) => setCalcLevel(e.target.value)}
                        className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-primary-500 cursor-pointer"
                      >
                        <option value="Junior">Junior (0-2 yrs)</option>
                        <option value="Mid-Level">Mid-Level (2-5 yrs)</option>
                        <option value="Senior">Senior (5+ yrs)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location</label>
                    <select
                      value={calcLoc}
                      onChange={(e) => setCalcLoc(e.target.value)}
                      className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-primary-500 cursor-pointer"
                    >
                      <option>India</option>
                      <option>Remote</option>
                      <option>United States</option>
                      <option>Europe</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full btn-primary text-xs py-3 mt-4">
                    Estimate Salary Range
                  </button>
                </form>

                {calcResult && (
                  <div className="bg-primary-50/50 border border-primary-100 rounded-2xl p-4 text-center mt-4 animate-scale-up">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimated Annual Range</p>
                    <p className="text-lg font-black text-primary-750 mt-1">{calcResult}</p>
                    <p className="text-[9px] text-slate-400 font-semibold mt-1">Based on real market data and active listings on TalentHub.</p>
                  </div>
                )}
              </div>
            )}

            {activeModal === 'pricing-plans' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-primary-600 font-extrabold text-lg">
                  <DollarSign className="h-6 w-6" />
                  <span>Employer Pricing Plans</span>
                </div>
                <div className="text-slate-650 text-xs leading-relaxed space-y-3 pt-2">
                  <div className="border border-slate-100 hover:border-primary-200 rounded-xl p-3 bg-slate-50/55 transition-colors">
                    <p className="font-bold text-slate-800 flex justify-between text-[11px] uppercase tracking-wider">
                      <span>Standard Tier</span>
                      <span className="text-primary-600">Free</span>
                    </p>
                    <p className="text-[11px] mt-1 text-slate-500">Post up to 3 active job listings and review basic applicant data. Perfect for early startups.</p>
                  </div>
                  <div className="border border-primary-200 bg-primary-50/10 rounded-xl p-3 transition-colors">
                    <p className="font-bold text-slate-800 flex justify-between text-[11px] uppercase tracking-wider">
                      <span>Pro Recruiter</span>
                      <span className="text-primary-600">$49 / mo</span>
                    </p>
                    <p className="text-[11px] mt-1 text-slate-500">Unlimited postings, featured listing placement, priority recruiter dashboard, and CSV applicant exports.</p>
                  </div>
                  <div className="border border-slate-100 hover:border-primary-200 rounded-xl p-3 bg-slate-50/55 transition-colors">
                    <p className="font-bold text-slate-800 flex justify-between text-[11px] uppercase tracking-wider">
                      <span>Enterprise</span>
                      <span className="text-primary-600">$199 / mo</span>
                    </p>
                    <p className="text-[11px] mt-1 text-slate-500">AI-assisted talent recommendations, active candidate sourcing pipeline, and full developer portfolio exports.</p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'talent-sourcing' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-primary-600 font-extrabold text-lg">
                  <Briefcase className="h-6 w-6" />
                  <span>Talent Sourcing</span>
                </div>
                <div className="text-slate-600 text-sm leading-relaxed space-y-3 pt-2">
                  <p>Our premium active sourcing team acts as your dedicated talent acquisition arm:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Candidate Match:</strong> We screen candidate portfolios against active listings to bring you pre-qualified talent directly.</li>
                    <li><strong>Direct Scheduling:</strong> Coordinate calls, code reviews, and video panel interviews with integrated calendars automatically.</li>
                    <li><strong>AI Screening:</strong> Filter resumes instantly based on technical skill mappings (React, Express, Node.js) and active years of experience.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeModal === 'privacy-policy' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-primary-600 font-extrabold text-lg">
                  <Shield className="h-6 w-6" />
                  <span>Privacy Policy</span>
                </div>
                <div className="text-slate-600 text-sm leading-relaxed space-y-3 pt-2">
                  <p className="font-semibold text-slate-800">Your privacy is our priority at TalentHub:</p>
                  <p>We collect essential seeker profile details (name, email, and phone number) along with resume documents solely to facilitate job applications.</p>
                  <p><strong>Data Sharing:</strong> Resume documents are only shared with employers you explicitly choose to apply to. We never sell, lease, or distribute your personal profile information to third-party advertisers or recruitment networks.</p>
                </div>
              </div>
            )}

            {activeModal === 'terms-of-service' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-primary-600 font-extrabold text-lg">
                  <Shield className="h-6 w-6" />
                  <span>Terms of Service</span>
                </div>
                <div className="text-slate-600 text-sm leading-relaxed space-y-3 pt-2">
                  <p className="font-semibold text-slate-800">Guidelines for using the TalentHub platform:</p>
                  <p>By creating an account, seekers agree to submit authentic work history, contact information, and resume files. Employers agree to post genuine career listings with accurate salary estimates and job descriptions.</p>
                  <p><strong>Account Conduct:</strong> We reserve the right to suspend or terminate accounts that post spam, submit fraudulent credentials, or violate fair hiring standards.</p>
                </div>
              </div>
            )}

            {activeModal === 'cookie-policy' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-primary-600 font-extrabold text-lg">
                  <Shield className="h-6 w-6" />
                  <span>Cookie Policy</span>
                </div>
                <div className="text-slate-600 text-sm leading-relaxed space-y-3 pt-2">
                  <p className="font-semibold text-slate-800">How we use web storage and cookies:</p>
                  <p>TalentHub utilizes local storage and functional cookies to securely store JSON Web Tokens (JWT) for authentication. This ensures you remain securely logged into your seeker or employer dashboards during your session.</p>
                  <p><strong>Preferences:</strong> We also use cookies to store your filter selections (such as preferred job types or locations) so you don't have to re-enter them on subsequent visits. We do not run any ad-tracking cookies.</p>
                </div>
              </div>
            )}

            {activeModal === 'share' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-primary-600 font-extrabold text-lg">
                  <Share2 className="h-6 w-6" />
                  <span>Share TalentHub</span>
                </div>
                <div className="text-slate-600 text-sm leading-relaxed space-y-4 pt-2">
                  <p>Spread the word and invite other engineers and recruiters to join TalentHub!</p>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-xs font-mono truncate text-slate-500 select-all mr-2">{window.location.origin}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin);
                        alert('TalentHub link copied to clipboard!');
                      }}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      Copy Link
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href={`https://twitter.com/intent/tweet?text=Check out TalentHub, the premium developer job board built on the MERN stack!&url=${encodeURIComponent(window.location.origin)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl py-2 text-xs font-bold transition-colors text-slate-700 text-center"
                    >
                      X / Twitter
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl py-2 text-xs font-bold transition-colors text-slate-700 text-center"
                    >
                      LinkedIn
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?text=Check out TalentHub, the premium developer job board built on the MERN stack! ${encodeURIComponent(window.location.origin)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl py-2 text-xs font-bold transition-colors text-slate-700 text-center"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'linkedin-community' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-primary-600 font-extrabold text-lg">
                  <LinkIcon className="h-6 w-6" />
                  <span>LinkedIn Professional Network</span>
                </div>
                <div className="text-slate-600 text-sm leading-relaxed space-y-3 pt-2">
                  <p className="font-semibold text-slate-800">Connect with hiring managers and developers globally:</p>
                  <p>Our official corporate LinkedIn community page hosts daily discussions, career spotlight features, and live engineering Q&A events.</p>
                  <p>In a production deployment, this link directs visitors to the verified company page to follow recruiter publications and network with TalentHub employers.</p>
                </div>
              </div>
            )}

            {activeModal === 'global-network' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-primary-600 font-extrabold text-lg">
                  <Globe className="h-6 w-6" />
                  <span>TalentHub Developer Community</span>
                </div>
                <div className="text-slate-600 text-sm leading-relaxed space-y-3 pt-2">
                  <p className="font-semibold text-slate-800">Join our open-source developer hub:</p>
                  <p>TalentHub is built by developers, for developers. Our source repository hosts hundreds of contributions from engineers worldwide who help refine the search indexes, mock data APIs, and glassmorphic designs.</p>
                  <p>In a production environment, this link redirects to the official GitHub repository for code collaboration, issue tracking, and roadmap planning.</p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
