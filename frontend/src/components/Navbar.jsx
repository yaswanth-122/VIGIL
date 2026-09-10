import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, ShieldCheck, Activity, MapPin, Eye, History, BarChart3, AlertOctagon, Sun, Moon, Monitor, User, LogOut, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentMode, onToggleMode, onOpenSOS }) {
  const navigate = useNavigate();
  const { themeMode, setThemeMode } = useTheme();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const cycleTheme = () => {
    if (themeMode === 'auto') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('light');
    else setThemeMode('auto');
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/95 dark:bg-[#0B0F19]/95 light:bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Brand Title - REMOVED BUG BUSTERS text as requested */}
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 stroke-[2.5]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-wider text-white font-outfit">VIGIL</span>
              <p className="text-[11px] text-gray-400 hidden sm:block">AI Virtual Safety Companion</p>
            </div>
          </NavLink>

          {/* Mobile Theme & SOS button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300"
              title={`Theme: ${themeMode}`}
            >
              {themeMode === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : themeMode === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Monitor className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={onOpenSOS}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/40 animate-pulse-glow"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>SOS</span>
            </button>
          </div>
        </div>

        {/* Center Mode Selector Switcher */}
        <div className="flex items-center justify-center">
          <div className="glass-panel p-1 rounded-xl flex items-center gap-1 border border-white/10 shadow-inner">
            <button
              onClick={() => onToggleMode('normal')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === 'normal'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <div className="leading-tight">NORMAL MODE</div>
                <div className="text-[9px] opacity-70 leading-none">Everyday privacy</div>
              </div>
            </button>

            <button
              onClick={() => onToggleMode('safety')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === 'safety'
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50 shadow-md shadow-blue-500/30 glow-blue'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <div className="text-left">
                <div className="leading-tight">SAFETY MODE</div>
                <div className="text-[9px] opacity-70 leading-none">Journey protection active</div>
              </div>
            </button>
          </div>
        </div>

        {/* Right Navigation & Controls */}
        <div className="flex items-center justify-between md:justify-end gap-2 overflow-x-auto pb-1 md:pb-0">
          <nav className="flex items-center gap-1 text-xs font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  isActive ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`
              }
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/start"
              className={({ isActive }) =>
                `px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  isActive ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`
              }
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Start Journey</span>
            </NavLink>

            <NavLink
              to="/active"
              className={({ isActive }) =>
                `px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`
              }
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Active Journey</span>
            </NavLink>

            <NavLink
              to="/guardians"
              className={({ isActive }) =>
                `px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  isActive ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`
              }
            >
              <Users className="w-3.5 h-3.5" />
              <span>Guardians</span>
            </NavLink>

            <NavLink
              to="/guardian"
              className={({ isActive }) =>
                `px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  isActive ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`
              }
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Feed</span>
            </NavLink>
          </nav>

          {/* Theme Selector Button */}
          <button
            onClick={cycleTheme}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-colors"
            title={`Current Theme: ${themeMode.toUpperCase()} (Click to toggle)`}
          >
            {themeMode === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : themeMode === 'dark' ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Monitor className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="capitalize">{themeMode}</span>
          </button>

          {/* User Profile / Login Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#121826] border border-white/10 rounded-xl p-2 shadow-2xl z-50 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">@{user.username || 'user'}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 font-semibold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Sign In
            </NavLink>
          )}

          {/* Emergency SOS button */}
          <button
            onClick={onOpenSOS}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-red-600/40 border border-red-400/30 animate-pulse-glow transition-all active:scale-95 shrink-0"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>SOS</span>
          </button>
        </div>

      </div>
    </header>
  );
}
