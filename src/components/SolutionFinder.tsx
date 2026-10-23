import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  Clock,
  Check,
  Ruler,
  RotateCcw,
  ShieldCheck,
  Sun,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Reveal from "./Reveal";
import { useSiteSettings } from "../context/SiteSettingsContext";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Environment = "indoor" | "outdoor";
type Location =
  | "showroom"
  | "corporate"
  | "hospitality"
  | "control"
  | "window"
  | "facade"
  | "roadside"
  | "ground"
  | "shopfront"
  | "stage";
type Size = "small" | "medium" | "large" | "xl";
type Distance = "close" | "near" | "mid" | "far";
type Budget = "economy" | "standard" | "premium" | "unsure";

interface Answers {
  environment: Environment;
  location: Location;
  size: Size;
  distance: Distance;
  budget?: Budget;
}

type StepKey = "environment" | "location" | "size" | "distance" | "budget";

interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
  icon?: LucideIcon;
}

interface Recommendation {
  title: string;
  pitch: string;
  brightness: string;
  protection: string;
  cabinet: string;
  notes: string[];
}

/* ------------------------------------------------------------------ */
/* Question data                                                       */
/* ------------------------------------------------------------------ */

const STEPS: { key: StepKey; title: string }[] = [
  { key: "environment", title: "Indoor or outdoor?" },
  { key: "location", title: "Where will it be installed?" },
  { key: "size", title: "Approximate screen size?" },
  { key: "distance", title: "How far will viewers be?" },
  { key: "budget", title: "Project budget (optional)" },
];

const ENVIRONMENTS: Option<Environment>[] = [
  {
    value: "indoor",
    label: "Indoor",
    hint: "Inside a building",
    icon: Building2,
  },
  {
    value: "outdoor",
    label: "Outdoor",
    hint: "Exposed to sun and rain",
    icon: Sun,
  },
];

const LOCATIONS: Record<Environment, Option<Location>[]> = {
  indoor: [
    { value: "showroom", label: "Showroom / Retail / Mall" },
    { value: "corporate", label: "Office / Boardroom / Lobby" },
    { value: "hospitality", label: "Hotel / Banquet / Worship / Institute" },
    { value: "control", label: "Control room / Studio" },
    { value: "window", label: "Window display (facing the street)" },
    { value: "stage", label: "Stage / Event (rental)" },
  ],
  outdoor: [
    { value: "facade", label: "Building facade / Hoarding" },
    { value: "roadside", label: "Roadside / Highway" },
    { value: "shopfront", label: "Shop front / Pole mount" },
    { value: "ground", label: "Stadium / Ground / Campus" },
    { value: "stage", label: "Stage / Event (rental)" },
  ],
};

const SIZES: Option<Size>[] = [
  { value: "small", label: "Small", hint: "Up to ~30 sq ft (e.g. 6 × 5 ft)" },
  { value: "medium", label: "Medium", hint: "30 – 100 sq ft (e.g. 12 × 8 ft)" },
  { value: "large", label: "Large", hint: "100 – 300 sq ft (e.g. 20 × 12 ft)" },
  { value: "xl", label: "Extra large", hint: "300+ sq ft (e.g. 30 × 15 ft)" },
];

const DISTANCES: Option<Distance>[] = [
  {
    value: "close",
    label: "Under 2 m",
    hint: "Boardroom, counter, close-up viewing",
  },
  { value: "near", label: "2 – 5 m", hint: "Showroom, lobby, small hall" },
  { value: "mid", label: "5 – 10 m", hint: "Large hall, atrium, stage" },
  { value: "far", label: "10 m and above", hint: "Roadside, facade, stadium" },
];

const BUDGETS: Option<Budget>[] = [
  {
    value: "economy",
    label: "Economy",
    hint: "Keep the cost as low as possible",
  },
  { value: "standard", label: "Standard", hint: "Balanced price and quality" },
  {
    value: "premium",
    label: "Premium",
    hint: "Best quality, cost is secondary",
  },
  { value: "unsure", label: "Not sure yet", hint: "Help me decide" },
];

const LABELS = {
  environment: Object.fromEntries(ENVIRONMENTS.map((o) => [o.value, o.label])),
  location: Object.fromEntries(
    [...LOCATIONS.indoor, ...LOCATIONS.outdoor].map((o) => [o.value, o.label]),
  ),
  size: Object.fromEntries(
    SIZES.map((o) => [o.value, `${o.label} (${o.hint})`]),
  ),
  distance: Object.fromEntries(DISTANCES.map((o) => [o.value, o.label])),
  budget: Object.fromEntries(BUDGETS.map((o) => [o.value, o.label])),
} as Record<StepKey, Record<string, string>>;

function optionsFor(key: StepKey, environment?: Environment): Option<string>[] {
  switch (key) {
    case "environment":
      return ENVIRONMENTS;
    case "location":
      return environment ? LOCATIONS[environment] : [];
    case "size":
      return SIZES;
    case "distance":
      return DISTANCES;
    case "budget":
      return BUDGETS;
  }
}

/* ------------------------------------------------------------------ */
/* Recommendation logic                                                */
/* ------------------------------------------------------------------ */

// Pixel pitch by viewing distance: [under 2 m, 2-5 m, 5-10 m, 10 m+]
const PITCH_TABLE = {
  indoor: ["P1.5", "P2.5", "P4", "P6"],
  outdoor: ["P3", "P4", "P6", "P10"],
  indoorRental: ["P2.6", "P2.9", "P3.9", "P4.8"],
  outdoorRental: ["P3.9", "P3.9", "P4.8", "P6"],
};

const DISTANCE_INDEX: Record<Distance, number> = {
  close: 0,
  near: 1,
  mid: 2,
  far: 3,
};

const pitchNumber = (pitch: string) => Number(pitch.slice(1));

function recommend(a: Answers): Recommendation {
  const isOutdoor = a.environment === "outdoor";
  const isRental = a.location === "stage";
  const family = isRental
    ? isOutdoor
      ? PITCH_TABLE.outdoorRental
      : PITCH_TABLE.indoorRental
    : isOutdoor
      ? PITCH_TABLE.outdoor
      : PITCH_TABLE.indoor;

  const pitch = family[DISTANCE_INDEX[a.distance]];

  let title: string;
  if (isRental)
    title = `${isOutdoor ? "Outdoor" : "Indoor"} Rental LED Display`;
  else if (isOutdoor) title = "Outdoor LED Display";
  else if (a.location === "window")
    title = "High-Brightness Window LED Display";
  else if (a.distance === "close") title = "Indoor Fine-Pitch LED Video Wall";
  else title = "Indoor LED Video Wall";

  let brightness = isOutdoor ? "5,000 – 7,500 nits" : "800 – 1,500 nits";
  if (a.location === "window") brightness = "2,500 – 4,500 nits";

  const cabinet = isRental
    ? "500 × 500 mm / 500 × 1000 mm lightweight die-cast cabinets"
    : isOutdoor
      ? "960 × 960 mm weatherproof cabinets"
      : "640 × 480 mm / 500 × 500 mm cabinets";

  const notes: string[] = [
    `Best viewed from about ${pitchNumber(pitch)} m and beyond.`,
  ];

  if (a.location === "control") {
    notes.push(
      "For 24×7 use, choose cabinets rated for continuous operation with front service access.",
    );
  }
  if (isRental) {
    notes.push(
      "Rental cabinets are lightweight and lock together quickly, with flight cases for transport.",
    );
  }
  if (a.size === "xl") {
    notes.push(
      "A wall this large needs structural and power planning, so a site survey is recommended.",
    );
  }

  const coarser = family.find((p) => pitchNumber(p) > pitchNumber(pitch));
  if (a.budget === "economy" && coarser) {
    notes.push(
      `To reduce cost, ${coarser} also works if viewers stay beyond about ${pitchNumber(coarser)} m.`,
    );
  }
  if (a.budget === "premium") {
    notes.push(
      "For the best picture quality, ask about COB / Mini-LED options and a higher refresh rate for camera use.",
    );
  }
  notes.push("Final specifications are confirmed after a site survey.");

  return {
    title,
    pitch,
    brightness,
    protection: isOutdoor ? "IP65" : "IP30",
    cabinet,
    notes,
  };
}

/* ------------------------------------------------------------------ */
/* Extra text shown with each step                                     */
/* ------------------------------------------------------------------ */

const STEP_HELP: Record<StepKey, string> = {
  environment:
    "Outdoor screens need much higher brightness and an IP65 weatherproof seal. Indoor screens focus on finer detail and a smooth picture.",
  location:
    "Where the screen goes decides the cabinet type, the brightness and how it is installed and serviced.",
  size: "A rough size is enough. We confirm exact dimensions and cabinet count after a site survey.",
  distance:
    "The distance to your viewers decides the pixel pitch. Closer viewing needs a finer pitch for a sharp picture.",
  budget:
    "Optional. This only helps us suggest the best balance of picture quality and cost.",
};

const HIGHLIGHTS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Ruler,
    title: "Right pixel pitch",
    text: "Matched to how far your viewers stand, so you never overpay for detail nobody can see.",
  },
  {
    icon: Zap,
    title: "Brightness that fits",
    text: "From 800 nits for indoor halls to 7,500 nits for harsh direct sunlight.",
  },
  {
    icon: ShieldCheck,
    title: "Built for your conditions",
    text: "IP30 for indoor use and IP65 hermetic sealing for rain, dust and heat.",
  },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface ContactForm {
  name: string;
  phone: string;
  email: string;
}

type FormErrors = Partial<Record<keyof ContactForm, string>>;

const inputClass =
  "w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#00e5ff]/50 focus:ring-2 focus:ring-[#00e5ff]/20";

export default function SolutionFinder() {
  const { addInquiry } = useSiteSettings();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [form, setForm] = useState<ContactForm>({
    name: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);

  const finished = step >= STEPS.length;
  const complete =
    answers.environment && answers.location && answers.size && answers.distance;
  const recommendation =
    finished && complete ? recommend(answers as Answers) : null;

  const choose = (key: StepKey, value: string) => {
    setAnswers((prev) => {
      if (key === "environment") {
        // Locations differ for indoor / outdoor, so clear the old one.
        return { environment: value as Environment };
      }
      return { ...prev, [key]: value };
    });
    setStep((s) => s + 1);
  };

  const skipBudget = () => {
    setAnswers((prev) => ({ ...prev, budget: undefined }));
    setStep((s) => s + 1);
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setForm({ name: "", phone: "", email: "" });
    setErrors({});
    setSent(false);
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Please enter your name";
    if (form.phone.replace(/\D/g, "").length < 10)
      next.phone = "Enter a valid phone number";
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = "Enter a valid email";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!recommendation || !validate()) return;

    const lines = [
      "LED Solution Finder enquiry",
      "",
      `Environment: ${LABELS.environment[answers.environment!]}`,
      `Location: ${LABELS.location[answers.location!]}`,
      `Screen size: ${LABELS.size[answers.size!]}`,
      `Viewing distance: ${LABELS.distance[answers.distance!]}`,
      `Budget: ${answers.budget ? LABELS.budget[answers.budget] : "Not provided"}`,
      "",
      `Suggested: ${recommendation.title}, ${recommendation.pitch}`,
      `Brightness: ${recommendation.brightness}, ${recommendation.protection}`,
    ];

    addInquiry({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      message: lines.join("\n"),
    });
    setSent(true);
  };

  const current = STEPS[step];
  const progress = Math.min(step, STEPS.length) / STEPS.length;

  return (
    <section
      id="finder"
      className="relative overflow-hidden bg-ocean-dark py-20 md:py-28"
    >
      {/* soft lime glow, same as the product section */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_25%,rgba(212,255,0,0.07),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-ocean-blue/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.25fr] lg:gap-14 lg:px-8">
        {/* ───────── SECTION 1 : TEXT ───────── */}
        <Reveal direction="left" className="lg:sticky lg:top-28">
          <h2 className="mt-5 text-3xl font-extrabold uppercase leading-[0.95] tracking-tighter text-white sm:text-5xl lg:text-6xl">
            Find the right LED display
            <span className="block bg-linear-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
              for your space.
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-lg">
            Answer five simple questions about where the screen goes, how big it
            is and how far people will stand. We suggest the right pixel pitch,
            brightness and cabinet type for your project.
          </p>

          <ul className="mt-8 space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ocean-cyan/25 bg-ocean-cyan/6">
                  <Icon size={20} className="text-ocean-cyan" />
                </span>
                <span>
                  <span className="block text-sm font-bold uppercase tracking-wide text-white">
                    {title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-white/55">
                    {text}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40">
            <Clock size={14} className="text-ocean-cyan" />
            Takes under a minute · No obligation · Free site survey
          </p>
        </Reveal>

        {/* ───────── SECTION 2 : FINDER CARD ───────── */}
        <Reveal direction="right" delay={100}>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] p-6 shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:p-8">
            {/* lime top edge highlight */}
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

            {/* Progress */}
            <div className="mb-7 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-ocean-cyan shadow-[0_0_12px_rgba(212,255,0,0.6)] transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* Questions */}
            {!finished && current && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/45">
                  <span className="h-2 w-2 rounded-full bg-ocean-cyan shadow-[0_0_10px_rgba(212,255,0,0.9)]" />
                  Step {step + 1} of {STEPS.length}
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-white">
                  {current.title}
                </h3>
                <p className="mt-2 mb-6 text-sm leading-relaxed text-white/55">
                  {STEP_HELP[current.key]}
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {optionsFor(current.key, answers.environment).map((opt) => {
                    const selected = answers[current.key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => choose(current.key, opt.value)}
                        className="btn-choice group items-start gap-3 p-4 text-left"
                      >
                        {opt.icon && (
                          <opt.icon
                            size={22}
                            className="mt-0.5 shrink-0 text-ocean-cyan"
                          />
                        )}
                        <span className="flex-1">
                          <span className="block text-sm font-semibold text-white">
                            {opt.label}
                          </span>
                          {opt.hint && (
                            <span className="mt-0.5 block text-xs text-white/50">
                              {opt.hint}
                            </span>
                          )}
                        </span>
                        <ArrowRight
                          size={16}
                          className="mt-1 shrink-0 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-ocean-cyan"
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      className="btn-link"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                  ) : (
                    <span />
                  )}
                  {current.key === "budget" && (
                    <button
                      type="button"
                      onClick={skipBudget}
                      className="btn-link"
                    >
                      Skip this question
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Result */}
            {recommendation && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ocean-cyan">
                  <span className="h-2 w-2 rounded-full bg-ocean-cyan shadow-[0_0_10px_rgba(212,255,0,0.9)]" />
                  Suggested for you
                </p>
                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
                  {recommendation.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  This is a starting point based on your answers. Our engineers
                  confirm the final specification after a site survey.
                </p>

                <dl className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    ["Pixel pitch", recommendation.pitch],
                    ["Brightness", recommendation.brightness],
                    ["Protection", recommendation.protection],
                    ["Cabinets", recommendation.cabinet],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/10 bg-white/3 p-4"
                    >
                      <dt className="text-xs uppercase tracking-wider text-white/40">
                        {label}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-white">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <ul className="mt-6 space-y-2.5 text-sm text-white/65">
                  {recommendation.notes.map((note) => (
                    <li key={note} className="flex items-start gap-2.5">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-ocean-cyan"
                      />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 border-t border-white/10 pt-6">
                  {sent ? (
                    <div className="rounded-2xl border border-ocean-cyan/30 bg-ocean-cyan/6 p-8 text-center">
                      <CheckCircle
                        className="mx-auto mb-3 text-ocean-cyan"
                        size={44}
                        strokeWidth={1.5}
                      />
                      <h4 className="mb-1 text-lg font-bold uppercase tracking-wide text-white">
                        Request Received
                      </h4>
                      <p className="text-sm text-white/60">
                        Our team will contact you shortly with a tailored
                        recommendation and quote.
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-4"
                    >
                      <div>
                        <h4 className="text-base font-bold uppercase tracking-wide text-white">
                          Want a detailed proposal?
                        </h4>
                        <p className="mt-1 text-sm text-white/50">
                          Leave your details and our team will send a full
                          recommendation and quote.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="finder-name"
                            className="mb-1.5 block text-sm text-white/70"
                          >
                            Name *
                          </label>
                          <input
                            id="finder-name"
                            type="text"
                            value={form.name}
                            onChange={(e) =>
                              setForm({ ...form, name: e.target.value })
                            }
                            placeholder="Your name"
                            className={`${inputClass} ${errors.name ? "border-red-400/60" : "border-white/10"}`}
                          />
                          {errors.name && (
                            <p className="mt-1 text-xs text-red-400">
                              {errors.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="finder-phone"
                            className="mb-1.5 block text-sm text-white/70"
                          >
                            Phone *
                          </label>
                          <input
                            id="finder-phone"
                            type="tel"
                            value={form.phone}
                            onChange={(e) =>
                              setForm({ ...form, phone: e.target.value })
                            }
                            placeholder="+91 98765 43210"
                            className={`${inputClass} ${errors.phone ? "border-red-400/60" : "border-white/10"}`}
                          />
                          {errors.phone && (
                            <p className="mt-1 text-xs text-red-400">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="finder-email"
                          className="mb-1.5 block text-sm text-white/70"
                        >
                          Email (optional)
                        </label>
                        <input
                          id="finder-email"
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          placeholder="you@company.com"
                          className={`${inputClass} ${errors.email ? "border-red-400/60" : "border-white/10"}`}
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-400">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-ocean-cyan px-6 py-4 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_30px_rgba(212,255,0,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(212,255,0,0.55)]"
                      >
                        Get My Recommendation
                        <span className="h-1.5 w-1.5 rounded-full bg-black" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {finished && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={restart}
                  className="inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-ocean-cyan"
                >
                  <RotateCcw size={14} /> Start over
                </button>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
