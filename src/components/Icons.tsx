import type { SVGProps, ReactElement } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

/* ---------- Product-type icons ---------- */
export const TemplateIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const PromptIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="6" width="16" height="12" rx="3" />
    <circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <path d="M12 6V3M8 21h8" />
  </svg>
);

export const CourseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M22 9 12 4 2 9l10 5 10-5Z" />
    <path d="M6 11v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
  </svg>
);

export const EbookIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5Z" />
    <path d="M8 3v18M18 3v18" />
  </svg>
);

export const PresetIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 0 0 18 4.5 4.5 0 0 0 0-9 4.5 4.5 0 0 1 0-9Z" />
    <circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="7.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const GraphicsIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9" r="1.5" />
    <path d="m21 16-5-5L5 20" />
  </svg>
);

export const FontIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 19V6h9a3.5 3.5 0 0 1 0 7H5M14 13a3.5 3.5 0 0 1 0 7H5" />
  </svg>
);

export const PlannerIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 9h18M8 2v4M16 2v4" />
    <path d="M8 13h2M14 13h2M8 17h2M14 17h2" />
  </svg>
);

export const AccountIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1.3" fill="currentColor" stroke="none" />
  </svg>
);

export const ProxyIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
);

export const SparkIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/* ---------- UI / nav icons ---------- */
export const HomeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 11.5 12 4l9 7.5M5 10v10h14V10" />
  </svg>
);
export const SearchIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4-4" />
  </svg>
);
export const LibraryIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="6" height="16" rx="1" />
    <rect x="11" y="4" width="4" height="16" rx="1" />
    <path d="m17 5 3.5 1-3 14-3.5-1" />
  </svg>
);
export const StoreIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9 5.5 4h13L20 9M4 9h16M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M4 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
  </svg>
);
export const UserIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);
export const BellIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);
export const MoonIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 12.8A8 8 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z" />
  </svg>
);
export const SunIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m20 6-11 11-5-5" />
  </svg>
);
export const ArrowRightIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/* ---------- Map product types to icon components ---------- */
const TYPE_ICONS: Record<string, (p: P) => ReactElement> = {
  template: TemplateIcon,
  prompt_pack: PromptIcon,
  course: CourseIcon,
  ebook: EbookIcon,
  presets: PresetIcon,
  graphics: GraphicsIcon,
  fonts: FontIcon,
  printables: PlannerIcon,
  account: AccountIcon,
  proxy: ProxyIcon,
  other: SparkIcon,
};

export function TypeIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const Cmp = TYPE_ICONS[type] || SparkIcon;
  return <Cmp className={className} />;
}
