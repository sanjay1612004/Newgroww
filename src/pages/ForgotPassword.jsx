import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, verifyOtp, resetPassword } from '../api/authApi';
import { FiMail, FiShield, FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const STEPS = ['email', 'otp', 'reset', 'done'];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await forgotPassword(email);
      setMsg(res.data.message || 'OTP sent to your email');
      setStep('otp');
    } catch (err) { setError(err.response?.data?.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await verifyOtp(email, otp);
      setStep('reset');
    } catch (err) { setError(err.response?.data?.message || 'Invalid or expired OTP'); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await resetPassword(email, otp, newPw);
      setStep('done');
    } catch (err) { setError(err.response?.data?.message || 'Password reset failed'); }
    finally { setLoading(false); }
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-groww-bg">
      <div className="w-full max-w-md animate-slide-up">
        <Link to="/login" className="flex items-center gap-2 text-groww-muted hover:text-groww-text text-sm mb-6 transition-colors">
          <FiArrowLeft /> Back to Login
        </Link>

        <div className="card">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {['Email', 'OTP', 'New Password'].map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  stepIndex > i ? 'bg-groww-green text-groww-dark' :
                  stepIndex === i ? 'bg-groww-green text-groww-dark' :
                  'bg-groww-border text-groww-muted'
                }`}>{stepIndex > i ? '✓' : i + 1}</div>
                <span className={`text-xs font-medium ${stepIndex >= i ? 'text-groww-green' : 'text-groww-muted'}`}>{label}</span>
                {i < 2 && <div className={`flex-1 h-0.5 rounded ${stepIndex > i ? 'bg-groww-green' : 'bg-groww-border'}`} />}
              </div>
            ))}
          </div>

          {step === 'email' && (
            <form onSubmit={handleEmail} className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-14 h-14 bg-groww-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiMail className="text-groww-green text-2xl" />
                </div>
                <h2 className="text-xl font-bold text-groww-text">Forgot Password?</h2>
                <p className="text-sm text-groww-muted mt-1">We'll send an OTP to your registered email</p>
              </div>
              <input id="fp-email" type="email" required placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} className="input-field" />
              {error && <p className="text-sm text-groww-red">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtp} className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-14 h-14 bg-groww-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiShield className="text-groww-green text-2xl" />
                </div>
                <h2 className="text-xl font-bold text-groww-text">Enter OTP</h2>
                {msg && <p className="text-sm text-groww-green mt-1">{msg}</p>}
                <p className="text-sm text-groww-muted mt-1">Sent to <strong>{email}</strong></p>
              </div>
              <input id="fp-otp" type="text" required placeholder="6-digit OTP" value={otp}
                onChange={(e) => setOtp(e.target.value)} maxLength={6} className="input-field text-center text-lg tracking-widest font-bold" />
              {error && <p className="text-sm text-groww-red">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-14 h-14 bg-groww-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiLock className="text-groww-green text-2xl" />
                </div>
                <h2 className="text-xl font-bold text-groww-text">Set New Password</h2>
                <p className="text-sm text-groww-muted mt-1">Choose a strong new password</p>
              </div>
              <input id="fp-newpw" type="password" required placeholder="New password" value={newPw}
                onChange={(e) => setNewPw(e.target.value)} className="input-field" />
              {error && <p className="text-sm text-groww-red">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-groww-green/10 rounded-full flex items-center justify-center mx-auto">
                <FiCheckCircle className="text-groww-green text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-groww-text">Password Reset!</h2>
              <p className="text-sm text-groww-muted">Your password has been reset successfully.</p>
              <button onClick={() => navigate('/login')} className="btn-primary w-full py-3 text-sm">
                Login Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
