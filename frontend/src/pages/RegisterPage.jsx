import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Mail, Phone, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Field Validations
    if (!formData.name || !formData.username || !formData.email || !formData.phone || !formData.password) {
      setError('All fields are required.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      if (res.success) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      } else {
        setError(res.message || 'Registration failed. Username or email may already be in use.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Connection failed. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6 animate-fadeIn">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/30">
          <Shield className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-extrabold text-white font-outfit tracking-wide">Create VIGIL Account</h1>
        <p className="text-xs text-gray-400">Join VIGIL AI Virtual Safety Companion for voluntary journey monitoring</p>
      </div>

      {/* Form Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-5">
        
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              placeholder="e.g. Sarah Jenkins"
            />
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Username</span>
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              placeholder="e.g. sarahjenkins"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              placeholder="sarah@example.com"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Phone Number</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Confirm</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-500/30 border border-cyan-400/30 transition-all hover:scale-[1.01] active:scale-98 mt-2"
          >
            <span>{loading ? 'CREATING ACCOUNT...' : 'CREATE VIGIL ACCOUNT'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Existing Account Link */}
        <div className="text-center pt-2 text-xs text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
