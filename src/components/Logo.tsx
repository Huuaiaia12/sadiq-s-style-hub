import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showText = true, className }: LogoProps) => {
  const sizes = {
    sm: { icon: 40, text: "text-lg", subtext: "text-xs" },
    md: { icon: 60, text: "text-2xl", subtext: "text-sm" },
    lg: { icon: 100, text: "text-4xl", subtext: "text-lg" },
  };

  const { icon, text, subtext } = sizes[size];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="25%" stopColor="#F4E4A6" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="75%" stopColor="#C5A028" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          <linearGradient id="goldGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B8942D" />
            <stop offset="50%" stopColor="#8B7021" />
            <stop offset="100%" stopColor="#B8942D" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="url(#goldGradient)"
          stroke="url(#goldGradientDark)"
          strokeWidth="2"
          filter="url(#glow)"
        />

        {/* Inner Circle */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="1.5"
          opacity="0.3"
        />

        {/* Scissors - Left Blade */}
        <path
          d="M25 35 L50 55 L25 55 Z"
          fill="#1a1a1a"
          stroke="#0d0d0d"
          strokeWidth="1"
        />
        <ellipse
          cx="22"
          cy="30"
          rx="8"
          ry="6"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="3"
        />

        {/* Scissors - Right Blade */}
        <path
          d="M75 35 L50 55 L75 55 Z"
          fill="#1a1a1a"
          stroke="#0d0d0d"
          strokeWidth="1"
        />
        <ellipse
          cx="78"
          cy="30"
          rx="8"
          ry="6"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="3"
        />

        {/* Center Pivot */}
        <circle cx="50" cy="50" r="5" fill="#1a1a1a" />
        <circle cx="50" cy="50" r="3" fill="url(#goldGradient)" />

        {/* Arabic Letter ص (Sad) - Stylized */}
        <text
          x="50"
          y="78"
          textAnchor="middle"
          fontSize="22"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fill="#1a1a1a"
        >
          ص
        </text>
      </svg>

      {showText && (
        <div className="text-center">
          <h1 className={cn("font-bold gold-text", text)}>حلاق صادق</h1>
          <p className={cn("text-muted-foreground tracking-wider", subtext)}>
            Sadiq Barber
          </p>
        </div>
      )}
    </div>
  );
};
