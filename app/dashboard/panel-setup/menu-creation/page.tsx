
"use client";

import { MenuTable } from './menu-table';
import { getAllMenu } from '@/lib/menuApi';
import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';

export default function ULBTypePage() {

  return (
      <PageContainer>
            <div className='flex flex-1 flex-col space-y-2'>
           <Suspense
             fallback={
               <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
                 <div className="animate-pulse">
                   <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                   <div className="text-sm text-gray-500">Loading Menu...</div>
                 </div>
               </div>
             }
           >
             <MenuTable  />
           </Suspense>
         </div>
   
      </PageContainer>
  );
}