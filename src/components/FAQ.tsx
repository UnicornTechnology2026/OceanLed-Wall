import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Reveal from './Reveal';

const FAQS = [
  {
    q: 'What is the price per sq ft of an LED display?',
    a: 'Pricing depends on pixel pitch, indoor or outdoor use, brightness, and screen size. Indoor fine-pitch screens cost more than outdoor large-pitch screens. Share your requirements through the contact form and we will send a detailed quote.',
  },
  {
    q: 'How long does delivery and installation take?',
    a: 'Standard screens are typically delivered within [X–Y] weeks of order confirmation. Custom or large installations may take longer. We will give you a clear timeline in your quote.',
  },
  {
    q: 'What warranty do you provide?',
    a: 'All our displays come with a [2-year] warranty covering manufacturing defects in LED modules, power supplies, and control systems. Extended warranty options are available.',
  },
  {
    q: 'Do you offer an AMC (Annual Maintenance Contract)?',
    a: 'Yes. Our AMC covers scheduled inspections, cleaning, firmware updates, and priority repair support, so your screen stays reliable after the warranty period.',
  },
  {
    q: 'How much power does an LED display consume?',
    a: 'Consumption varies by size, brightness, and content. As a rough guide, indoor screens use around [X] W per sq ft on average, and outdoor screens use more because of higher brightness. We will give you exact power figures for your project.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-20 md:py-28 bg-ocean-dark">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-ocean-cyan mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Frequently Asked{' '}
            <span className="bg-linear-to-r from-ocean-cyan to-ocean-blue bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
        </Reveal>

        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const open = openIndex === i;
            return (
              <Reveal key={item.q} delay={i * 80}>
                <div
                  className={`rounded-2xl border transition-colors duration-300 ${
                    open
                      ? 'border-ocean-cyan/30 bg-white/5'
                      : 'border-white/6 bg-white/2 hover:border-white/15'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? -1 : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-base font-semibold text-white">{item.q}</span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-ocean-cyan transition-transform duration-300 ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-white/60 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}