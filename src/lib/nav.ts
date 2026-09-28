import {
  Leaf,
  Mic,
  CloudSun,
  Sprout,
  LayoutDashboard,
  Globe2,
  Network,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  /** Shortened for the mobile bar, where horizontal space is scarce. */
  shortLabel: string;
  icon: LucideIcon;
  description: string;
  /** Shown in the mobile bottom bar. Keep to five for thumb reach. */
  primary: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Farm dashboard',
    shortLabel: 'Farm',
    icon: LayoutDashboard,
    description: 'Today’s farm health, risks and next action',
    primary: true,
  },
  {
    to: '/diagnose',
    label: 'Crop Doctor',
    shortLabel: 'Diagnose',
    icon: Leaf,
    description: 'Photograph a leaf and get a likely diagnosis',
    primary: true,
  },
  {
    to: '/ask',
    label: 'Ask EpiFlora',
    shortLabel: 'Ask',
    icon: Mic,
    description: 'Ask a question by voice in your language',
    primary: true,
  },
  {
    to: '/weather',
    label: 'Weather advisory',
    shortLabel: 'Weather',
    icon: CloudSun,
    description: 'Seven-day farm advisory, not just a forecast',
    primary: true,
  },
  {
    to: '/soil',
    label: 'Soil intelligence',
    shortLabel: 'Soil',
    icon: Sprout,
    description: 'Turn soil readings into nutrient decisions',
    primary: true,
  },
  {
    to: '/network',
    label: 'BRICS network',
    shortLabel: 'Network',
    icon: Globe2,
    description: 'Shared agricultural intelligence across countries',
    primary: false,
  },
  {
    to: '/architecture',
    label: 'How EpiFlora works',
    shortLabel: 'Architecture',
    icon: Network,
    description: 'The digital public good architecture',
    primary: false,
  },
  {
    to: '/profile',
    label: 'Your farm',
    shortLabel: 'Farm details',
    icon: UserRound,
    description: 'Crop, location, language and saved data',
    primary: false,
  },
];

export const PRIMARY_NAV = NAV_ITEMS.filter((item) => item.primary);
