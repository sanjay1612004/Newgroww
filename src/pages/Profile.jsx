import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitKyc, getKycStatus } from '../api/kycApi';
import { FiUser, FiShield, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi';

function KycBadge({ status }) {
  const map = {
    pending:  { icon: <FiClock />,        label: 'Pending Review', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    approved: { icon: <FiCheckCircle />,   label: 'KYC Approved',   cls: 'bg-groww-green/10 text-groww-green border-groww-green/20' },
    rejected: { icon: <FiXCircle />,       label: 'KYC Rejected',   cls: 'bg-groww-red/10 text-groww-red border-groww-red/20' },
  };
  const m = map[status];
  if (!m) return null;
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm ${m.cls}`}>
      {m.icon} {m.label}
    </div>
  );
}

export default function Profile() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [kyc, setKyc] = useState(null);
  const [kycLoading, setKycLoading] = useState(true);
  
  const [form, setForm] = useState({
    fullName: user?.name || '',
    panNumber: '',
    aadhaarNumber: '',
    address: '',
    dob: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    getKycStatus()
      .then((res) => setKyc(res.data?.data))
      .catch(() => setKyc(null))
      .finally(() => setKycLoading(false));
  }, [isLoggedIn]);

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await submitKyc(form);
      setSuccess(res.data?.message || 'KYC submitted successfully!');
      setKyc({ status: 'pending' });
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.errors && Array.isArray(respData.errors) && respData.errors.length > 0) {
        setError(respData.errors[0].message || 'Validation failed');
      } else {
        setError(respData?.message || 'KYC submission failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-12 animate-fade-in">
      <h1 className="text-2xl font-extrabold text-groww-text mb-8">My Profile</h1>

      {/* User Info */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-groww-green rounded-full flex items-center justify-center text-groww-dark font-extrabold text-2xl shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-groww-text">{user?.name}</h2>
            <p className="text-groww-muted text-sm">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-groww-surface rounded-xl px-4 py-3">
            <p className="text-xs text-groww-muted">User ID</p>
            <p className="text-sm font-mono text-groww-text mt-0.5 truncate">{user?.id || '—'}</p>
          </div>
          <div className="bg-groww-surface rounded-xl px-4 py-3">
            <p className="text-xs text-groww-muted">Account Type</p>
            <p className="text-sm font-semibold text-groww-text mt-0.5">Individual</p>
          </div>
        </div>
      </div>

      {/* KYC Section */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-groww-green/10 rounded-full flex items-center justify-center">
            <FiShield className="text-groww-green" />
          </div>
          <div>
            <h3 className="font-bold text-groww-text">KYC Verification</h3>
            <p className="text-xs text-groww-muted">Required to start trading</p>
          </div>
        </div>

        {kycLoading ? (
          <div className="animate-pulse bg-groww-border rounded-xl h-12" />
        ) : kyc?.status ? (
          <div className="space-y-3">
            <KycBadge status={kyc.status} />
            {kyc.remarks && (
              <div className="flex items-start gap-2 bg-groww-surface rounded-xl px-4 py-3">
                <FiAlertCircle className="text-groww-muted shrink-0 mt-0.5" size={14} />
                <p className="text-sm text-groww-muted">{kyc.remarks}</p>
              </div>
            )}
            {kyc.status === 'rejected' && (
              <p className="text-xs text-groww-muted">Please resubmit your KYC details below.</p>
            )}
          </div>
        ) : null}

        {/* Show form if no KYC or rejected */}
        {!kycLoading && (!kyc?.status || kyc?.status === 'rejected') && (
          <form onSubmit={handleKycSubmit} className="mt-5 space-y-4">
            
            <div>
              <label className="text-xs font-medium text-groww-muted block mb-1.5">Full Name (as per documents)</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-groww-muted block mb-1.5">PAN Number</label>
                <input
                  type="text"
                  required
                  placeholder="ABCDE1234F"
                  value={form.panNumber}
                  onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                  className="input-field font-mono"
                  maxLength={10}
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-groww-muted block mb-1.5">Aadhaar Number</label>
                <input
                  type="text"
                  required
                  placeholder="123456789012"
                  value={form.aadhaarNumber}
                  onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                  className="input-field font-mono"
                  maxLength={12}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-groww-muted block mb-1.5">Date of Birth</label>
              <input
                type="date"
                required
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className="input-field"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-groww-muted block mb-1.5">Residential Address</label>
              <textarea
                required
                placeholder="Enter complete address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-field min-h-[80px] resize-none"
                minLength={10}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-groww-red/10 border border-groww-red/20 rounded-lg px-4 py-3">
                <FiAlertCircle className="text-groww-red shrink-0 mt-0.5" />
                <p className="text-sm text-groww-red">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 text-sm text-groww-green bg-groww-green/10 rounded-lg px-4 py-3">
                <FiCheckCircle size={14} />{success}
              </div>
            )}
            
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-sm mt-2">
              {submitting ? 'Submitting…' : 'Submit KYC'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
