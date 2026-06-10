import {
  PulseIcon, HandIcon, StethoscopeIcon, PillIcon, DropletIcon, LifeBuoyIcon,
  AlertIcon, ToiletIcon, BandageIcon,
} from "./icons.jsx";

// Clean line-icon glyph per sign, in a soft tinted tile (replaces emojis for a
// more professional look). Colours use Tailwind's default soft palette.
const MAP = {
  pain: { Icon: PulseIcon, cls: "bg-rose-50 text-rose-500" },
  help: { Icon: LifeBuoyIcon, cls: "bg-amber-50 text-amber-600" },
  doctor: { Icon: StethoscopeIcon, cls: "bg-teal-50 text-teal-600" },
  medicine: { Icon: PillIcon, cls: "bg-violet-50 text-violet-500" },
  water: { Icon: DropletIcon, cls: "bg-sky-50 text-sky-500" },
  toilet: { Icon: ToiletIcon, cls: "bg-cyan-50 text-cyan-600" },
  danger: { Icon: AlertIcon, cls: "bg-red-50 text-red-600" },
  wound: { Icon: BandageIcon, cls: "bg-pink-50 text-pink-600" },
};

const SIZES = {
  sm: { box: "w-9 h-9 rounded-xl", icon: "w-5 h-5" },
  md: { box: "w-12 h-12 rounded-2xl", icon: "w-6 h-6" },
  lg: { box: "w-16 h-16 rounded-2xl", icon: "w-8 h-8" },
};

export default function SignGlyph({ slug, size = "md", className = "" }) {
  const { Icon, cls } = MAP[slug] || { Icon: HandIcon, cls: "bg-navy/5 text-navy" };
  const sz = SIZES[size] || SIZES.md;
  return (
    <span className={`grid place-items-center shrink-0 ${sz.box} ${cls} ${className}`}>
      <Icon className={sz.icon} />
    </span>
  );
}
