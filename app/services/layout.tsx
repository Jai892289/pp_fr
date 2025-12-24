import type { ReactNode } from "react"
import ServiceLayout from "@/components/layout/ServicesLayout"

export default function Layout({ children }: { children: ReactNode }) {
  return <ServiceLayout>{children}</ServiceLayout>
}
