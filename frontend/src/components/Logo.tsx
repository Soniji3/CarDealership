interface LogoProps {
  subtitle?: string;
}

/** The orange badge + wordmark used in the header, matching the reference design. */
export function Logo({ subtitle = 'MOTORS / CONSOLE' }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-ink">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 13.5 4.6 8.8A2 2 0 0 1 6.5 7.5h11a2 2 0 0 1 1.9 1.3L21 13.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="2.5"
            y="13.5"
            width="19"
            height="5.5"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="7" cy="19" r="1.4" fill="currentColor" />
          <circle cx="17" cy="19" r="1.4" fill="currentColor" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="font-display text-lg font-bold tracking-tight text-ink">REDLINE</div>
        <div className="label-eyebrow text-muted-2">{subtitle}</div>
      </div>
    </div>
  );
}
