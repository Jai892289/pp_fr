// "use client"

// import { AppSidebar } from './sidebar'
// import {
//   SidebarInset,
//   SidebarProvider,
// } from '@/components/ui/sidebar'
// import { Header } from './header'
// import { useAuth } from "@/context/AuthContext"
// import ProtectedRoute from "@/lib/ProtectedRoute"
// import { Main } from "./main"
// import { useEffect, useState } from 'react'

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//   const { user, menuList, menuLoading, isLoading } = useAuth()
//   const [isClient, setIsClient] = useState(false)

//   useEffect(() => {
//     if (!isLoading) {
//       setIsClient(true)
//     }
//   }, [isLoading])

  
//   if (!isClient) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
//       </div>
//     )
//   }

//   return (
//     <ProtectedRoute>
//       <SidebarProvider>
//         <AppSidebar
//           menuList={menuList}
//           isLoading={menuLoading}
//           ulbList={user?.ulb}
//         />
//         <SidebarInset>
//           <Header user={user} />
//           <Main>
//             {children}
//           </Main>
//         </SidebarInset>
//       </SidebarProvider>
//     </ProtectedRoute>
//   )
// }

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

export default async function DashboardLayout({
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
