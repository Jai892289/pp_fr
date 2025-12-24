"use client";

import { Suspense, use } from "react";
import SurveyDetailsView from "./preview";
import PageContainer from "@/components/layout/page-container";
import { decrypt } from "@/lib/cryptography";

interface SurveyViewProps {
  params: Promise<{ id: string }>;
}

export default function SurveyView({ params }: SurveyViewProps) {
  const encid = use(params); // convert to number if SurveyDetailsView expects a number

  const id = String(decrypt(encid?.id));

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-2">
        <Suspense
          fallback={
            <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                <div className="text-sm text-gray-500">Loading...</div>
              </div>
            </div>
          }
        >
          <SurveyDetailsView id={id} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
