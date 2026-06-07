import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'employer') {
        navigate('/employer-dashboard');
      } else {
        navigate('/seeker-dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-20 px-4 bg-grid-pattern relative overflow-hidden">
      {/* Moving background circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary-400/20 rounded-full filter blur-3xl animate-float-slow -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-400/15 rounded-full filter blur-3xl animate-float-delayed -z-10"></div>

      <div className="w-full max-w-md bg-white/85 backdrop-blur-xl border border-white/60 p-8 sm:p-10 rounded-3xl shadow-2xl relative hover:border-primary-400/40 transition-colors duration-300">
        {/* Glow corner elements */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary-300 rounded-full mix-blend-multiply filter blur-2xl opacity-15"></div>
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-accent-300 rounded-full mix-blend-multiply filter blur-2xl opacity-15"></div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Welcome <span className="gradient-text font-black">Back</span>
          </h2>
          <p className="text-sm text-slate-550 mt-2.5 font-medium">
            Enter your details to access your account
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start space-x-2.5 bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/70 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-xl text-sm text-slate-850 placeholder-slate-400 outline-none transition-all duration-200 focus:ring-4 focus:ring-primary-500/10"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/70 border border-slate-200 focus:border-primary-500 focus:bg-white rounded-xl text-sm text-slate-850 placeholder-slate-400 outline-none transition-all duration-200 focus:ring-4 focus:ring-primary-500/10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary flex items-center justify-center py-4 space-x-2 text-sm mt-3"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="h-4.5 w-4.5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-750 font-bold transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
