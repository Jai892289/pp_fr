"use client"

import * as React from "react"
import { Check, ChevronsUpDown, GalleryVerticalEnd } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"



export function UlbSwitcher() {
  const { user, selectedUlb, switchUlb } = useAuth()
  const [localSelected, setLocalSelected] = React.useState<string>(
    selectedUlb?.name
  )

  React.useEffect(() => {
    if (selectedUlb?.name) {
      setLocalSelected(selectedUlb.name)
    }
  }, [selectedUlb])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                <GalleryVerticalEnd className='size-4' />
              </div>
              <div className='flex flex-col gap-0.5 leading-none'>
                <span className=''>{localSelected}</span>
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start"
          >
            {user?.ulb?.map((ulb: any) => (
              <DropdownMenuItem
                key={ulb.id}
                onSelect={() => {
                  setLocalSelected(ulb.name)
                  switchUlb(ulb) // ✅ store full object in global state
                }}
              >
                {ulb.name}
                {ulb.name === localSelected && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
         
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
