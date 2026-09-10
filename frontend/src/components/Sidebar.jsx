import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, ShieldCheck, Activity, MapPin, Eye, History, BarChart3, AlertOctagon, Sun, Moon, Monitor, User, LogOut, Users, Menu, X, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentMode, onToggleMode, onOpenSOS }) {
  const navigate = useNavigate();
  const { themeMode, setThemeMode } = useTheme();
  const { user, logout } = useAuth();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const cycleTheme = () => {
    if (themeMode === 'auto') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('light');
    else setThemeMode('auto');
  };

  const handleLogout = () => {
    logout();
    setIsOpenMobile(false);
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Activity, badge: null },
    { to: '/start', label: 'Start Journey', icon: MapPin, badge: null },
    { to: '/active', label: 'Active Journey', icon: ShieldAlert, badge: 'LIVE' },
    { to: '/guardians', label: 'Guardians', icon: Users, badge: null },
    { to: '/guardian', label: 'Live Feed', icon: Eye, badge: null },
    { to: '/history', label: 'Journey History', icon: History, badge: null },
    { to: '/admin', label: 'Admin Analytics', icon: BarChart3, badge: null }
  ];

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0B0F19]/95 dark:bg-[#0B0F19]/95 light:bg-white/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-200 hover:text-white"
        >
          {isOpenMobile ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-wider text-white font-outfit">VIGIL</span>
        </NavLink>

        <button
          onClick={onOpenSOS}
          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/40 animate-pulse-glow"
        >
          SOS
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
        ></div>
      )}

      {/* Main Left Vertical Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0B0F19] dark:bg-[#0B0F19] light:bg-slate-900 border-r border-white/10 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <NavLink to="/" onClick={() => setIsOpenMobile(false)} className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 stroke-[2.5]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-wider text-white font-outfit">VIGIL</span>
                <p className="text-[10px] text-gray-400">AI Safety Companion</p>
              </div>
            </NavLink>

            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Toggle Card */}
          <div className="glass-panel p-1.5 rounded-xl border border-white/10 space-y-1">
            <button
              onClick={() => onToggleMode('normal')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentMode === 'normal'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20 font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>NORMAL MODE</span>
              </div>
              {currentMode === 'normal' && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>}
            </button>

            <button
              onClick={() => onToggleMode('safety')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentMode === 'safety'
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50 shadow-md shadow-blue-500/30 glow-blue font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                <span>SAFETY MODE</span>
              </div>
              {currentMode === 'safety' && <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>}
            </button>
          </div>

          {/* Vertical Line-by-Line Navigation Stack */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-3 pb-1">
              MAIN NAVIGATION
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpenMobile(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-blue-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

        </div>

        {/* Sidebar Footer Controls: Theme, User Profile & Emergency SOS */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          
          {/* Emergency SOS Button */}
          <button
            onClick={() => {
              setIsOpenMobile(false);
              onOpenSOS();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-red-600/40 border border-red-400/30 animate-pulse-glow transition-all active:scale-95"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>EMERGENCY SOS</span>
          </button>

          {/* Theme Selector Toggle */}
          <button
            onClick={cycleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              {themeMode === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : themeMode === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Monitor className="w-4 h-4 text-cyan-400" />}
              <span>Theme: <strong className="capitalize text-white">{themeMode}</strong></span>
            </div>
            <span className="text-[10px] text-gray-500">Toggle</span>
          </button>

          {/* Logged in User Profile Card */}
          {user ? (
            <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">@{user.username || 'user'}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setIsOpenMobile(false)}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
            >
              Sign In
            </NavLink>
          )}

        </div>

      </aside>
    </>
  );
}
