

'use client';
import { AuthProvider } from '@/context/AuthContext';
import React from 'react';
import { ActiveThemeProvider } from '@/components/layout/active-theme';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
 
  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
       <AuthProvider>
          {children}
        </AuthProvider>
      </ActiveThemeProvider>
    </>
  );
}
