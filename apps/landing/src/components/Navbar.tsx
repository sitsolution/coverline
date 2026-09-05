import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Features',     href: '#features'   },
  { label: 'How It Works', href: '#how-it-works'},
  { label: 'For Hospitals',href: '#hospitals'   },
  { label: 'For Staff',    href: '#staff'       },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-line' : 'bg-transparent'
      }`}
    >
      <div className="container-lg flex items-center justify-between h-[68px] px-6 md:px-10 lg:px-16">
        {/* Logo */}
        <a href="/" className="flex items-center gap-[10px] flex-shrink-0">
          <div className="w-8 h-8 rounded-[9px] bg-navy flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M2 12h4l2-7 4 14 2-9 2 5h6" stroke="#5FB4E0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className={`font-display font-extrabold text-[17px] tracking-tight transition-colors ${scrolled ? 'text-navy-3' : 'text-white'}`}>
            Coverline
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-[2px]">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={`px-4 py-2 rounded-lg text-[13.5px] font-semibold transition-colors ${
                scrolled ? 'text-slate hover:text-navy hover:bg-sky' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#"
            className={`text-[13px] font-bold px-4 py-[8px] rounded-[9px] border-[1.5px] transition-colors ${
              scrolled
                ? 'border-navy text-navy hover:bg-sky'
                : 'border-white/50 text-white hover:border-white hover:bg-white/10'
            }`}
          >
            Sign In
          </a>
          <a
            href="#"
            className="text-[13px] font-bold px-4 py-[8px] rounded-[9px] bg-sky-3 text-white hover:bg-navy-2 transition-colors"
          >
            Get Started Free
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className={`w-5 h-[1.5px] mb-[5px] transition-all ${scrolled ? 'bg-ink' : 'bg-white'}`} style={{ transform: menuOpen ? 'rotate(45deg) translate(4.5px, 4.5px)' : 'none' }} />
          <div className={`w-5 h-[1.5px] mb-[5px] transition-all ${scrolled ? 'bg-ink' : 'bg-white'} ${menuOpen ? 'opacity-0' : ''}`} />
          <div className={`w-5 h-[1.5px] transition-all ${scrolled ? 'bg-ink' : 'bg-white'}`} style={{ transform: menuOpen ? 'rotate(-45deg) translate(4.5px, -4.5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-line px-6 py-4 shadow-lg">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-[14px] font-semibold text-slate hover:text-navy border-b border-line last:border-0"
            >
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-4">
            <a href="#" className="text-center text-[13px] font-bold py-[10px] rounded-[9px] border-[1.5px] border-navy text-navy">
              Sign In
            </a>
            <a href="#" className="text-center text-[13px] font-bold py-[10px] rounded-[9px] bg-navy text-white">
              Get Started Free
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
