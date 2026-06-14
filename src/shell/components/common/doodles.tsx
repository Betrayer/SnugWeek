interface DoodleProps {
  size?: number;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const SparkleDoodle = ({ size = 32 }: DoodleProps) => (
  <svg {...base(size)}>
    <path d="M16 5c1.6 5 3 6.4 8 8-5 1.6-6.4 3-8 8-1.6-5-3-6.4-8-8 5-1.6 6.4-3 8-8z" />
    <circle cx="25" cy="7" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="8" cy="23" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const LeafDoodle = ({ size = 32 }: DoodleProps) => (
  <svg {...base(size)}>
    <path d="M7 25C7 14 13 8 25 8c0 12-6 18-18 17z" />
    <path d="M10 22c4-5 8-8 12-9" />
  </svg>
);

export const MugDoodle = ({ size = 32 }: DoodleProps) => (
  <svg {...base(size)}>
    <path d="M8 12h13v7a5 5 0 0 1-5 5h-3a5 5 0 0 1-5-5z" />
    <path d="M21 13.5h2.4a2.5 2.5 0 0 1 0 5H21" />
    <path d="M11 5.5c0 1.4-1 1.7-1 3M15 5.5c0 1.4-1 1.7-1 3" />
  </svg>
);

export const MoonDoodle = ({ size = 32 }: DoodleProps) => (
  <svg {...base(size)}>
    <path d="M23 19.5A9 9 0 0 1 12 6.5a9 9 0 1 0 11 13z" />
    <circle cx="24" cy="9" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
