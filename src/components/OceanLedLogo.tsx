export default function OceanLedLogo({ size = 120, className = '' }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-white ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Soft outer glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: '0 0 40px rgba(0,180,255,0.45), 0 0 80px rgba(0,180,255,0.2)',
        }}
      />
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
        style={{ width: size * 0.62, height: size * 0.62 }}
      >
        {/* Stylized slanted "O" with LED-inspired segments */}
        <defs>
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="50%" stopColor="#00b4ff" />
            <stop offset="100%" stopColor="#7b5cff" />
          </linearGradient>
        </defs>
        {/* Outer ring */}
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="url(#oceanGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          transform="rotate(-18 50 50)"
        />
        {/* Inner accent arc (wave-like) */}
        <path
          d="M 28 55 Q 50 28 72 55"
          stroke="url(#oceanGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
        {/* Small LED dots suggestion */}
        <circle cx="50" cy="50" r="4" fill="#00b4ff" />
        <circle cx="38" cy="42" r="2.5" fill="#00e5ff" opacity="0.9" />
        <circle cx="62" cy="42" r="2.5" fill="#7b5cff" opacity="0.9" />
      </svg>
    </div>
  );
}
