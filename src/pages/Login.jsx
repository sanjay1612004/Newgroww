import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(form);
      const { accessToken, refreshToken } = res.data;
      loginWithTokens(accessToken, refreshToken, { email: form.email });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-groww-bg font-sans">
      
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-[#0F1219]">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-groww-green/10 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 mb-16">
            <img src="https://groww.in/groww-logo-270.png" alt="Groww" className="w-10 h-10 object-contain rounded-xl" />
            <span className="text-3xl font-extrabold tracking-tight text-white">groww</span>
          </div>
          
          <div className="max-w-md space-y-6">
            <h1 className="text-5xl font-extrabold leading-tight text-white">
              Invest in <span className="text-groww-green">Stocks</span>,<br />
              Mutual Funds,<br />
              and more.
            </h1>
            <p className="text-groww-muted text-lg leading-relaxed">
              Join millions of users who trust Groww for their investment journey. Simple, fast, and secure.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-groww-green text-xl shrink-0" />
            <p className="text-groww-muted font-medium">Zero account opening fee</p>
          </div>
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-groww-green text-xl shrink-0" />
            <p className="text-groww-muted font-medium">Paperless online KYC</p>
          </div>
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-groww-green text-xl shrink-0" />
            <p className="text-groww-muted font-medium">Bank-grade security</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <img src="https://groww.in/groww-logo-270.png" alt="Groww" className="w-9 h-9 object-contain rounded-lg" />
            <span className="text-2xl font-extrabold tracking-tight text-white">groww</span>
          </div>

          <div className="mb-10 lg:mb-12">
            <h2 className="text-3xl font-bold text-groww-text mb-2">Welcome Back</h2>
            <p className="text-groww-muted">Enter your details to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-groww-muted uppercase tracking-wider block mb-2">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-groww-surface border border-groww-border rounded-xl px-4 py-3.5 text-groww-text placeholder-groww-muted/60 focus:outline-none focus:border-groww-green focus:ring-1 focus:ring-groww-green transition-all duration-200 shadow-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-groww-muted uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-groww-green hover:text-groww-green-dark transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-groww-surface border border-groww-border rounded-xl px-4 py-3.5 pr-12 text-groww-text placeholder-groww-muted/60 focus:outline-none focus:border-groww-green focus:ring-1 focus:ring-groww-green transition-all duration-200 shadow-sm"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-groww-muted hover:text-groww-text transition-colors p-1">
                  {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-groww-red/10 border border-groww-red/20 rounded-xl px-4 py-3.5 animate-fade-in">
                <FiAlertCircle className="text-groww-red shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-groww-red leading-snug">{error}</p>
              </div>
            )}

            <button type="submit" id="login-submit" disabled={loading} 
              className="w-full bg-groww-green hover:bg-groww-green-dark text-[#0F1219] font-bold text-sm py-4 rounded-xl transition-all duration-200 shadow-lg shadow-groww-green/20 disabled:opacity-70 disabled:cursor-not-allowed mt-4">
              {loading ? 'Authenticating…' : 'Log In Securely'}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-groww-muted mt-8">
            New to Groww?{' '}
            <Link to="/register" className="text-groww-green hover:text-groww-green-dark transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
