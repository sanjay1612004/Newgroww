import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../api/authApi';
import { FiLogOut, FiShield } from 'react-icons/fi';

export default function AdminLayout({ children }) {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logout(); } catch {}
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0F1219] text-white font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F1219] border-b border-groww-green/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8  rounded-lg flex items-center justify-center">
            <img src="https://groww.in/groww-logo-270.png" alt="" />
          </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white block leading-tight">groww</span>
              <span className="text-[10px] uppercase tracking-wider text-groww-green font-semibold block leading-tight">Admin Console</span>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-groww-red hover:bg-groww-red/10 border border-transparent hover:border-groww-red/20 px-4 py-2 rounded-xl transition-all font-medium">
            <FiLogOut /> Secure Logout
          </button>
        </div>
      </nav>
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
