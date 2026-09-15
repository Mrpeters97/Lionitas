import Link from "next/link";

interface PillLinkProps {
  href: string;
  target?: string | null;
  children: React.ReactNode;
  variant?: "yellow" | "blue" | "navy" | "outline-white";
  className?: string;
  onClick?: () => void;
}

export const PILL_STYLES = {
  yellow: "bg-accent text-navy hover:bg-yellow-hover focus-visible:outline-navy",
  blue: "bg-blue text-cream hover:bg-blue-hover focus-visible:outline-yellow",
  navy: "bg-navy text-on-dark hover:bg-navy-hover focus-visible:outline-yellow",
  "outline-white":
    "border border-white/30 text-on-dark hover:border-white focus-visible:outline-yellow",
};

const ARROW_STYLES = {
  yellow: { circle: "fill-navy", arrow: "stroke-yellow" },
  blue: { circle: "fill-yellow", arrow: "stroke-blue" },
  navy: { circle: "fill-yellow", arrow: "stroke-navy" },
  "outline-white": { circle: "fill-yellow", arrow: "stroke-navy" },
};

export function ArrowIcon({
  variant,
  showCircle = true,
}: {
  variant: keyof typeof ARROW_STYLES;
  showCircle?: boolean;
}) {
  const { circle, arrow } = ARROW_STYLES[variant];
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      {showCircle && <circle cx="10" cy="10" r="10" className={circle} />}
      <path
        d="M7 13L13 7M13 7H8M13 7V12"
        className={arrow}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PillLink({
  href,
  target,
  children,
  variant = "blue",
  className = "",
  onClick,
}: PillLinkProps) {
  const isExternal = /^https?:\/\//.test(href);
  const classes = `inline-flex items-center gap-2.5 rounded-pill py-2.5 pl-5 pr-2.5 text-label transition focus-visible:outline-2 focus-visible:outline-offset-2 ${PILL_STYLES[variant]} ${className}`;

  const content = (
    <>
      <span className="whitespace-nowrap">{children}</span>
      <ArrowIcon variant={variant} />
    </>
  );

  if (isExternal) {
    return (
      <a href={href} target={target ?? undefined} className={classes} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onClick={onClick}>
      {content}
    </Link>
  );
}
