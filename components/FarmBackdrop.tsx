import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

export default function FarmBackdrop() {
  if (siteConfig.heroImage) {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src={siteConfig.heroImage}
          alt=""
          fill
          priority
          className="object-cover opacity-[0.28]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, var(--color-paper) 0%, var(--color-paper) 25%, transparent 70%)",
          }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMaxYMax slice"
        className="absolute inset-0 h-full w-full opacity-[0.16]"
      >
        {/* distant fjord mountains */}
        <path
          d="M550 260 L650 150 L720 230 L820 110 L950 260 L1200 200 L1200 600 L550 600 Z"
          fill="var(--color-steel)"
        />
        <path
          d="M780 300 L900 190 L1020 300 L1150 220 L1200 260 L1200 600 L780 600 Z"
          fill="var(--color-moss)"
        />

        {/* rolling field with furrow rows */}
        <path
          d="M0 380 Q 300 320 650 370 T 1200 350 L1200 600 L0 600 Z"
          fill="var(--color-moss-dark)"
        />
        {Array.from({ length: 14 }).map((_, i) => (
          <path
            key={i}
            d={`M${-100 + i * 100} 600 Q ${250 + i * 100} ${420 - i * 2} ${
              700 + i * 100
            } 600`}
            stroke="var(--color-ink)"
            strokeWidth="2"
            fill="none"
            opacity="0.35"
          />
        ))}

        {/* barn */}
        <g transform="translate(870 300)">
          <rect x="0" y="40" width="120" height="90" fill="var(--color-ink)" />
          <path d="M-15 40 L60 -30 L135 40 Z" fill="var(--color-barn)" />
          <rect x="50" y="80" width="20" height="50" fill="var(--color-paper)" />
        </g>

        {/* sun */}
        <circle cx="200" cy="140" r="60" fill="var(--color-sage)" />
      </svg>

      {/* fade so the headline column stays crisp on every breakpoint */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--color-paper) 0%, var(--color-paper) 30%, transparent 68%)",
        }}
      />
    </div>
  );
}
