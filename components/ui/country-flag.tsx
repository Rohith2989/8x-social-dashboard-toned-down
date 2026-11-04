import type { Country } from "@/lib/roster";

/*
  A country by its flag, drawn small (20 x 14) so it reads the same on every system: Windows shows emoji flags as two
  letters. Only the sample's countries are drawn; the real dashboard keeps a set for every country it serves.
*/

const FLAGS: Record<Country["code"], React.ReactNode> = {
  IN: (
    <>
      <rect width="20" height="4.67" fill="#ff9933" />
      <rect y="4.67" width="20" height="4.67" fill="#fff" />
      <rect y="9.33" width="20" height="4.67" fill="#138808" />
      <circle cx="10" cy="7" r="1.6" fill="none" stroke="#000080" strokeWidth="0.7" />
    </>
  ),
  BR: (
    <>
      <rect width="20" height="14" fill="#009c3b" />
      <path d="M10 1.6 18.2 7 10 12.4 1.8 7Z" fill="#ffdf00" />
      <circle cx="10" cy="7" r="3.1" fill="#002776" />
    </>
  ),
  TR: (
    <>
      <rect width="20" height="14" fill="#e30a17" />
      <circle cx="8" cy="7" r="3.5" fill="#fff" />
      <circle cx="8.9" cy="7" r="2.8" fill="#e30a17" />
      <path d="m12.6 7 -1.9 0.62 1.17-1.62v2l-1.17-1.62Z" fill="#fff" />
    </>
  ),
  PH: (
    <>
      <rect width="20" height="7" fill="#0038a8" />
      <rect y="7" width="20" height="7" fill="#ce1126" />
      <path d="M0 0 10.4 7 0 14Z" fill="#fff" />
      <circle cx="3.6" cy="7" r="1.5" fill="#fcd116" />
    </>
  ),
  AE: (
    <>
      <rect width="20" height="4.67" fill="#00732f" />
      <rect y="4.67" width="20" height="4.67" fill="#fff" />
      <rect y="9.33" width="20" height="4.67" fill="#000" />
      <rect width="5.5" height="14" fill="#ff0000" />
    </>
  ),
  US: (
    <>
      <rect width="20" height="14" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((y) => (
        <rect key={y} y={y} width="20" height="1.08" fill="#b22234" />
      ))}
      <rect width="8.6" height="7.6" fill="#3c3b6e" />
    </>
  ),
};

export function CountryFlag({ country, size = 20 }: { country: Country; size?: number }) {
  return (
    <svg width={size} height={(size * 14) / 20} viewBox="0 0 20 14" role="img" aria-label={country.name} style={{ borderRadius: 3, flex: "none", boxShadow: "0 0 0 0.5px rgb(0 0 0 / 0.15)" }}>
      <clipPath id={`flag-${country.code}`}>
        <rect width="20" height="14" rx="3" />
      </clipPath>
      <g clipPath={`url(#flag-${country.code})`}>{FLAGS[country.code]}</g>
    </svg>
  );
}
