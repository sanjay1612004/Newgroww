import { Link } from 'react-router-dom';
import { FiTrendingUp, FiGithub, FiTwitter, FiLinkedin, FiMail, FiHeart } from 'react-icons/fi';

const footerLinks = {
  Products: [
    { label: 'Stocks', to: '/stocks' },
    { label: 'Portfolio', to: '/portfolio' },
    { label: 'Watchlist', to: '/watchlist' },
    { label: 'IPOs', to: '#' },
  ],
  Company: [
    { label: 'About Us', to: '#' },
    { label: 'Careers', to: '#' },
    { label: 'Blog', to: '#' },
    { label: 'Press', to: '#' },
  ],
  Support: [
    { label: 'Help Center', to: '#' },
    { label: 'Contact Us', to: '#' },
    { label: 'FAQs', to: '#' },
    { label: 'KYC Policy', to: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
    { label: 'Disclosures', to: '#' },
    { label: 'Refund Policy', to: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-groww-surface border-t border-groww-border mt-16">
      {/* Main footer content */}
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 group mb-4">
              <img src="https://groww.in/groww-logo-270.png" alt="Groww" className="w-10 h-10 object-contain rounded-xl" />

              <span className="text-xl font-extrabold text-groww-text tracking-tight">
                Groww
              </span>
            </Link>
            <p className="text-groww-muted text-sm leading-relaxed mb-5">
              India's trusted investment platform. Simple, transparent & secure stock trading.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: <FiGithub />, href: '#' },
                { icon: <FiTwitter />, href: '#' },
                { icon: <FiLinkedin />, href: '#' },
                { icon: <FiMail />, href: '#' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-9 h-9 rounded-lg bg-groww-card border border-groww-border flex items-center justify-center
                             text-groww-muted hover:text-groww-green hover:border-groww-green/40 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-bold text-groww-text mb-4 uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-groww-muted hover:text-groww-green transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-groww-border/50">
          <div className="bg-groww-card/50 rounded-xl px-5 py-4 border border-groww-border/30">
            <p className="text-xs text-groww-muted leading-relaxed">
              <span className="text-groww-yellow font-semibold">⚠ Disclaimer:</span>{' '}
              Investments in securities market are subject to market risks. Read all related documents carefully before investing.
              Registration granted by SEBI and certification from NISM in no way guarantee performance of the intermediary or
              provide any assurance of returns to investors. This is a demo/educational project and not a real trading platform.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-groww-border/50 bg-groww-dark/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-groww-muted">
            © {new Date().getFullYear()} Groww. All rights reserved.
          </p>
          <p className="text-xs text-groww-muted flex items-center gap-1">
            Made with <FiHeart className="text-groww-red text-[10px]" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
