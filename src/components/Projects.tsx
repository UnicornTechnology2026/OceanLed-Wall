import Reveal from './Reveal';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function Projects() {
  const { settings } = useSiteSettings();
  const projects = settings.projects;

  return (
    <section id="projects" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-ocean-dark" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-125 rounded-full blur-[160px] opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #00b4ff 0%, #7b5cff 50%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-ocean-cyan/20 bg-ocean-cyan/5 px-4 py-1.5 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-ocean-cyan animate-pulse" />
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-ocean-cyan">
              Featured Projects
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Selected{' '}
            <span className="bg-linear-to-r from-ocean-cyan to-ocean-blue bg-clip-text text-transparent">
              Work
            </span>
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-base text-white/55 leading-relaxed">
            Explore a selection of LED display installations across India.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <Reveal key={project.title} delay={(i % 3) * 120} className="h-full">
              <article
                className="card-lift h-full group overflow-hidden rounded-2xl border border-white/6 bg-white/2 hover:border-ocean-cyan/30 hover:shadow-[0_8px_40px_rgba(0,180,255,0.08)] transition-all duration-500"
              >
                <div className="aspect-16/10 overflow-hidden relative">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-ocean-dark via-ocean-dark/20 to-transparent opacity-80" />
                  <span className="absolute top-4 left-4 rounded-full bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-ocean-cyan">
                    {project.category}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-semibold text-white group-hover:text-ocean-cyan transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-white/40 tracking-wide">
                    {project.location}, India
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}