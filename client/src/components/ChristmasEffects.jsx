import React, { useEffect, useMemo } from "react";

// Christmas + princess decorations for the storefront. All purely decorative: aria-hidden, no pointer events,
// and the animations stop for visitors who ask for reduced motion (see index.css).

const seeded = (index, n) => (((index * 9301 + 49297) * (n + 3)) % 233280) / 233280;

export function Snowfall({ count = 42, className = "" }) {
  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        left: `${(seeded(index, 1) * 100).toFixed(2)}%`,
        size: 4 + Math.round(seeded(index, 2) * 6),
        duration: 9 + seeded(index, 3) * 10,
        delay: -seeded(index, 4) * 18,
        drift: Math.round(seeded(index, 5) * 60 - 30),
        opacity: 0.45 + seeded(index, 6) * 0.5,
      })),
    [count],
  );
  return (
    <div className={`snowfall ${className}`} aria-hidden="true">
      {flakes.map((flake, index) => (
        <span
          key={index}
          className="snowflake"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            "--drift": `${flake.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

const BULB_COLORS = ["#ff2d87", "#ffcc33", "#c084fc", "#22c55e", "#38bdf8", "#ff94c6", "#fff3a3"];

export function StringLights({ bulbs = 26 }) {
  return (
    <div className="string-lights" aria-hidden="true">
      <svg className="string-lights__wire" viewBox="0 0 1000 40" preserveAspectRatio="none">
        <path d="M0 8 Q 62.5 30 125 8 T 250 8 T 375 8 T 500 8 T 625 8 T 750 8 T 875 8 T 1000 8" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <div className="string-lights__row">
        {Array.from({ length: bulbs }, (_, index) => (
          <span
            key={index}
            className="bulb"
            style={{
              "--bulb": BULB_COLORS[index % BULB_COLORS.length],
              animationDelay: `${(index % 5) * 0.35}s`,
              marginTop: `${Math.round(10 + 9 * Math.sin((index / bulbs) * Math.PI * 16))}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Four-point sparkle shape (✦), drawn so it scales crisply.
export function SparkleIcon({ size = 16, className = "", style }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} aria-hidden="true">
      <path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z" fill="currentColor" />
    </svg>
  );
}

export function TwinklingStars({ count = 28 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        left: `${(seeded(index, 7) * 100).toFixed(1)}%`,
        top: `${(seeded(index, 8) * 70).toFixed(1)}%`,
        size: 6 + Math.round(seeded(index, 9) * 12),
        delay: `${(seeded(index, 10) * 2.6).toFixed(2)}s`,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {stars.map((star, index) => (
        <SparkleIcon key={index} size={star.size} className="twinkle-star" style={{ left: star.left, top: star.top, animationDelay: star.delay }} />
      ))}
    </div>
  );
}

// Santa in his sleigh pulled by two reindeer (facing left, the way it flies), leaving a sparkle trail. Crosses every 22 seconds.
export function SantaSleigh() {
  return (
    <div className="santa-flyby" aria-hidden="true">
      <svg viewBox="0 0 260 90" width="260" height="90">
        {/* sparkle trail */}
        <g fill="#fff3a3">
          <circle cx="232" cy="62" r="2" opacity="0.9" />
          <circle cx="246" cy="58" r="1.5" opacity="0.7" />
          <circle cx="255" cy="66" r="1.2" opacity="0.5" />
          <path d="M240 70 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" opacity="0.8" />
        </g>
        {/* reins */}
        <path d="M68 40 Q 110 52 150 50" stroke="#ffcc33" strokeWidth="1.5" fill="none" />
        {/* reindeer (2), mirrored to face left */}
        {[0, 44].map((x) => (
          <g key={x} transform={`translate(${x + 78},0) scale(-1,1)`}>
            <ellipse cx="34" cy="44" rx="16" ry="8" fill="#8b5a2b" />
            <circle cx="50" cy="36" r="6" fill="#8b5a2b" />
            <path d="M52 30 l4 -10 M55 24 l5 -2 M50 30 l-2 -10 M48 23 l-5 -2" stroke="#5c3a1a" strokeWidth="2" strokeLinecap="round" />
            <circle cx="56" cy="37" r="2.2" fill={x === 0 ? "#ff2d87" : "#8b5a2b"} />
            <g className="reindeer-legs" stroke="#5c3a1a" strokeWidth="2.5" strokeLinecap="round">
              <path d="M24 50 l-4 10 M30 51 l-2 10 M40 51 l3 10 M45 50 l5 9" />
            </g>
          </g>
        ))}
        {/* sleigh */}
        <path d="M150 42 h62 q10 0 10 12 v6 q0 10 -12 10 h-56 q-10 0 -12 -10 z" fill="#e0136d" stroke="#ffcc33" strokeWidth="2.5" />
        <path d="M144 76 h80 q8 0 10 -8" stroke="#ffcc33" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* gift bag */}
        <path d="M196 30 q12 -6 18 4 l2 12 h-24 z" fill="#7e22ce" />
        <path d="M200 30 q4 -6 8 0" stroke="#ffcc33" strokeWidth="2" fill="none" />
        {/* Santa */}
        <circle cx="172" cy="30" r="9" fill="#ffd9b8" />
        <path d="M162 28 q10 -16 20 0 z" fill="#e0136d" />
        <circle cx="184" cy="20" r="3" fill="#ffffff" />
        <path d="M162 30 q10 16 20 0" fill="#ffffff" />
        <rect x="160" y="36" width="24" height="14" rx="6" fill="#e0136d" />
      </svg>
    </div>
  );
}

// A storybook castle with glowing windows on a snowy hill. The castle keeps its shape (never cropped);
// the snow hill stretches across the full width underneath it.
export function Castle({ className = "" }) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="360 -50 480 285" preserveAspectRatio="xMidYMax meet" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="castle-stone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c4a3f5" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <g fill="url(#castle-stone)" opacity="0.95">
          <rect x="470" y="90" width="260" height="145" />
          <rect x="420" y="60" width="60" height="175" />
          <rect x="720" y="60" width="60" height="175" />
          <rect x="570" y="20" width="60" height="215" />
          <rect x="380" y="150" width="50" height="85" />
          <rect x="770" y="150" width="50" height="85" />
        </g>
        <g fill="#ff5fa8">
          <path d="M410 60 L450 0 L490 60 Z" />
          <path d="M710 60 L750 0 L790 60 Z" />
          <path d="M560 20 L600 -40 L640 20 Z" />
        </g>
        <g fill="#ff94c6">
          <path d="M374 150 L405 112 L436 150 Z" />
          <path d="M764 150 L795 112 L826 150 Z" />
        </g>
        <g stroke="#ffcc33" strokeWidth="2">
          <path d="M450 0 v-14 M600 -40 v-14 M750 0 v-14" />
        </g>
        <g fill="#ffcc33">
          <path d="M450 -14 l12 4 -12 4 z" />
          <path d="M600 -54 l12 4 -12 4 z" />
          <path d="M750 -14 l12 4 -12 4 z" />
        </g>
        <g fill="#ffe066">
          <path d="M585 150 a15 15 0 0 1 30 0 v45 h-30 z" />
          <rect x="440" y="100" width="18" height="26" rx="9" />
          <rect x="742" y="100" width="18" height="26" rx="9" />
          <rect x="590" y="60" width="18" height="26" rx="9" />
          <rect x="510" y="130" width="16" height="22" rx="8" />
          <rect x="674" y="130" width="16" height="22" rx="8" />
        </g>
      </svg>
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-10 w-full sm:h-14">
        <path d="M0 30 Q 300 0 600 26 T 1200 22 V 60 H 0 Z" fill="#ffffff" />
        <path d="M0 44 Q 400 22 800 42 T 1200 40 V 60 H 0 Z" fill="#f6edff" />
      </svg>
    </div>
  );
}

// A small burst of gold and pink sparkles wherever someone clicks or taps (skipped for reduced motion).
export function SparkleBurst() {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const colors = ["#ffcc33", "#ff5fa8", "#c084fc", "#ffffff"];
    const handle = (event) => {
      for (let index = 0; index < 7; index += 1) {
        const spark = document.createElement("span");
        spark.className = "sparkle-pop";
        const angle = (Math.PI * 2 * index) / 7;
        spark.style.left = `${event.pageX}px`;
        spark.style.top = `${event.pageY}px`;
        spark.style.color = colors[index % colors.length];
        spark.style.setProperty("--dx", `${Math.round(Math.cos(angle) * 34)}px`);
        spark.style.setProperty("--dy", `${Math.round(Math.sin(angle) * 34)}px`);
        spark.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z" fill="currentColor"/></svg>';
        document.body.appendChild(spark);
        window.setTimeout(() => spark.remove(), 850);
      }
    };
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
  }, []);
  return null;
}
