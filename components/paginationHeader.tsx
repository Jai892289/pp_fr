"use client"


import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@radix-ui/react-separator"

export function PaginationHeader({ title }: { title: string}) {

  return (
    <header className=" flex flex-wrap items-center justify-between space-y-2">
        <div className="flex flex-col">
            <h1 className="text-xl text-primary font-bold tracking-tight lg:text-2xl">{title}</h1>
        </div>
      <div className="flex items-center gap-2">
        {/* <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
        >
          <SidebarIcon />
        </Button> */}
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                {/* folder name */}
                {title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
              {/* page name */}
              {title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
