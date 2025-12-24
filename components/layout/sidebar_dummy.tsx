
"use client";
import type * as React from "react"
import { ChevronRight, File, Folder } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

// This is sample data.
const data = {
  changes: [
    {
      file: "README.md",
      state: "M",
    },
    {
      file: "api/hello/route.ts",
      state: "U",
    },
    {
      file: "app/layout.tsx",
      state: "M",
    },
  ],
  tree: [
    ["app", ["api", ["hello", ["route.ts"]], "page.tsx", "layout.tsx", ["blog", ["page.tsx"]]]],
    ["components", ["ui", "button.tsx", "card.tsx"], "header.tsx", "footer.tsx"],
    ["lib", ["util.ts"]],
    ["public", "favicon.ico", "favicon.png"],
    ".eslintrc.json",
    ".gitignore",
    "next.config.js",
    "tailwind.config.js",
    "package.json",
    "README.md",
  ],
}

import { TreeItem, SidebarProps } from "@/types/ui";

export function AppSidebar({
  menuList,
  isLoading = false,
   ...props 
}: SidebarProps & { [key: string]: unknown }) {
  // Remove unused variables
  void menuList;
  void isLoading;
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-2">
ss
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Changes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.changes.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton tooltip={item.file}>
                    <File />
                    <span className="truncate">{item.file}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{item.state}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.tree.map((item, index) => (
                <Tree key={index} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

function Tree({ item }: { item: TreeItem }) {
  const { state, isMobile } = useSidebar()
  const [name, ...items] = Array.isArray(item) ? item : [item]

  // Leaf node: disable transitions for a no-effect feel
  if (!items.length) {
    return (
      <SidebarMenuButton
        isActive={name === "button.tsx"}
        className="data-[active=true]:bg-transparent transition-none"
        tooltip={typeof name === "string" ? name : undefined}
      >
        <File />
        <span className="truncate">{String(name)}</span>
      </SidebarMenuButton>
    )
  }

  // Collapsed (mini) mode: show hover flyout to the right, with no animation and no delay
  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCardTrigger asChild>
            {/* Disable tooltip on collapsed folders to avoid double overlays */}
            <SidebarMenuButton tooltip={undefined} className="transition-none">
              <Folder />
              <span className="truncate">{String(name)}</span>
            </SidebarMenuButton>
          </HoverCardTrigger>
          <HoverCardContent
            side="right"
            align="start"
            sideOffset={8}
            className="p-1 w-64 data-[state=open]:animate-none data-[state=closed]:animate-none transition-none"
          >
            <FlyoutSubItems items={items} />
          </HoverCardContent>
        </HoverCard>
      </SidebarMenuItem>
    )
  }

  // Expanded mode: collapsible tree with chevron on the right, no transition
  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg.chevron]:rotate-90"
        defaultOpen={name === "components" || name === "ui"}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={typeof name === "string" ? name : String(name)} className="transition-none">
            <Folder />
            <span className="truncate">{String(name)}</span>
            <ChevronRight className="chevron ml-auto size-4 shrink-0 text-muted-foreground" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree key={index} item={subItem} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}

function FlyoutSubItems({ items }: { items: TreeItem[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((subItem, index) => {
        const [subName, ...subChildren] = Array.isArray(subItem) ? subItem : [subItem]
        const hasChildren = Array.isArray(subItem) && subChildren.length > 0

        if (!hasChildren) {
          return (
            <li key={index}>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <File className="size-4" />
                <span className="truncate">{String(subName)}</span>
              </button>
            </li>
          )
        }

        return (
          <li key={index} className="relative">
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <Folder className="size-4" />
                  <span className="truncate font-medium">{String(subName)}</span>
                  <ChevronRight className="chevron ml-auto size-4 shrink-0 opacity-70 text-muted-foreground" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent
                side="right"
                align="start"
                sideOffset={8}
                className="p-1 w-64 data-[state=open]:animate-none data-[state=closed]:animate-none transition-none"
              >
                <FlyoutSubItems items={subChildren} />
              </HoverCardContent>
            </HoverCard>
          </li>
        )
      })}
    </ul>
  )
}
