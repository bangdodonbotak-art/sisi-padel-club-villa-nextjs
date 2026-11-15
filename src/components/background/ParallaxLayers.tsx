"use client";

/**
 * ParallaxLayers — giant outline "SISI" wordmark + court-line / palm SVG,
 * moving slower than the content (Motion useScroll → useTransform).
 *
 * Section-scoped decoration: the next worker mounts this inside sections
 * (it is NOT in the site-wide fixed stack). Pure text + inline SVG,
 * only Sisi colours, 0 KB new assets. Static under prefers-reduced-motion.
 */
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export default function ParallaxLayers({
  className = "",
}: {
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yWord = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const yLines = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Giant outline wordmark */}
      <motion.span
        style={reduceMotion ? undefined : { y: yWord }}
        className="font-display absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[38vw] leading-none font-bold tracking-tight whitespace-nowrap text-transparent uppercase select-none"
      >
        <span
          style={{
            WebkitTextStroke: "1.5px rgba(217, 255, 63, 0.22)",
          }}
        >
          SISI
        </span>
      </motion.span>

      {/* Court lines + palm fronds */}
      <motion.svg
        style={reduceMotion ? undefined : { y: yLines }}
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Court boundary lines */}
        <rect
          x="80"
          y="80"
          width="1040"
          height="440"
          stroke="rgba(243, 239, 230, 0.16)"
          strokeWidth="2"
        />
        <line
          x1="600"
          y1="80"
          x2="600"
          y2="520"
          stroke="rgba(243, 239, 230, 0.16)"
          strokeWidth="2"
        />
        <line
          x1="80"
          y1="300"
          x2="1120"
          y2="300"
          stroke="rgba(217, 255, 63, 0.25)"
          strokeWidth="2"
          strokeDasharray="12 10"
        />
        {/* Palm fronds, top-right */}
        <g stroke="rgba(217, 255, 63, 0.28)" strokeWidth="2" strokeLinecap="round">
          <path d="M1080 60 C 1020 20, 960 30, 920 70" />
          <path d="M1080 60 C 1040 100, 980 110, 940 90" />
          <path d="M1080 60 C 1120 20, 1160 30, 1180 70" />
          <path d="M1080 60 C 1100 110, 1140 130, 1170 120" />
        </g>
        {/* Palm fronds, bottom-left */}
        <g stroke="rgba(217, 255, 63, 0.22)" strokeWidth="2" strokeLinecap="round">
          <path d="M120 540 C 180 580, 240 570, 280 530" />
          <path d="M120 540 C 160 500, 220 490, 260 510" />
          <path d="M120 540 C 80 580, 40 570, 20 530" />
        </g>
      </motion.svg>
    </div>
  );
}
