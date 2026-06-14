import { TRACKER_ICONS } from "../../../data/icons.ts";

interface TrackerIconProps {
  icon: string;
  size?: number;
  color?: string;
}

export const TrackerIcon = ({
  icon,
  size = 18,
  color = "currentColor",
}: TrackerIconProps) => {
  const path = TRACKER_ICONS[icon];
  if (!path) {
    return (
      <span
        style={{
          fontSize: size,
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </span>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
};
