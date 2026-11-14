import React, { useMemo } from "react";

// Christmas decorations for the storefront: falling snow and a twinkling light string.
// Purely decorative (aria-hidden, no pointer events). Animations stop for visitors who ask for reduced motion (index.css).

export function Snowfall({ count = 42 }) {
  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const seed = (index * 9301 + 49297) % 233280;
        const rand = (n) => ((seed * (n + 1)) % 233280) / 233280;
        return {
          left: `${(rand(1) * 100).toFixed(2)}%`,
          size: 4 + Math.round(rand(2) * 6),
          duration: 9 + rand(3) * 10,
          delay: -rand(4) * 18,
          drift: Math.round(rand(5) * 60 - 30),
          opacity: 0.45 + rand(6) * 0.5,
        };
      }),
    [count],
  );
  return (
    <div className="snowfall" aria-hidden="true">
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

const BULB_COLORS = ["#e11d48", "#16a34a", "#f59e0b", "#0ea5e9", "#f43f5e", "#22c55e", "#fbbf24"];

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
