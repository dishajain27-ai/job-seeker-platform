import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocketAlert } from '../context/SocketAlertContext';
import { Briefcase, User, LogOut, Menu, X, LayoutDashboard, PlusCircle, Bell, Sun, Moon, Check } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isEmployer, isSeeker } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { triggerAlert } = useSocketAlert();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "WebStyles viewed your resume", time: "2 hours ago", read: false },
    { id: 2, text: "Application status updated to Shortlisted", time: "5 hours ago", read: false },
    { id: 3, text: "ByteCraft Labs scheduled an interview with you", time: "Yesterday", read: false },
    { id: 4, text: "New React Developer role matches your profile", time: "2 days ago", read: true }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
    setShowNotifications(false);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <nav className={`backdrop-blur-md sticky top-0 z-50 border-b transition-colors duration-300 shadow-lg ${
      isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white/80 border-slate-200/80 shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-indigo-500/15 border border-indigo-500/30 rounded-xl shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Briefcase className="h-5 w-5 text-indigo-400" />
              </div>
              <span className={`text-xl font-extrabold tracking-tight transition-colors duration-300 ${
                isDark ? 'text-slate-100' : 'text-slate-800'
              }`}>
                Talent<span className="gradient-text font-black">Hub</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/jobs" 
              className={`font-semibold transition-colors duration-300 ${
                isDark ? 'text-slate-200 hover:text-indigo-400' : 'text-slate-650 hover:text-indigo-650'
              }`}
            >
              Browse Jobs
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={() => {
                toggleTheme();
                triggerAlert("Midnight Cosmic Theme is optimized by default for reduced eye-strain.", "Theme Settings");
              }}
              className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                isDark 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-amber-400 hover:scale-105' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-indigo-650 hover:scale-105 shadow-sm'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Notification Center Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer relative ${
                  isDark 
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 hover:scale-105' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 hover:scale-105 shadow-sm'
                }`}
                title="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-555"></span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-xl z-50 border overflow-hidden transition-all duration-200 text-left ${
                  isDark 
                    ? 'bg-[#0f172a]/95 backdrop-blur-md border-slate-800/80 text-slate-100' 
                    : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-800'
                }`}>
                  <div className={`p-4 font-bold text-xs uppercase tracking-wider border-b flex justify-between items-center ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-150 text-slate-500'
                  }`}>
                    <span>Alerts ({notifications.filter((n) => !n.read).length} unread)</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearAllNotifications}
                        className="text-[10px] font-black text-rose-500 hover:text-rose-600 hover:underline cursor-pointer bg-transparent border-0 outline-none"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-3.5 border-b last:border-b-0 cursor-pointer flex items-start gap-3 transition-colors relative group ${
                            n.read 
                              ? isDark ? 'hover:bg-slate-800/40 opacity-70' : 'hover:bg-slate-50 opacity-70' 
                              : isDark ? 'bg-indigo-500/5 hover:bg-slate-800/70' : 'bg-indigo-50/40 hover:bg-slate-50'
                          }`}
                        >
                          {!n.read && (
                            <span className="absolute top-4.5 left-2.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          )}
                          <div className="flex-grow pl-3">
                            <p className="text-xs font-semibold leading-normal">{n.text}</p>
                            <p className={`text-[9px] font-medium mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{n.time}</p>
                          </div>
                          <button
                            onClick={(e) => deleteNotification(n.id, e)}
                            className="text-slate-400 hover:text-rose-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs font-semibold text-slate-400 italic">
                        No notifications found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                {isEmployer ? (
                  <>
                    <Link
                      to="/employer-dashboard"
                      className={`font-semibold flex items-center space-x-1.5 transition-colors duration-300 ${
                        isDark ? 'text-slate-200 hover:text-indigo-400' : 'text-slate-650 hover:text-indigo-650'
                      }`}
                    >
                      <LayoutDashboard className="h-4.5 w-4.5 text-indigo-400" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/talent"
                      className={`font-semibold flex items-center space-x-1.5 transition-colors duration-300 ${
                        isDark ? 'text-slate-200 hover:text-indigo-400' : 'text-slate-650 hover:text-indigo-650'
                      }`}
                    >
                      <User className="h-4.5 w-4.5 text-indigo-400" />
                      <span>Browse Talent</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/seeker-dashboard"
                      className={`font-semibold flex items-center space-x-1.5 transition-colors duration-300 ${
                        isDark ? 'text-slate-200 hover:text-indigo-400' : 'text-slate-650 hover:text-indigo-650'
                      }`}
                    >
                      <LayoutDashboard className="h-4.5 w-4.5 text-indigo-400" />
                      <span>Dashboard</span>
                    </Link>
                  </>
                )}

                {/* Profile info & Logout */}
                <div className={`flex items-center space-x-4 pl-4 border-l transition-colors duration-300 ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <div className={`flex items-center space-x-2 transition-colors duration-300 ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    <div className={isDark ? 'bg-slate-800 p-1.5 rounded-full' : 'bg-slate-100 p-1.5 rounded-full border border-slate-200'}>
                      <User className="h-4 w-4 text-indigo-455" />
                    </div>
                    <span className={`font-semibold text-sm truncate max-w-[120px] ${
                      isDark ? 'text-slate-100' : 'text-slate-800'
                    }`}>
                      {user?.name}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border transition-colors duration-300 ${
                      isDark 
                        ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                        : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                    }`}>
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl transition-all duration-200 flex items-center space-x-1 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className={`flex items-center space-x-3 pl-4 border-l transition-colors duration-300 ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <Link
                  to="/login"
                  className={`font-extrabold px-6 py-2.5 rounded-xl transition-all duration-300 text-sm shadow-sm border ${
                    isDark 
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-750'
                  }`}
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary py-2.5 text-sm shadow-md">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            {/* Theme Toggle Button for Mobile Navigation bar */}
            <button
              onClick={() => {
                toggleTheme();
                triggerAlert("Midnight Cosmic Theme is optimized by default for reduced eye-strain.", "Theme Settings");
              }}
              className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-amber-400' 
                  : 'bg-slate-50 border-slate-200 text-indigo-650 shadow-sm'
              }`}
            >
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-xl focus:outline-none transition-colors duration-300 ${
                isDark 
                  ? 'text-slate-300 hover:text-white hover:bg-white/5' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={`md:hidden border-t transition-colors duration-300 ${
          isDark ? 'border-slate-800 bg-[#0b1329]/95' : 'border-slate-200 bg-white/95 shadow-lg'
        } backdrop-blur-md`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/jobs"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                isDark 
                  ? 'text-slate-200 hover:text-indigo-400 hover:bg-white/5' 
                  : 'text-slate-700 hover:text-indigo-650 hover:bg-slate-50'
              }`}
            >
              Browse Jobs
            </Link>

            {/* Notification Center in Mobile */}
            <div className={`px-3 py-2 border-t my-2 ${isDark ? 'border-slate-800/60' : 'border-slate-150'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Alerts ({notifications.filter((n) => !n.read).length} unread)
                </span>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearAllNotifications}
                    className="text-[9px] font-black text-rose-500 hover:text-rose-600 hover:underline cursor-pointer bg-transparent border-0 outline-none"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {notifications.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-2.5 rounded-lg text-xs leading-normal flex items-start justify-between transition-colors ${
                        n.read 
                          ? isDark ? 'bg-slate-800/20 text-slate-450' : 'bg-slate-100/60 text-slate-500' 
                          : isDark ? 'bg-indigo-500/10 text-slate-200 font-semibold border border-indigo-500/15' : 'bg-indigo-50 text-slate-750 font-semibold border border-indigo-100'
                      }`}
                    >
                      <span>{n.text}</span>
                      <button 
                        onClick={(e) => deleteNotification(n.id, e)}
                        className="text-slate-400 hover:text-rose-500 ml-2 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-450 italic">No alerts found</span>
              )}
            </div>

            {isAuthenticated ? (
              <>
                {isEmployer ? (
                  <>
                    <Link
                      to="/employer-dashboard"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                        isDark ? 'text-slate-200 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-650'
                      }`}
                    >
                      <LayoutDashboard className="h-5 w-5 text-indigo-400" />
                      <span>Employer Dashboard</span>
                    </Link>
                    <Link
                      to="/talent"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                        isDark ? 'text-slate-200 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-650'
                      }`}
                    >
                      <User className="h-5 w-5 text-indigo-400" />
                      <span>Browse Talent</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/seeker-dashboard"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      isDark ? 'text-slate-200 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-650'
                    }`}
                  >
                    <LayoutDashboard className="h-5 w-5 text-indigo-400" />
                    <span>Candidate Dashboard</span>
                  </Link>
                )}

                <div className={`border-t my-2 pt-2 px-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className={`flex items-center space-x-2 mb-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    <User className="h-5 w-5 text-indigo-400" />
                    <span className="font-semibold text-sm">{user?.name} ({user?.role})</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center space-x-2 px-3 py-2.5 rounded-xl text-base font-medium text-rose-450 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className={`grid grid-cols-2 gap-2 p-2 border-t mt-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold border ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10' 
                      : 'bg-slate-50 border-slate-200 text-slate-750 hover:bg-slate-100'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary w-full text-center py-2.5 text-sm shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
