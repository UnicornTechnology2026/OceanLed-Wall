import { navigate } from "../router";

export default function Hero() {
  // const scrollTo = (id: string) => {
  //   document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  // };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Video background */}
      <div className="absolute inset-0 bg-ocean-dark">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,13,24,0.55) 0%, rgba(5,13,24,0.45) 40%, rgba(5,13,24,0.75) 100%)",
          }}
        />

        {/* Soft bottom fade into next section */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{
            background: "linear-gradient(to top, #050d18 0%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <p
          style={{ animationDelay: "0.2s" }}
          className="hero-item mb-4 text-sm font-semibold tracking-[0.25em] uppercase text-ocean-cyan drop-shadow-sm"
        >
          Premium LED Display Technology
        </p>
        <h1
          style={{ animationDelay: "0.4s" }}
          className="hero-item text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] drop-shadow-lg"
        >
          BRING YOUR VISION
          <br />
          <span className="bg-linear-to-r from-ocean-cyan via-ocean-blue to-ocean-purple bg-clip-text text-transparent text-shimmer">
            TO LIFE
          </span>
        </h1>
        <p
          style={{ animationDelay: "0.65s" }}
          className="hero-item mt-6 max-w-2xl mx-auto text-base sm:text-lg text-white/80 leading-relaxed drop-shadow-sm"
        >
          Discover innovative LED display solutions engineered to transform
          spaces, elevate experiences, and make every visual unforgettable.
        </p>
        <div
          style={{ animationDelay: "0.9s" }}
          className="hero-item mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={() => navigate("contact")}
            className="w-full sm:w-auto rounded-full border border-white/25 bg-white/10 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/15 hover:border-ocean-cyan/50 transition-all"
          >
            Get a Quote
          </button>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="hero-item absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        style={{ animationDelay: "1.3s" }}
        aria-hidden="true"
      >
        <div className="flex h-10 w-6 justify-center rounded-full border border-white/40 pt-2">
          <span className="scroll-cue-dot h-2 w-1 rounded-full bg-ocean-cyan" />
        </div>
      </div>
    </section>
  );
}
