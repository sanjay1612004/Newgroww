import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Stocks from './pages/Stocks';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

// Pages that need the navbar
function WithNav({ Page }) {
  return <Layout><Page /></Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth pages — no navbar */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* App pages — with navbar */}
          <Route path="/"               element={<WithNav Page={Home} />} />
          <Route path="/stocks"         element={<WithNav Page={Stocks} />} />
          <Route path="/stocks/:searchId" element={<WithNav Page={StockDetail} />} />
          <Route path="/portfolio"      element={<WithNav Page={Portfolio} />} />
          <Route path="/watchlist"      element={<WithNav Page={Watchlist} />} />
          <Route path="/profile"        element={<WithNav Page={Profile} />} />
          <Route path="/admin"          element={<WithNav Page={AdminPanel} />} />

          {/* 404 */}
          <Route path="*" element={
            <Layout>
              <div className="max-w-xl mx-auto px-4 pt-40 text-center animate-fade-in">
                <p className="text-8xl font-extrabold text-groww-border mb-4">404</p>
                <h1 className="text-2xl font-bold text-groww-text mb-2">Page Not Found</h1>
                <p className="text-groww-muted mb-6">The page you're looking for doesn't exist.</p>
                <a href="/" className="btn-primary inline-block">Go Home</a>
              </div>
            </Layout>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
