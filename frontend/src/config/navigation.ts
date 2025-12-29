export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Catches", href: "/catches" },
  { label: "Quotas", href: "/quotas" },
  { label: "Vessels", href: "/vessels" },
  { label: "Violations", href: "/violations" },
  { label: "Species", href: "/species" },
];
