import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!usernameOrEmail || !password) {
      setError('Please enter your username/email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(usernameOrEmail, password);
      if (res.success) {
        setSuccess('Authentication successful! Opening VIGIL Dashboard...');
        setTimeout(() => {
          navigate('/');
        }, 800);
      } else {
        setError(res.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection failed. Please ensure the backend server is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6 animate-fadeIn">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/30">
          <Shield className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-extrabold text-white font-outfit tracking-wide">Sign In to VIGIL</h1>
        <p className="text-xs text-gray-400">Enter your account details to access journey protection</p>
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
          
          {/* Username or Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Username or Email</span>
            </label>
            <input
              type="text"
              required
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
              placeholder="e.g. alexrivera or alex@example.com"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-500/30 border border-cyan-400/30 transition-all hover:scale-[1.01] active:scale-98"
          >
            <span>{loading ? 'AUTHENTICATING...' : 'SIGN IN TO DASHBOARD'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Account Info Helper */}
        <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-[11px] text-gray-400 space-y-1">
          <p className="font-bold text-gray-300">Default Demo Credentials:</p>
          <p>Username: <strong className="text-cyan-400">alexrivera</strong> | Password: <strong className="text-cyan-400">password123</strong></p>
        </div>

        {/* Create Account Link */}
        <div className="text-center pt-2 text-xs text-gray-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-cyan-400 hover:text-cyan-300 underline">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}
