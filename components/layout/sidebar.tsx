"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
  SidebarHeader,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ChevronRight, Folder, File } from "lucide-react";
import { UlbSwitcher } from "../ulb-switcher";
import { useAuth } from "@/context/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IconChevronsDown, IconLogout } from "@tabler/icons-react";
import { UserAvatarProfile } from "../user-avatar-profile";

// Canonical node type we render
export type MenuNode = {
  id: string;
  name: string;
  href?: string;
  children?: MenuNode[];
  expanded?: boolean;
};

// Helpers to safely read common API shapes (kept from original to avoid breaking)
function pickString(obj: any, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.length) return v;
  }
  return undefined;
}
function pickArray(obj: any, keys: string[]): any[] | undefined {
  for (const k of keys) {
    const v = obj?.[k];
    if (Array.isArray(v)) return v;
  }
  return undefined;
}

function makeId(parts: (string | undefined)[]) {
  return parts.filter(Boolean).join("::");
}

// Normalize arbitrary inputs into MenuNode[] (preserves previous robust behaviour)
function toNodes(input: any, parentPath: string[] = []): MenuNode[] {
  if (!input) return [];

  // Already normalized
  if (
    Array.isArray(input) &&
    input.length > 0 &&
    input.every((n) => typeof n === "object" && "id" in n && "name" in n)
  ) {
    return input as MenuNode[];
  }

  // Case: array of items (objects, arrays, or strings)
  if (Array.isArray(input)) {
    return input.flatMap((item) => toNodes(item, parentPath));
  }

  // Case: legacy tuple style: ["name", ...children] or string leaf
  if (typeof input === "string") {
    const id = makeId([...parentPath, input]);
    return [{ id, name: input }];
  }
  if (Array.isArray(input)) {
    const [name, ...rest] = input as unknown[];
    const children = rest.flatMap((r) => toNodes(r, [...parentPath, String(name ?? "")]));
    const id = makeId([...parentPath, String(name ?? "group")]);
    return [{ id, name: String(name ?? "group"), children }];
  }

  // Case: object from API
  if (typeof input === "object") {
    const name =
      pickString(input, ["label", "title", "name", "text"]) ??
      (typeof input?.key === "string" ? input.key : undefined) ??
      `${input.menuname ?? input.id ?? ""}`;

    const href = pickString(input, ["href", "url", "path", "link"]);
    const childrenRaw = pickArray(input, ["children", "items", "nodes", "routes", "menus", "submenus"]);
    const expanded =
      ("expanded" in input && Boolean(input.expanded)) ||
      ("defaultOpen" in input && Boolean((input as Record<string, unknown>).defaultOpen)) ||
      false;

    const id = makeId([...parentPath, name, href]);
    const children = childrenRaw ? toNodes(childrenRaw, [...parentPath, name]) : undefined;

    // Merge any other arrays defensively
    const extraArrays: any[] = [];
    for (const [k, v] of Object.entries(input)) {
      if (Array.isArray(v) && !["children", "items", "nodes", "routes", "menus", "submenus"].includes(k)) {
        extraArrays.push(...v);
      }
    }
    const extras = extraArrays.length ? toNodes(extraArrays, [...parentPath, name]) : [];

    const mergedChildren = [...(children ?? []), ...extras];
    return [
      {
        id,
        name,
        href,
        children: mergedChildren.length ? mergedChildren : undefined,
        expanded,
      },
    ];
  }

  return [];
}

const isLeaf = (node: MenuNode) => !node.children || node.children.length === 0;

export default function RedesignedSidebar() {
  const { user, menuList, isLoading, logout } = useAuth();

  // Normalize menuList and keep stable reference
  const nodes = React.useMemo<MenuNode[]>(() => {
    try {
      const normalized = toNodes(menuList);
      if (normalized.length) return normalized;
      return [];
    } catch (e) {
      console.error("Failed to normalize menuList", e);
      return [];
    }
  }, [menuList]);

  return (
    <Sidebar className="bg-white border-r shadow-sm">
      <SidebarHeader className="px-4 py-3 border-b">
        <UlbSwitcher />
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 text-sm font-semibold px-2 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {isLoading ? (
                <LoadingSkeleton />
              ) : nodes.length === 0 ? (
                <EmptyMenu />
              ) : (
                nodes.map((node: MenuNode) => <TreeNode key={node.id} node={node} />)
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                  {user && <UserAvatarProfile className="h-8 w-8 rounded-md" showInfo user={user} />}
                  <IconChevronsDown className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="rounded-xl shadow-md p-2" side="top" align="end">
                <DropdownMenuLabel className="p-2 flex gap-2 items-center">
                  {user && <UserAvatarProfile className="h-8 w-8 rounded-md" showInfo user={user} />}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2 cursor-pointer">
                  <IconLogout /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function TreeNode({ node }: { node: MenuNode }) {
  const pathname = usePathname() ?? "/";
  const { state, isMobile } = useSidebar();
  const active = node.href ? pathname === node.href || pathname.startsWith(node.href) : false;

  // Leaf node: keep as before but with new visuals
  if (isLeaf(node)) {
    const content = (
      <SidebarMenuButton
        isActive={active}
        className="flex items-center gap-3 p-2 rounded-lg transition-colors"
        asChild={Boolean(node.href)}
      >
        {node.href ? (
          <Link href={node.href} className={`flex items-center gap-3 w-full ${active ? 'text-white bg-blue-600 rounded-md px-2' : ''}`}>
            <File className="h-4 w-4" />
            <span className="truncate">{node.name}</span>
          </Link>
        ) : (
          <>
            <File className="h-4 w-4" />
            <span className="truncate">{node.name}</span>
          </>
        )}
      </SidebarMenuButton>
    );

    return <SidebarMenuItem>{content}</SidebarMenuItem>;
  }

  // Collapsed mini mode: simple hover flyout preserved
  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCardTrigger asChild>
            <SidebarMenuButton tooltip={undefined} className={`${active ? "bg-blue-600 text-white" : ""} transition-colors`}>
              <Folder />
              <span className="truncate">{node.name}</span>
            </SidebarMenuButton>
          </HoverCardTrigger>
          <HoverCardContent side="right" align="start" sideOffset={8} className="p-1 w-64">
            <FlyoutSubItems items={node.children ?? []} />
          </HoverCardContent>
        </HoverCard>
      </SidebarMenuItem>
    );
  }

  // Expanded group with collapsible
  return (
    <SidebarMenuItem>
      <Collapsible defaultOpen={Boolean(node.expanded || active)}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className={`${active ? "bg-blue-50 text-blue-700" : ""} flex items-center gap-3 p-2 rounded-lg`}>
            <Folder className="h-4 w-4" />
            <span className="truncate">{node.name}</span>
            <ChevronRight className="ml-auto h-4 w-4" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="ml-4 pl-2 border-l mt-1 space-y-1">
            {(node.children ?? []).map((child) => (
              <TreeNode key={child.id} node={child} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

function FlyoutSubItems({ items }: { items: MenuNode[] }) {
  const pathname = usePathname() ?? "/";

  return (
    <ul className="flex flex-col gap-1">
      {items.map((node) => {
        const active = node.href ? pathname === node.href || pathname.startsWith(node.href) : false;

        if (isLeaf(node)) {
          return (
            <li key={node.id}>
              <button type="button" className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm ${active ? "bg-primary text-white" : "hover:bg-primary/20"}`}>
                {node.href ? (
                  <Link href={node.href} className="flex w-full items-center gap-2">
                    <File className="size-4" />
                    <span className={`truncate ${active ? "font-medium" : ""}`}>{node.name}</span>
                  </Link>
                ) : (
                  <>
                    <File className="size-4" />
                    <span className="truncate">{node.name}</span>
                  </>
                )}
              </button>
            </li>
          );
        }

        return (
          <li key={node.id} className="relative ">
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">
                  <Folder className="size-4" />
                  <span className="truncate font-medium">{node.name}</span>
                  <ChevronRight className="chevron ml-auto size-4 shrink-0 opacity-70 text-muted-foreground" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent side="right" align="start" sideOffset={8} className="p-1 w-64">
                <FlyoutSubItems items={node.children ?? []} />
              </HoverCardContent>
            </HoverCard>
          </li>
        );
      })}
    </ul>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <SidebarMenuItem key={i}>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="h-4 w-4 rounded bg-muted animate-pulse" />
            <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
          </div>
        </SidebarMenuItem>
      ))}
    </>
  );
}

function EmptyMenu() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton disabled className="text-gray-400 flex items-center gap-3 p-2">
        <Folder className="h-4 w-4" />
        No menu available
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}