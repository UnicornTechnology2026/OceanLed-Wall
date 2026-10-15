import { useSiteSettings } from '../context/SiteSettingsContext';
import Reveal from './Reveal';
import CountUp from './CountUp';

export default function About() {
  const { settings } = useSiteSettings();
  const { image, since, projects, cities } = settings.about;

  return (
    <section id="about" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-ocean-navy" />
      <div
        className="animate-blob absolute top-0 right-0 w-125 h-125 rounded-full blur-[160px] opacity-15 pointer-events-none"
        style={{ background: '#00b4ff' }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Visual side */}
          <Reveal direction="left" className="relative order-2 lg:order-1">
            <div className="aspect-4/3 rounded-2xl overflow-hidden border border-white/10 relative shadow-[0_0_60px_rgba(0,180,255,0.1)]">
              <img
                src={image}
                alt="Modern LED display installation"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-linear-to-tr from-ocean-dark/70 via-ocean-dark/20 to-ocean-blue/20" />

              {/* Floating stats badge */}
              <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/50 tracking-wide uppercase">Since</p>
                  <p className="text-lg font-bold text-white"><CountUp value={since} /></p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="text-xs text-white/50 tracking-wide uppercase">Projects</p>
                  <p className="text-lg font-bold text-ocean-cyan"><CountUp value={projects} /></p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="text-xs text-white/50 tracking-wide uppercase">Cities</p>
                  <p className="text-lg font-bold text-white"><CountUp value={cities} /></p>
                </div>
              </div>
            </div>

            <div
              className="animate-blob absolute -bottom-8 -right-8 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ background: '#00b4ff' }}
            />
          </Reveal>

          {/* Content */}
          <Reveal direction="right" className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-ocean-cyan/20 bg-ocean-cyan/5 px-4 py-1.5 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-ocean-cyan animate-pulse" />
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-ocean-cyan">
                About OCEAN LED
              </p>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 leading-[1.15]">
              Illuminating Spaces{' '}
              <span className="bg-linear-to-r from-ocean-cyan to-ocean-blue bg-clip-text text-transparent">
                with Precision
              </span>
            </h2>

            <div className="space-y-5 text-white/60 leading-relaxed">
              <p>
                OCEAN LED specializes in advanced LED display solutions for commercial,
                entertainment, and architectural applications. We focus on delivering
                high-performance screens and systems that combine visual excellence with
                dependable engineering.
              </p>
              <p>
                Our portfolio spans indoor and outdoor LED displays, video walls, digital
                signage, and fully custom installations. Every project is approached with
                attention to detail—from pixel pitch selection to system integration—so
                that the final result exceeds expectations.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {['Pan-India Service', '2-Year Warranty', '24/7 Support', 'Custom Design'].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/3 px-4 py-1.5 text-xs font-medium text-white/60"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}