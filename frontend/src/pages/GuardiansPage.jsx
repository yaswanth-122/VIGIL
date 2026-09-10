import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Phone, Mail, Star, Trash2, Edit3, Shield, Check, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const RELATIONSHIPS = ['Father', 'Mother', 'Brother', 'Sister', 'Friend', 'Spouse', 'Relative', 'Other'];

export default function GuardiansPage() {
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    relationship: 'Father',
    phone: '',
    email: '',
    priority: 1,
    is_primary: false,
    enabled: true
  });

  const [error, setError] = useState('');

  useEffect(() => {
    fetchGuardians();
  }, []);

  const fetchGuardians = async () => {
    try {
      setLoading(true);
      const res = await api.getGuardians();
      if (res.success) {
        setGuardians(res.guardians);
      }
    } catch (err) {
      console.error('Error fetching guardians:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: 'Father',
      phone: '',
      email: '',
      priority: guardians.length + 1,
      is_primary: false,
      enabled: true
    });
    setEditingId(null);
    setError('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (g) => {
    setFormData({
      name: g.name,
      relationship: g.relationship,
      phone: g.phone,
      email: g.email || '',
      priority: g.priority || 1,
      is_primary: g.is_primary || false,
      enabled: g.enabled !== undefined ? g.enabled : true
    });
    setEditingId(g.id);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this trusted guardian?')) {
      try {
        const res = await api.deleteGuardian(id);
        if (res.success) {
          setGuardians(res.guardians);
        }
      } catch (err) {
        console.error('Error deleting guardian:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.phone || !formData.relationship) {
      setError('Full Name, Phone number, and Relationship are required.');
      return;
    }

    try {
      let res;
      if (editingId) {
        res = await api.updateGuardian(editingId, formData);
      } else {
        res = await api.addGuardian(formData);
      }

      if (res.success) {
        setGuardians(res.guardians);
        setShowAddModal(false);
        resetForm();
      } else {
        setError(res.message || 'Failed to save guardian contact.');
      }
    } catch (err) {
      console.error('Error saving guardian:', err);
      setError('Connection failed. Could not save guardian contact.');
    }
  };

  const handleToggleEnable = async (g) => {
    try {
      const res = await api.updateGuardian(g.id, { enabled: !g.enabled });
      if (res.success) {
        setGuardians(res.guardians);
      }
    } catch (err) {
      console.error('Error toggling enable:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Title & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h1 className="text-3xl font-extrabold text-white font-outfit">Manage Trusted Guardians</h1>
          </div>
          <p className="text-xs text-gray-400">
            Configure multiple trusted contacts to receive live GPS telemetry, risk alerts, and emergency SOS broadcasts.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 border border-purple-400/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ ADD TRUSTED GUARDIAN</span>
        </button>
      </div>

      {/* Guardians Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading trusted guardians...</div>
      ) : guardians && guardians.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guardians.map((g) => (
            <div
              key={g.id}
              className={`glass-panel p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                g.is_primary ? 'border-purple-500/50 bg-purple-950/20 glow-purple' : 'border-white/10'
              } ${!g.enabled ? 'opacity-50' : ''}`}
            >
              
              <div className="space-y-3">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-white/10 text-gray-300 border border-white/10">
                      Priority #{g.priority || 1}
                    </span>
                    {g.is_primary && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-purple-400 text-purple-400" />
                        PRIMARY GUARDIAN
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleEnable(g)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      g.enabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-gray-500/20 text-gray-400 border-gray-500/40'
                    }`}
                  >
                    {g.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* Name & Relation */}
                <div>
                  <h3 className="text-lg font-bold text-white font-outfit">{g.name}</h3>
                  <p className="text-xs text-purple-300 font-semibold">{g.relationship}</p>
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{g.phone}</span>
                  </div>
                  {g.email && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span>{g.email}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                <a
                  href={`tel:${g.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 font-bold border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
                >
                  CALL
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(g)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                    title="Edit Guardian"
                  >
                    <Edit3 className="w-4 h-4 text-cyan-400" />
                  </button>

                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Remove Guardian"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
          <Shield className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Guardians Configured</h3>
          <p className="text-xs text-gray-400">Add trusted contacts (Father, Mother, Friend) to automatically receive emergency alerts during safe journeys.</p>
        </div>
      )}

      {/* Add / Edit Guardian Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#121826] border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold font-outfit">{editingId ? 'Edit Trusted Guardian' : 'Add Trusted Guardian'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-300">Relationship</label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-300">Priority Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-300">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
                  placeholder="guardian@example.com"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="w-4 h-4 accent-purple-500 rounded"
                />
                <label htmlFor="is_primary" className="font-semibold text-gray-200 cursor-pointer">
                  Set as Primary Guardian (High-priority alert target)
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  {editingId ? 'SAVE GUARDIAN CHANGES' : 'ADD GUARDIAN CONTACT'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
