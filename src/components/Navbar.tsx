import { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { Menu, X } from 'lucide-react';
import OceanLedLogo from './OceanLedLogo';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Process', href: '#process' },
  { label: 'Projects', href: '#projects' },
  { label: 'About Us', href: '#about' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ocean-dark/90 backdrop-blur-md border-b border-white/5 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 md:h-20">
        {/* Logo + Name */}
        <a
          href="#home"
          onClick={(e) => handleClick(e, '#home')}
          className="flex items-center gap-3 group"
        >
          <OceanLedLogo size={40} className="shadow-none!" />
          <span className="text-lg font-bold tracking-wide text-white group-hover:text-ocean-cyan transition-colors">
            OCEAN LED
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className="text-sm font-medium text-white/80 hover:text-ocean-cyan transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}

                {onOpenAdmin && (
    <button type="button" onClick={onOpenAdmin}
      className="text-xs text-white/30 hover:text-ocean-cyan transition-colors">
      Admin
    </button>
  )}
        </ul>

        {/* CTA */}
        <div className="hidden lg:block">
    
          <a
            href="#contact"
            onClick={(e) => handleClick(e, '#contact')}
            className="inline-flex items-center rounded-full bg-linear-to-r from-ocean-blue to-ocean-cyan px-5 py-2.5 text-sm font-semibold text-ocean-dark shadow-lg shadow-ocean-blue/25 hover:shadow-ocean-cyan/40 hover:scale-[1.02] transition-all"
          >
            Get a Quote
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="lg:hidden p-2 text-white hover:text-ocean-cyan transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-ocean-dark/95 backdrop-blur-md border-t border-white/5 px-4 pb-6 pt-2">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className="block py-3 text-base font-medium text-white/90 hover:text-ocean-cyan transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-3">
              <a
                href="#contact"
                onClick={(e) => handleClick(e, '#contact')}
                className="block w-full text-center rounded-full bg-linear-to-r from-ocean-blue to-ocean-cyan px-5 py-3 text-sm font-semibold text-ocean-dark"
              >
                Get a Quote
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
