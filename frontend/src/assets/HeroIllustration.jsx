export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 460" fill="none" className="w-full max-w-md" role="img" aria-label="Illustration of a cow beside a feed sack">
      <circle cx="240" cy="230" r="210" fill="#EFF7FC" />
      <circle cx="360" cy="110" r="46" fill="#FCF3DE" />
      <ellipse cx="150" cy="360" rx="140" ry="26" fill="#DCEEF9" />

      <g transform="translate(60,150)">
        <rect x="10" y="70" width="120" height="150" rx="14" fill="#E9AE3E" />
        <rect x="10" y="70" width="120" height="34" rx="14" fill="#D9962A" />
        <rect x="26" y="118" width="88" height="6" rx="3" fill="#B87A1B" opacity="0.5" />
        <rect x="26" y="140" width="88" height="6" rx="3" fill="#B87A1B" opacity="0.5" />
        <rect x="26" y="162" width="60" height="6" rx="3" fill="#B87A1B" opacity="0.5" />
        <path d="M40 70c0-22 18-40 40-40s40 18 40 40" stroke="#B87A1B" strokeWidth="5" fill="none" />
      </g>

      <g transform="translate(190,90)">
        <ellipse cx="120" cy="270" rx="100" ry="16" fill="#CFE6F5" />
        <rect x="40" y="120" width="170" height="110" rx="46" fill="#FBFDFF" stroke="#175A88" strokeWidth="6" />
        <circle cx="205" cy="95" r="55" fill="#FBFDFF" stroke="#175A88" strokeWidth="6" />
        <circle cx="188" cy="88" r="7" fill="#12293D" />
        <circle cx="224" cy="88" r="7" fill="#12293D" />
        <path d="M195 112c6 6 16 6 22 0" stroke="#12293D" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M160 60c-10-18-34-22-46-10" stroke="#175A88" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M250 60c10-18 34-22 46-10" stroke="#175A88" strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="95" cy="165" r="16" fill="#0F324E" />
        <circle cx="150" cy="195" r="20" fill="#0F324E" />
        <circle cx="55" cy="205" r="13" fill="#0F324E" />
        <rect x="55" y="225" width="14" height="45" rx="7" fill="#FBFDFF" stroke="#175A88" strokeWidth="6" />
        <rect x="185" y="225" width="14" height="45" rx="7" fill="#FBFDFF" stroke="#175A88" strokeWidth="6" />
      </g>
    </svg>
  );
}
