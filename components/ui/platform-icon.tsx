import { useId } from "react";
import type { Platform } from "@/lib/demo";

/*
  The platforms by their own icons, as they sit on a home screen (nominative, wherever a platform is named): TikTok's
  note with its cyan and red offsets on black, Instagram's camera on its gradient. The same marks as the landing's.
*/

const TIKTOK =
  "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z";

export function PlatformIcon({ platform, size = 32, className }: { platform: Platform; size?: number; className?: string }) {
  const id = useId();
  if (platform === "tiktok") {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 38 38" role="img" aria-label="TikTok">
        <rect width="38" height="38" rx="9.5" fill="#010101" />
        <g transform="translate(8.9 8.6) scale(0.865)">
          <path d={TIKTOK} fill="#25f4ee" transform="translate(-0.8 -0.8)" />
          <path d={TIKTOK} fill="#fe2c55" transform="translate(0.8 0.8)" />
          <path d={TIKTOK} fill="#fff" />
        </g>
      </svg>
    );
  }
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 38 38" role="img" aria-label="Instagram">
      <defs>
        <radialGradient id={id} cx="0.28" cy="1.06" r="1.28">
          <stop offset="0" stopColor="#ffd600" />
          <stop offset="0.24" stopColor="#ff7a00" />
          <stop offset="0.48" stopColor="#ff0069" />
          <stop offset="0.75" stopColor="#d300c5" />
          <stop offset="1" stopColor="#7638fa" />
        </radialGradient>
      </defs>
      <rect width="38" height="38" rx="9.5" fill={`url(#${id})`} />
      <rect x="9.2" y="9.2" width="19.6" height="19.6" rx="5.8" fill="none" stroke="#fff" strokeWidth="2.3" />
      <circle cx="19" cy="19" r="4.7" fill="none" stroke="#fff" strokeWidth="2.3" />
      <circle cx="24.35" cy="13.65" r="1.4" fill="#fff" />
    </svg>
  );
}
