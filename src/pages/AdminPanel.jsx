import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPendingKyc, getAllKyc, getRejectedKyc } from '../api/kycApi';
import AdminKYCRow from '../components/AdminKYCRow';
import { FiShield, FiRefreshCw, FiAlertCircle, FiClock, FiList, FiXCircle } from 'react-icons/fi';

const TABS = [
  { id: 'pending',  label: 'Pending Requests',      icon: FiClock,    color: 'text-yellow-400',  bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30' },
  { id: 'all',      label: 'Total Request History',  icon: FiList,     color: 'text-blue-400',    bgColor: 'bg-blue-500/10',   borderColor: 'border-blue-500/30' },
  { id: 'rejected', label: 'Rejected Requests',      icon: FiXCircle,  color: 'text-groww-red',   bgColor: 'bg-groww-red/10',  borderColor: 'border-groww-red/30' },
];

export default function AdminPanel() {
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [records, setRecords] = useState({ pending: [], all: [], rejected: [] });
  const [loading, setLoading] = useState({ pending: true, all: true, rejected: true });
  const [error, setError] = useState({ pending: '', all: '', rejected: '' });
  const [refreshing, setRefreshing] = useState(false);

  const fetchTab = async (tab, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading((prev) => ({ ...prev, [tab]: true }));
    setError((prev) => ({ ...prev, [tab]: '' }));
    try {
      const apiFn = tab === 'pending' ? getPendingKyc : tab === 'all' ? getAllKyc : getRejectedKyc;
      const res = await apiFn();
      const d = res.data;
      const list = d?.data || (Array.isArray(d) ? d : []);
      setRecords((prev) => ({ ...prev, [tab]: list }));
    } catch (err) {
      if (err.response?.status === 403) {
        setError((prev) => ({ ...prev, [tab]: 'Access denied. Admin privileges required.' }));
      } else {
        setError((prev) => ({ ...prev, [tab]: err.response?.data?.message || 'Failed to load KYC requests.' }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, [tab]: false }));
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!isAdmin) { navigate('/'); return; }
    // Fetch all tabs initially
    fetchTab('pending');
    fetchTab('all');
    fetchTab('rejected');
  }, [isLoggedIn, isAdmin]);

  const handleUpdate = (id, newStatus) => {
    // Update local state across all tabs
    const updater = (list) =>
      list.map((r) => (r.id === id || r._id === id) ? { ...r, status: newStatus } : r);
    setRecords((prev) => ({
      pending: updater(prev.pending),
      all: updater(prev.all),
      rejected: updater(prev.rejected),
    }));
  };

  const handleRefresh = () => {
    fetchTab(activeTab, true);
  };

  const currentRecords = records[activeTab];
  const currentLoading = loading[activeTab];
  const currentError = error[activeTab];
  const activeTabConfig = TABS.find((t) => t.id === activeTab);

  // Stats
  const totalCount = records.all.length;
  const pendingCount = records.pending.length;
  const rejectedCount = records.rejected.length;

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-groww-green/20 to-groww-green/5 rounded-2xl flex items-center justify-center border border-groww-green/20">
            <FiShield className="text-groww-green text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-groww-text">Admin Panel</h1>
            <p className="text-groww-muted text-sm">KYC Review Dashboard</p>
          </div>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-2 text-sm text-groww-muted hover:text-groww-green transition-colors bg-groww-surface border border-groww-border rounded-xl px-4 py-2.5 hover:border-groww-green/30">
          <FiRefreshCw className={refreshing ? 'animate-spin' : ''} size={14} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Requests', count: totalCount, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: FiList },
          { label: 'Pending', count: pendingCount, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: FiClock },
          { label: 'Rejected', count: rejectedCount, color: 'text-groww-red', bg: 'bg-groww-red/10', border: 'border-groww-red/20', icon: FiXCircle },
        ].map((s) => (
          <div key={s.label} className={`card text-center border ${s.border} relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 right-0 h-1 ${s.bg}`} style={{ opacity: 0.6 }} />
            <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
              <s.icon className={`${s.color}`} size={16} />
            </div>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-groww-muted mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-groww-surface/50 border border-groww-border rounded-2xl p-1.5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const count = tab.id === 'pending' ? pendingCount : tab.id === 'all' ? totalCount : rejectedCount;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? `${tab.bgColor} ${tab.color} border ${tab.borderColor} shadow-sm`
                  : 'text-groww-muted hover:text-groww-text hover:bg-groww-surface'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isActive ? `${tab.bgColor} ${tab.color}` : 'bg-groww-border text-groww-muted'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in" key={activeTab}>
        {currentLoading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-groww-border/50 rounded-xl h-20" />
            ))}
          </div>
        ) : currentError ? (
          <div className="card text-center py-16 border border-groww-red/20">
            <FiAlertCircle className="text-4xl text-groww-red mx-auto mb-3" />
            <p className="text-groww-red font-semibold">{currentError}</p>
          </div>
        ) : currentRecords.length === 0 ? (
          <div className="card text-center py-16 text-groww-muted">
            <div className={`w-16 h-16 ${activeTabConfig.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <activeTabConfig.icon className={`text-2xl ${activeTabConfig.color}`} />
            </div>
            <p className="font-semibold text-groww-text mb-1">No {activeTabConfig.label.toLowerCase()}</p>
            <p className="text-sm">There are no KYC requests in this category.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Section Header */}
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className={`text-sm font-semibold ${activeTabConfig.color} uppercase tracking-wider`}>
                {activeTabConfig.label} ({currentRecords.length})
              </h2>
            </div>
            {currentRecords.map((r) => (
              <AdminKYCRow key={r.id || r._id} record={r} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
