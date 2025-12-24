"use client";

import { LoginForm } from "@/components/auth/login-form";
// import Download from "@/components/download";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useRouter } from 'next/navigation'
import Image from "next/image";
import pplogo from '@/public/pplogo.jpg'

export default function LoginPage() {
  const [user, setUser] = useState<string | null>(null)
  const selectUser = (selection: string) => {
    setUser(selection)
  }
  return (
    <div className="min-h-screen relative overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full opacity-50 pointer-events-none"
        viewBox="0 0 2400 1600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.78 0.17 160)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="oklch(0.65 0.12 165)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="oklch(0.55 0.08 170)" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.70 0.15 155)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="oklch(0.75 0.14 162)" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="grad3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.80 0.18 158)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="oklch(0.60 0.10 168)" stopOpacity="0.1" />
          </radialGradient>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          </filter>
          <filter id="softBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
          </filter>
        </defs>

        {/* Organic flowing shapes */}
        <path
          d="M 200,400 Q 400,200 700,300 T 1300,250 T 1900,350 Q 2100,400 2200,600 L 2200,900 Q 1900,800 1600,900 T 800,850 T 200,900 Z"
          fill="url(#grad1)"
          filter="url(#softBlur)"
        />

        {/* Flowing wave pattern */}
        <path
          d="M 0,1000 Q 300,900 600,1000 T 1200,950 T 1800,1000 T 2400,950 L 2400,1600 Q 2000,1500 1600,1550 T 800,1500 T 0,1600 Z"
          fill="url(#grad2)"
          filter="url(#softBlur)"
        />

        {/* Radial accent shapes */}
        <circle cx="600" cy="400" r="350" fill="url(#grad3)" filter="url(#blur)" />
        <circle cx="1800" cy="1200" r="300" fill="url(#grad3)" filter="url(#blur)" />
        <ellipse cx="1200" cy="800" rx="450" ry="280" fill="url(#grad1)" opacity="0.3" filter="url(#softBlur)" />
      </svg>

      {user === null && (<div className="relative z-10 flex items-center justify-center min-h-screen p-4 gap-4">
        <RoleSelector selectUser={selectUser} />
      </div>)}
      {user === 'admin' && (<div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <LoginForm />
      </div>)}
      {user === 'citizen' && (<div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <h1>Citizen</h1>
      </div>)}
      {/* <div className="absolute bottom-6 right-6 z-20">
        <Download />
      </div> */}
    </div>
  );
}

function RoleSelector({ selectUser }: { selectUser: any }) {
  const router = useRouter()

  const handleAdminClick = () => {
    selectUser('admin')
  }

  const handleCitizenClick = () => {
    router.push('/citizen-login')
  }

  return (
    <div className="w-full max-w-2xl px-4">
      <Image
        src={pplogo}
        alt="PP Logo"
        className="mx-auto p-1 mb-8 w-32 h-32 object-contain rounded-full border-4 border-primary"
        width={128}
        height={128}
      />
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Select Your Role</h1>
        <p className="text-muted-foreground">Choose how you want to proceed</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Card Button */}
        <button
          onClick={handleAdminClick}
          className="group relative overflow-hidden rounded-lg border border-border hover:border-primary transition-all duration-300"
        >
          <Card className="h-full p-8 bg-card hover:bg-primary/5 transition-colors duration-300 cursor-pointer">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Admin</h2>
                <p className="text-sm text-muted-foreground">
                  Manage and oversee the system
                </p>
              </div>
            </div>
          </Card>
        </button>

        {/* Citizen Card Button */}
        <button
          onClick={handleCitizenClick}
          className="group relative overflow-hidden rounded-lg border border-border hover:border-primary transition-all duration-300"
        >
          <Card className="h-full p-8 bg-card hover:bg-primary/5 transition-colors duration-300 cursor-pointer">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Citizen</h2>
                <p className="text-sm text-muted-foreground">
                  Access your personal dashboard
                </p>
              </div>
            </div>
          </Card>
        </button>
      </div>
    </div>
  )
}