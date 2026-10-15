import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Sun,
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
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface ContactForm {
  name: string;
  phone: string;
  email: string;
}

type FormErrors = Partial<Record<keyof ContactForm, string>>;

const inputClass =
  "w-full rounded-xl border bg-white/4 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:ring-2 focus:ring-ocean-cyan/40 focus:border-ocean-cyan/40 transition";

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
      className="relative py-20 md:py-28 bg-ocean-navy overflow-hidden"
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-75 rounded-full blur-[140px] opacity-15 pointer-events-none"
        style={{ background: "#00b4ff" }}
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-ocean-cyan/20 bg-ocean-cyan/5 px-4 py-1.5 mb-5">
              <Sparkles size={14} className="text-ocean-cyan" />
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-ocean-cyan">
                LED Solution Finder
              </p>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Find the Right{" "}
              <span className="bg-linear-to-r from-ocean-cyan to-ocean-blue bg-clip-text text-transparent">
                LED Display
              </span>
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-base text-white/55 leading-relaxed">
              Answer a few quick questions and get a suggested display for your
              space.
            </p>
          </div>
        </Reveal>

        <div className="rounded-2xl border border-white/6 bg-white/2 p-6 sm:p-8">
          {/* Progress */}
          <div className="mb-6 h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-ocean-blue to-ocean-cyan transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Questions */}
          {!finished && current && (
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-white/40 mb-1">
                Step {step + 1} of {STEPS.length}
              </p>
              <h3 className="text-xl font-semibold text-white mb-5">
                {current.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {optionsFor(current.key, answers.environment).map((opt) => {
                  const selected = answers[current.key] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => choose(current.key, opt.value)}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:border-ocean-cyan/40 hover:bg-ocean-cyan/5 ${
                        selected
                          ? "border-ocean-cyan/50 bg-ocean-cyan/10"
                          : "border-white/10 bg-white/3"
                      }`}
                    >
                      {opt.icon && (
                        <opt.icon
                          size={20}
                          className="mt-0.5 shrink-0 text-ocean-cyan"
                        />
                      )}
                      <span>
                        <span className="block text-sm font-medium text-white">
                          {opt.label}
                        </span>
                        {opt.hint && (
                          <span className="block mt-0.5 text-xs text-white/45">
                            {opt.hint}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-ocean-cyan transition-colors"
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
                    className="text-sm text-ocean-cyan hover:underline"
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
              <p className="text-xs font-medium tracking-wider uppercase text-ocean-cyan mb-1">
                Suggested for you
              </p>
              <h3 className="text-2xl font-bold text-white">
                {recommendation.title}
              </h3>

              <dl className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ["Pixel pitch", recommendation.pitch],
                  ["Brightness", recommendation.brightness],
                  ["Protection", recommendation.protection],
                  ["Cabinets", recommendation.cabinet],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/8 bg-white/3 p-4"
                  >
                    <dt className="text-xs uppercase tracking-wider text-white/40">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-white">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-5 space-y-2 text-sm text-white/60 list-disc pl-5">
                {recommendation.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>

              <div className="mt-8 border-t border-white/8 pt-6">
                {sent ? (
                  <div className="rounded-2xl border border-ocean-teal/30 bg-ocean-teal/10 p-8 text-center">
                    <CheckCircle
                      className="mx-auto mb-3 text-ocean-teal"
                      size={44}
                      strokeWidth={1.5}
                    />
                    <h4 className="text-lg font-semibold text-white mb-1">
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
                    <h4 className="text-base font-semibold text-white">
                      Want a detailed recommendation and quote?
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="finder-name"
                          className="block text-sm text-white/70 mb-1.5"
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
                          className="block text-sm text-white/70 mb-1.5"
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
                        className="block text-sm text-white/70 mb-1.5"
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
                      className="w-full rounded-full bg-linear-to-r from-ocean-blue to-ocean-cyan px-6 py-3 text-sm font-semibold text-ocean-dark shadow-lg shadow-ocean-blue/25 hover:shadow-ocean-cyan/40 hover:scale-[1.01] transition-all"
                    >
                      Get My Recommendation
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
                className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-ocean-cyan transition-colors"
              >
                <RotateCcw size={14} /> Start over
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
