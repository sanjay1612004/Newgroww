import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, login } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function Register() {
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      const loginRes = await login({ email: form.email, password: form.password });
      const { accessToken, refreshToken } = loginRes.data;
      loginWithTokens(accessToken, refreshToken, { name: form.name, email: form.email });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pwChecks = [
    { label: 'At least 8 characters',  ok: form.password.length >= 8 },
    { label: 'Contains uppercase letter', ok: /[A-Z]/.test(form.password) },
    { label: 'Contains a number',       ok: /\d/.test(form.password) },
  ];

  return (
    <div className="min-h-screen flex bg-groww-bg font-sans">
      
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-[#0F1219]">
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
              Start your <br />
              <span className="text-groww-green">investment</span><br />
              journey today.
            </h1>
            <p className="text-groww-muted text-lg leading-relaxed">
              Create an account in minutes and get access to the best investment tools, analytics, and market news.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-groww-green text-xl shrink-0" />
            <p className="text-groww-muted font-medium">Free Demat account</p>
          </div>
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-groww-green text-xl shrink-0" />
            <p className="text-groww-muted font-medium">Zero maintenance charges</p>
          </div>
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-groww-green text-xl shrink-0" />
            <p className="text-groww-muted font-medium">100% Secure & Regulated</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <img src="https://groww.in/groww-logo-270.png" alt="Groww" className="w-9 h-9 object-contain rounded-lg" />
            <span className="text-2xl font-extrabold tracking-tight text-white">groww</span>
          </div>

          <div className="mb-10 lg:mb-12">
            <h2 className="text-3xl font-bold text-groww-text mb-2">Create Account</h2>
            <p className="text-groww-muted">Enter your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-groww-muted uppercase tracking-wider block mb-2">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                required
                placeholder="e.g. Vishal Kumar"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-groww-surface border border-groww-border rounded-xl px-4 py-3.5 text-groww-text placeholder-groww-muted/60 focus:outline-none focus:border-groww-green focus:ring-1 focus:ring-groww-green transition-all duration-200 shadow-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-groww-muted uppercase tracking-wider block mb-2">
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-groww-surface border border-groww-border rounded-xl px-4 py-3.5 text-groww-text placeholder-groww-muted/60 focus:outline-none focus:border-groww-green focus:ring-1 focus:ring-groww-green transition-all duration-200 shadow-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-groww-muted uppercase tracking-wider block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-groww-surface border border-groww-border rounded-xl px-4 py-3.5 pr-12 text-groww-text placeholder-groww-muted/60 focus:outline-none focus:border-groww-green focus:ring-1 focus:ring-groww-green transition-all duration-200 shadow-sm"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-groww-muted hover:text-groww-text transition-colors p-1">
                  {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              
              {form.password && (
                <div className="mt-3 space-y-1.5 px-1 animate-fade-in">
                  {pwChecks.map((c, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs font-medium ${c.ok ? 'text-groww-green' : 'text-groww-muted'}`}>
                      <FiCheckCircle className={c.ok ? 'text-groww-green' : 'text-groww-border'} size={14} /> {c.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-groww-red/10 border border-groww-red/20 rounded-xl px-4 py-3.5 animate-fade-in">
                <FiAlertCircle className="text-groww-red shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-groww-red leading-snug">{error}</p>
              </div>
            )}

            <button type="submit" id="register-submit" disabled={loading} 
              className="w-full bg-groww-green hover:bg-groww-green-dark text-[#0F1219] font-bold text-sm py-4 rounded-xl transition-all duration-200 shadow-lg shadow-groww-green/20 disabled:opacity-70 disabled:cursor-not-allowed mt-4">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-groww-muted mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-groww-green hover:text-groww-green-dark transition-colors">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
