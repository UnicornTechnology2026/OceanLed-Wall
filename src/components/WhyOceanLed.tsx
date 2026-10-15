import Reveal from './Reveal';
import { Sparkles, Cpu, Shield, Settings } from 'lucide-react';

const REASONS = [
  {
    icon: Sparkles,
    title: 'Visual Quality',
    description:
      'Exceptional brightness, contrast, and color fidelity that make every pixel count.',
  },
  {
    icon: Cpu,
    title: 'Innovative Technology',
    description:
      'Cutting-edge LED modules and processing systems designed for next-generation displays.',
  },
  {
    icon: Shield,
    title: 'Dependable Performance',
    description:
      'Built for continuous operation with robust components and rigorous quality standards.',
  },
  {
    icon: Settings,
    title: 'Tailored Solutions',
    description:
      'Custom configurations and support to match the exact needs of your project.',
  },
];

export default function WhyOceanLed() {
  return (
    <section className="py-20 md:py-28 bg-ocean-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-14">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-ocean-cyan mb-3">
            Why OCEAN LED
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Engineered for Excellence
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REASONS.map((item, i) => (
            <Reveal key={item.title} direction="scale" delay={i * 120} className="h-full">
              <div
                className="card-lift h-full text-center p-6 rounded-2xl border border-white/5 bg-linear-to-b from-white/4 to-transparent"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ocean-blue/10 text-ocean-cyan animate-float">
                  <item.icon size={26} strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}