import Reveal from './Reveal';
import { MessageSquare, PencilRuler, Truck, Headset } from 'lucide-react';

const STEPS = [
  {
    icon: MessageSquare,
    title: 'Consultation',
    description:
      'We understand your space, viewing distance, budget, and goals, then recommend the right display type and pixel pitch.',
  },
  {
    icon: PencilRuler,
    title: 'Design',
    description:
      'Our team prepares the screen layout, structure, and content plan, with a preview so you know the result before we build.',
  },
  {
    icon: Truck,
    title: 'Installation',
    description:
      'Professional delivery, mounting, wiring, and calibration by trained technicians, with minimal disruption to your site.',
  },
  {
    icon: Headset,
    title: 'Maintenance',
    description:
      'Ongoing support, regular health checks, and quick repairs to keep your display running at its best.',
  },
];

export default function Process() {
  return (
    <section id="process" className="py-20 md:py-28 bg-ocean-navy">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-ocean-cyan mb-3">
            How We Work
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            From Idea to{' '}
            <span className="bg-linear-to-r from-ocean-cyan to-ocean-blue bg-clip-text text-transparent">
              Illumination
            </span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-white/60">
            A simple, transparent 4-step process from your first call to long-term support.
          </p>
        </Reveal>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Connecting line (desktop only) */}
          <div className="line-draw hidden lg:block absolute top-13 left-[12%] right-[12%] h-px bg-linear-to-r from-transparent via-ocean-cyan/30 to-transparent" />

          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 150} className="h-full">
              <div
                className="card-lift h-full relative rounded-2xl border border-white/6 bg-white/3 p-6 text-center hover:border-ocean-cyan/30 transition-colors duration-300"
              >
                <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-ocean-dark border border-ocean-cyan/30 text-ocean-cyan">
                  <step.icon size={26} strokeWidth={1.75} />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-r from-ocean-blue to-ocean-cyan text-xs font-bold text-ocean-dark">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}