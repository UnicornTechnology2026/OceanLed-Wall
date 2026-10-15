import Reveal from './Reveal';
import { Monitor, Building2, Sun, LayoutGrid, Wrench } from 'lucide-react';

const SOLUTIONS = [
  {
    icon: LayoutGrid,
    title: 'LED Video Walls',
    description:
      'Seamless large-format video walls for control rooms, lobbies, and immersive environments.',
  },
  {
    icon: Monitor,
    title: 'Indoor LED Displays',
    description:
      'High-resolution indoor screens with exceptional color accuracy and fine pixel pitch.',
  },
  {
    icon: Sun,
    title: 'Outdoor LED Displays',
    description:
      'Weather-resistant, high-brightness outdoor solutions built for visibility in any condition.',
  },
  {
    icon: Building2,
    title: 'Digital Signage',
    description:
      'Dynamic digital signage systems for retail, hospitality, and corporate communications.',
  },
  {
    icon: Wrench,
    title: 'Custom LED Installations',
    description:
      'Bespoke LED designs tailored to unique architectural and creative requirements.',
  },
];

export default function Solutions() {
  return (
    <section id="solutions" className="py-20 md:py-28 bg-ocean-navy">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-14">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-ocean-cyan mb-3">
            Our Solutions
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            LED Technology That Performs
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-white/60">
            From indoor video walls to outdoor spectaculars, we deliver display solutions
            engineered for impact and reliability.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SOLUTIONS.map((item, i) => (
            <Reveal key={item.title} delay={i * 100} className="h-full">
              <div
                className="card-lift h-full group rounded-2xl border border-white/8 bg-white/3 p-6 hover:border-ocean-blue/40 hover:bg-white/6 transition-all duration-300"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ocean-blue/15 text-ocean-cyan group-hover:bg-ocean-blue/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <item.icon size={24} strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}