interface LogoProps {
  size?: number;
  className?: string;
}

// Interprétation SVG du logo mangue (feuille + anneau or/vert, scène de montagne à l'intérieur),
// recréée à partir de la charte fournie par Jaslin — pas une extraction fidèle du fichier original,
// que le chat ne permettait pas de récupérer.
export default function Logo({ size = 36, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gm-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="gm-green" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
      </defs>

      {/* Feuilles */}
      <path d="M32 20 C26 14 18 12 12 15 C17 18 22 21 27 24 Z" fill="url(#gm-green)" />
      <path d="M32 20 C33 12 30 6 25 2 C24 9 25 15 27 22 Z" fill="url(#gm-green)" />

      {/* Corps de la mangue (anneau or) */}
      <path
        d="M32 20 C46 22 50 34 45 46 C40 57 24 58 16 50 C7 41 9 26 20 21 C24 19 28 19 32 20 Z"
        fill="none"
        stroke="url(#gm-gold)"
        strokeWidth="4"
      />

      {/* Scène de montagne dans l'anneau */}
      <clipPath id="gm-clip">
        <path d="M32 20 C46 22 50 34 45 46 C40 57 24 58 16 50 C7 41 9 26 20 21 C24 19 28 19 32 20 Z" />
      </clipPath>
      <g clipPath="url(#gm-clip)">
        <circle cx="26" cy="27" r="4" fill="#fbbf24" opacity="0.7" />
        <path d="M6 44 L20 30 L28 38 L36 26 L52 44 Z" fill="url(#gm-green)" />
        <path d="M6 50 L20 40 L30 48 L52 50 L52 60 L6 60 Z" fill="#166534" />
      </g>
    </svg>
  );
}
