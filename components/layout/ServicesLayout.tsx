
import KBar from '@/components/kbar';
import  AppSidebar  from './sidebar'
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import ProtectedRoute from "@/lib/ProtectedRoute"

export const metadata: Metadata = {
  title: 'Next Shadcn Dashboard Starter',
  description: 'Basic dashboard with Next.js and Shadcn'
};

export default async function ServiceLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "false"
  return (
    <ProtectedRoute>
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          {/* page main content */}
            {children}
          {/* page main content ends */}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
    </ProtectedRoute>
  );
}
