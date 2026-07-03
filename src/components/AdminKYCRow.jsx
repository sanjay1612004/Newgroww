import { useState } from 'react';
import { approveKyc, rejectKyc } from '../api/kycApi';
import { FiCheck, FiX, FiUser, FiCalendar } from 'react-icons/fi';

function statusBadge(status) {
  const map = {
    pending:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    approved: 'bg-groww-green/10 text-groww-green border-groww-green/20',
    rejected: 'bg-groww-red/10 text-groww-red border-groww-red/20',
  };
  return map[status] || 'bg-groww-border text-groww-muted border-groww-border';
}

export default function AdminKYCRow({ record, onUpdate }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const handle = async (action) => {
    setLoading(action);
    setError('');
    try {
      if (action === 'approve') await approveKyc(record.id || record._id);
      else await rejectKyc(record.id || record._id);
      onUpdate?.(record.id || record._id, action === 'approve' ? 'approved' : 'rejected');
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="card mb-3 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-groww-green/10 rounded-full flex items-center justify-center shrink-0">
            <FiUser className="text-groww-green" />
          </div>
          <div>
            <p className="text-sm font-semibold text-groww-text">{record.userId}</p>
            <p className="text-xs text-groww-muted mt-0.5">
              {record.documentType}: <span className="text-groww-text font-medium">{record.documentNumber}</span>
            </p>
            <div className="flex items-center gap-1 text-xs text-groww-muted mt-1">
              <FiCalendar size={10} />
              {record.createdAt ? new Date(record.createdAt).toLocaleString('en-IN') : '—'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${statusBadge(record.status)}`}>
            {record.status}
          </span>

          {record.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => handle('approve')} disabled={!!loading}
                className="flex items-center gap-1.5 bg-groww-green/10 text-groww-green border border-groww-green/20
                           px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-groww-green hover:text-groww-dark
                           transition-all disabled:opacity-50">
                <FiCheck size={13} /> {loading === 'approve' ? '…' : 'Approve'}
              </button>
              <button onClick={() => handle('reject')} disabled={!!loading}
                className="flex items-center gap-1.5 bg-groww-red/10 text-groww-red border border-groww-red/20
                           px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-groww-red hover:text-white
                           transition-all disabled:opacity-50">
                <FiX size={13} /> {loading === 'reject' ? '…' : 'Reject'}
              </button>
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-groww-red mt-3">{error}</p>}
    </div>
  );
}
