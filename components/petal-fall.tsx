import type { CSSProperties } from "react";

const petals = [
  { glyph: "🌸", left: 4, delay: -2, duration: 14, drift: 42, size: 18 },
  { glyph: "❀", left: 12, delay: -9, duration: 17, drift: -34, size: 22 },
  { glyph: "✿", left: 21, delay: -5, duration: 15, drift: 54, size: 18 },
  { glyph: "🌸", left: 30, delay: -12, duration: 19, drift: -46, size: 16 },
  { glyph: "❀", left: 39, delay: -1, duration: 16, drift: 38, size: 20 },
  { glyph: "✿", left: 47, delay: -8, duration: 18, drift: -58, size: 15 },
  { glyph: "🌸", left: 55, delay: -14, duration: 20, drift: 48, size: 18 },
  { glyph: "❀", left: 63, delay: -6, duration: 15, drift: -38, size: 23 },
  { glyph: "✿", left: 71, delay: -11, duration: 17, drift: 52, size: 17 },
  { glyph: "🌸", left: 79, delay: -3, duration: 19, drift: -48, size: 16 },
  { glyph: "❀", left: 87, delay: -13, duration: 16, drift: 36, size: 21 },
  { glyph: "✿", left: 95, delay: -7, duration: 18, drift: -42, size: 17 },
];

export function PetalFall() {
  return (
    <div className="petal-field" aria-hidden="true">
      {petals.map((petal, index) => (
        <span
          key={`${petal.left}-${index}`}
          className="falling-petal"
          style={{
            left: `${petal.left}%`,
            fontSize: `${petal.size}px`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
            "--petal-drift": `${petal.drift}px`,
          } as CSSProperties}
        >
          {petal.glyph}
        </span>
      ))}
    </div>
  );
}
