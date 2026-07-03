import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPendingKyc } from '../api/kycApi';
import AdminKYCRow from '../components/AdminKYCRow';
import { FiShield, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

export default function AdminPanel() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchPending = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const res = await getPendingKyc();
      const d = res.data;
      setRecords(d?.data || (Array.isArray(d) ? d : []));
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(err.response?.data?.message || 'Failed to load KYC requests.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    fetchPending();
  }, [isLoggedIn]);

  const handleUpdate = (id, newStatus) => {
    setRecords((prev) => prev.map((r) => (r.id === id || r._id === id) ? { ...r, status: newStatus } : r));
  };

  const pending = records.filter((r) => r.status === 'pending');
  const reviewed = records.filter((r) => r.status !== 'pending');

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-groww-green/10 rounded-full flex items-center justify-center">
            <FiShield className="text-groww-green text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-groww-text">Admin Panel</h1>
            <p className="text-groww-muted text-sm">KYC Review Dashboard</p>
          </div>
        </div>
        <button onClick={() => fetchPending(true)} disabled={refreshing}
          className="flex items-center gap-2 text-sm text-groww-muted hover:text-groww-green transition-colors">
          <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total', count: records.length, color: 'text-groww-text' },
          { label: 'Pending', count: pending.length, color: 'text-yellow-400' },
          { label: 'Reviewed', count: reviewed.length, color: 'text-groww-green' },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-groww-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-groww-border rounded-xl h-20" />)}
        </div>
      ) : error ? (
        <div className="card text-center py-16">
          <FiAlertCircle className="text-4xl text-groww-red mx-auto mb-3" />
          <p className="text-groww-red font-semibold">{error}</p>
        </div>
      ) : records.length === 0 ? (
        <div className="card text-center py-16 text-groww-muted">
          <FiShield className="text-4xl mx-auto mb-3 text-groww-border" />
          <p>No KYC requests found.</p>
        </div>
      ) : (
        <div>
          {pending.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wider">
                Pending ({pending.length})
              </h2>
              {pending.map((r) => (
                <AdminKYCRow key={r.id || r._id} record={r} onUpdate={handleUpdate} />
              ))}
            </div>
          )}
          {reviewed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-groww-muted mb-3 uppercase tracking-wider">
                Reviewed ({reviewed.length})
              </h2>
              {reviewed.map((r) => (
                <AdminKYCRow key={r.id || r._id} record={r} onUpdate={handleUpdate} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
