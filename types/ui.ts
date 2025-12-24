import { ReactNode } from "react";

// Sidebar types
export type TreeItem = string | (string | TreeItem[])[];

export type SidebarProps = {
  menuList: TreeItem[];
  isLoading?: boolean;
};

// Common UI types
export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

export type Size = "sm" | "md" | "lg" | "xl";

export type Theme = "light" | "dark" | "system";

// Layout types
export type LayoutProps = {
  children: ReactNode;
  className?: string;
};

// Navigation types
export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  children?: NavItem[];
  disabled?: boolean;
};
