import Link from "next/link";

type IconType = "suitcase" | "compass" | "globe";

type Props = {
  icon: IconType;
  title: string;
  description?: string;
  action?: { label: string; href: string };
};

function SuitcaseSvg() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="12" y="22" width="40" height="28" rx="4" />
      <path d="M24 22V16a4 4 0 014-4h8a4 4 0 014 4v6" />
      <line x1="12" y1="34" x2="52" y2="34" />
      <rect x="28" y="30" width="8" height="8" rx="1" />
      <line x1="20" y1="50" x2="20" y2="54" />
      <line x1="44" y1="50" x2="44" y2="54" />
    </svg>
  );
}

function CompassSvg() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="24" />
      <circle cx="32" cy="32" r="2" />
      <polygon points="28,20 24,40 32,34" strokeWidth="1.5" fill="var(--accent)" opacity="0.3" />
      <polygon points="36,44 40,24 32,30" strokeWidth="1.5" fill="var(--accent)" opacity="0.15" />
      <line x1="32" y1="8" x2="32" y2="12" />
      <line x1="32" y1="52" x2="32" y2="56" />
      <line x1="8" y1="32" x2="12" y2="32" />
      <line x1="52" y1="32" x2="56" y2="32" />
    </svg>
  );
}

function GlobeSvg() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="24" />
      <ellipse cx="32" cy="32" rx="10" ry="24" />
      <line x1="8" y1="32" x2="56" y2="32" />
      <path d="M12 20h40" />
      <path d="M12 44h40" />
    </svg>
  );
}

const ICONS: Record<IconType, () => React.ReactNode> = {
  suitcase: SuitcaseSvg,
  compass: CompassSvg,
  globe: GlobeSvg,
};

export function EmptyState({ icon, title, description, action }: Props) {
  const Icon = ICONS[icon];
  return (
    <div className="flex flex-col items-center py-12 text-center animate-fade-in-up">
      <div className="mb-4 opacity-60">
        <Icon />
      </div>
      <h3 className="text-lg font-semibold text-[var(--fg)]">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-[var(--muted)]">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-block text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-200"
        >
          {action.label} &rarr;
        </Link>
      )}
    </div>
  );
}
