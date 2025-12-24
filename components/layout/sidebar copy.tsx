"use client"
import { ChevronRight, File, Folder } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
} from "@/components/ui/sidebar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type RawMenu = any

type MenuNode = {
  id: string
  name: string
  href?: string
  children?: MenuNode[]
  expanded?: boolean
}

// Normalize arbitrary API menu shapes into a stable tree.
// Handles common key variants safely: label/title/name/text, href/url/path/link, children/items/nodes/routes/menu/submenu.
function normalizeMenu(input: RawMenu, parentKey = "root", maxDepth = 8, depth = 0): MenuNode[] {
  if (!input || depth > maxDepth) return []

  const arr: any[] = Array.isArray(input)
    ? input
    : typeof input === "object"
      ? // try known containers
        (input.data ?? input.menu ?? input.items ?? input.children ?? input.nodes ?? input.routes ?? input)
      : []

  if (!Array.isArray(arr)) return []

  const toArray = (val: any) => (Array.isArray(val) ? val : val ? [val] : [])

  return arr
    .map((item, index) => {
      // Strings or primitives -> leaf node
      if (typeof item === "string" || typeof item === "number") {
        const label = String(item)
        return {
          id: `${parentKey}-${index}-${label}`,
          name: label,
        } as MenuNode
      }

      // Tuples like ["folder", ["child1", ...]] (from sample tree) -> folder node
      if (Array.isArray(item)) {
        const [head, ...rest] = item
        const label = String(head ?? "Untitled")
        const childrenRaw = rest?.length ? rest : []
        const children = normalizeMenu(childrenRaw, `${parentKey}-${index}`, maxDepth, depth + 1)
        return {
          id: `${parentKey}-${index}-${label}`,
          name: label,
          children,
        } as MenuNode
      }

      // Objects -> extract keys defensively
      if (typeof item === "object" && item) {
        const name = deriveName(item)

        const href = deriveHref(item)

        const childrenRaw =
          item.children ?? item.items ?? item.nodes ?? item.routes ?? item.menu ?? item.submenu ?? item.subMenu ?? []

        const children = normalizeMenu(toArray(childrenRaw), `${parentKey}-${index}`, maxDepth, depth + 1)

        return {
          id: normalizeId(item.id ?? item.key ?? `${parentKey}-${index}-${name}`) ?? `${parentKey}-${index}-${name}`,
          name,
          href,
          children: children.length ? children : undefined,
          expanded: Boolean(item.expanded ?? item.defaultOpen ?? false),
        } as MenuNode
      }

      return null
    })
    .filter(Boolean) as MenuNode[]
}

// Utility to check if a branch contains the active path for default open behavior.
function branchHasActive(nodes: MenuNode[] | undefined, pathname: string): boolean {
  if (!nodes) return false
  for (const n of nodes) {
    const selfActive = n.href ? pathname === n.href || pathname.startsWith(n.href) : false
    if (selfActive) return true
    if (n.children && branchHasActive(n.children, pathname)) return true
  }
  return false
}

type SidebarProps = {
  menuList: any[]
  isLoading?: boolean
}

function isFlatMenuList(arr: any[]): boolean {
  return (
    Array.isArray(arr) &&
    arr.length > 0 &&
    arr.every((it) => typeof it === "object" && ("pk_id" in it || "parentmenuid" in it || "parentId" in it))
  )
}

function normalizeId(raw: any): string | undefined {
  if (raw === null || raw === undefined) return undefined
  const s = String(raw)
  if (!s || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return undefined
  return s
}

function normalizeParentId(raw: any): string | undefined {
  const id = normalizeId(raw)
  if (id === undefined) return undefined
  // Treat 0, "0", "" as root
  if (id === "0" || id === "") return undefined
  return id
}

function deriveName(item: any): string {
  return (
    item.menuname ??
    item.menuName ??
    item.label ??
    item.title ??
    item.name ??
    item.text ??
    item.key ??
    `Untitled ${item.pk_id ?? item.id ?? ""}`
  )
}

function deriveHref(item: any): string | undefined {
  const direct =
    item.href ?? item.url ?? item.path ?? item.link ?? (typeof item.route === "string" ? item.route : undefined)
  if (typeof direct === "string" && direct.length) return direct

  // Common backend fields: controller + actionfunction
  const controller = item.controller ?? item.Controller ?? item.controllerName ?? item.module ?? item.area
  const action = item.actionfunction ?? item.actionFunction ?? item.action ?? item.method
  if (typeof controller === "string" && controller.length) {
    if (typeof action === "string" && action.length) {
      return `/${String(controller).replace(/^\/+/, "")}/${String(action).replace(/^\/+/, "")}`
    }
    return `/${String(controller).replace(/^\/+/, "")}`
  }
  return undefined
}

function buildTreeFromFlat(flat: any[]): MenuNode[] {
  // First pass: create all nodes without children relationships
  const nodesById = new Map<string, MenuNode & { _parentId?: string }>()
  for (let i = 0; i < flat.length; i++) {
    const raw = flat[i]
    const id = normalizeId(raw.pk_id) ?? normalizeId(raw.id) ?? normalizeId(raw.menuid) ?? `${deriveName(raw)}::${i}`

    const parentId =
      normalizeParentId(raw.parentmenuid) ??
      normalizeParentId(raw.parentId) ??
      normalizeParentId(raw.parentid) ??
      normalizeParentId(raw.parent)

    const node: MenuNode & { _parentId?: string } = {
      id,
      name: String(deriveName(raw)),
      href: deriveHref(raw),
      children: undefined,
      expanded: Boolean(raw.expanded ?? raw.defaultOpen ?? false),
      _parentId: parentId,
    }
    // If duplicate ids appear, suffix with index to keep keys unique but stable-ish
    if (nodesById.has(node.id)) {
      node.id = `${node.id}::${i}`
    }
    nodesById.set(node.id, node)
  }

  // Second pass: attach children to parents
  const roots: MenuNode[] = []
  for (const node of nodesById.values()) {
    const parentId = (node as Record<string, unknown>)._parentId as string | undefined
    if (parentId && nodesById.has(parentId) && parentId !== node.id) {
      const parent = nodesById.get(parentId)!
      parent.children = parent.children ?? []
      parent.children.push(node)
    } else {
      // No parent or invalid -> root
      roots.push(node)
    }
    // Cleanup temp field
    delete (node as Record<string, unknown>)._parentId
  }

  return roots
}

export function AppSidebar({ menuList, isLoading = false, ...props }: SidebarProps) {
  // Normalize menuList; if empty, keep an empty menu (no sample data unless you prefer fallback)
  const nodes = React.useMemo<MenuNode[]>(() => {
    try {
      if (Array.isArray(menuList) && isFlatMenuList(menuList)) {
        const tree = buildTreeFromFlat(menuList)
        return tree
      }
      const normalized = normalizeMenu(menuList)
      if (normalized.length) return normalized
      return [] // empty state if API returned nothing
    } catch {
      return [] // in case of unexpected shape
    }
  }, [menuList])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-2">
        {/* <SidebarTrigger /> */}
        {/* Keep header minimal to avoid visual effects */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <LoadingSkeleton />
              ) : nodes.length === 0 ? (
                <EmptyMenu />
              ) : (
                nodes.map((node) => <TreeNode key={node.id} node={node} />)
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

function TreeNode({ node }: { node: MenuNode }) {
  const { state, isMobile } = useSidebar()
  const pathname = usePathname()
  const active = node.href ? pathname === node.href || pathname?.startsWith(node.href) : false

  // Leaf node: disable transitions for a no-effect feel
  if (!node.children || node.children.length === 0) {
    const content = (
      <SidebarMenuButton
        isActive={active}
        className="data-[active=true]:bg-transparent transition-none"
        tooltip={node.name}
        asChild={Boolean(node.href)}
      >
        {node.href ? (
          <Link href={node.href}>
            <File />
            <span className="truncate">{node.name}</span>
          </Link>
        ) : (
          <>
            <File />
            <span className="truncate">{node.name}</span>
          </>
        )}
      </SidebarMenuButton>
    )

    return <SidebarMenuItem>{content}</SidebarMenuItem>
  }

  // Collapsed (mini) mode: hover flyout to the right, with no animation
  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCardTrigger asChild>
            <SidebarMenuButton tooltip={undefined} className="transition-none">
              <Folder />
              <span className="truncate">{node.name}</span>
            </SidebarMenuButton>
          </HoverCardTrigger>
          <HoverCardContent
            side="right"
            align="start"
            sideOffset={8}
            className="p-1 w-64 data-[state=open]:animate-none data-[state=closed]:animate-none transition-none"
          >
            <FlyoutSubItems items={node.children ?? []} />
          </HoverCardContent>
        </HoverCard>
      </SidebarMenuItem>
    )
  }

  // Expanded mode: collapsible with chevron; open when node.expanded or any descendant is active
  const shouldOpen = Boolean(node.expanded) || branchHasActive(node.children, pathname)

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg.chevron]:rotate-90"
        defaultOpen={shouldOpen}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={node.name} className="transition-none">
            <Folder />
            <span className="truncate">{node.name}</span>
            <ChevronRight className="chevron ml-auto size-4 shrink-0 text-muted-foreground" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {(node.children ?? []).map((child) => (
              <TreeNode key={child.id} node={child} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}

function FlyoutSubItems({ items }: { items: MenuNode[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((n) => {
        const hasChildren = !!(n.children && n.children.length > 0)
        const isActive = Boolean(n.href) && window.location.pathname.startsWith(n.href!)

        if (!hasChildren) {
          const content = (
            <>
              <File className="size-4" />
              <span className="truncate">{n.name}</span>
            </>
          )
          return (
            <li key={n.id}>
              {n.href ? (
                <Link
                  href={n.href}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-none data-[active=true]:bg-transparent"
                  data-active={isActive}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-none"
                >
                  {content}
                </button>
              )}
            </li>
          )
        }

        return (
          <li key={n.id} className="relative">
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-none"
                >
                  <Folder className="size-4" />
                  <span className="truncate font-medium">{n.name}</span>
                  <ChevronRight className="chevron ml-auto size-4 shrink-0 opacity-70 text-muted-foreground" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent
                side="right"
                align="start"
                sideOffset={8}
                className="p-1 w-64 data-[state=open]:animate-none data-[state=closed]:animate-none transition-none"
              >
                <FlyoutSubItems items={n.children ?? []} />
              </HoverCardContent>
            </HoverCard>
          </li>
        )
      })}
    </ul>
  )
}

function LoadingSkeleton() {
  return (
    <>
      {/* Simple loading placeholders without animation/effects */}
      <SidebarMenuItem>
        <SidebarMenuButton className="transition-none opacity-60 pointer-events-none">
          <Folder />
          <span className="truncate">Loading…</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton className="transition-none opacity-60 pointer-events-none">
          <File />
          <span className="truncate">Loading…</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  )
}

function EmptyMenu() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton className="transition-none opacity-70">
        <File />
        <span className="truncate">No items</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
