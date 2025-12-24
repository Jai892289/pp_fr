// "use client";

// import { UsersTable } from '@/components/users-table';
// import { motion } from 'framer-motion';

// export default function UsersPage() {
//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
//         <p className="text-gray-600 dark:text-gray-400 mt-2">
//           Manage all users in your system.
//         </p>
//       </motion.div>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.1 }}
//         className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
//       >
//         <UsersTable />
//       </motion.div>
//     </div>
//   );
// }

import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { UsersTable } from '@/components/users-table';

import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Employee Setup'
};



export default async function Page() {

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Employee Setup'
            description='Manage employees (Server side table functionalities.)'
          />
         
        </div>
        <Separator />
        <Suspense
          // key={key}
          fallback={
            <Skeleton/>
          }
        >
         <UsersTable />
        </Suspense>
      </div>
    </PageContainer>
  );
}
