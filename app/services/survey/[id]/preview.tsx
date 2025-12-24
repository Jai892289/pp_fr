// File: SurveyDetailsView.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { getSurveyDetails } from "@/apicalls/surveySetup";
import { SurveyDetail } from "@/types/survey";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// ---- Config ----
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ""}`;
console.log("API_BASE:", API_BASE);

// ---- Helpers ----
const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);
const isImage = (url: string) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);
const isPdf = (url: string) => /\.pdf$/i.test(url);

const buildFileUrl = (maybePath?: string | null) => {
  if (!maybePath) return null;
  // allow absolute URLs directly; otherwise prefix API base (if present)
  const cleanedBase = (API_BASE || "").replace(/\/+$/, "");
  const cleanedPath = maybePath.replace(/^\/+/, "");
  if (isAbsoluteUrl(maybePath)) return maybePath;
  if (cleanedBase) return `${cleanedBase}/${cleanedPath}`;
  return `/${cleanedPath}`;
};

const getFileName = (urlOrPath: string, fallback = "Document") => {
  try {
    const noQuery = urlOrPath.split("?")[0].split("#")[0];
    const last = noQuery.split("/").pop() || fallback;
    return decodeURIComponent(last);
  } catch {
    return fallback;
  }
};

// ---- Component ----
interface PreviewProps {
  id: string;
}

export default function SurveyDetailsView({ id }: PreviewProps) {
  const [data, setData] = useState<SurveyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getSurveyDetails(Number(id));

      if (response && response.data) {
        setData(response.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchData();
  }, [id, fetchData]);

  if (isLoading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>;
  if (!data) return <div className="text-center p-6">No data found</div>;

  const renderField = (
    label: string,
    value: string | number | null | undefined
  ) => (
    <div className="space-y-1">
      <Label className="text-black font-semibold text-base">{label}</Label>
      <p className="text-gray-800 break-words text-xs">{value ?? "-"}</p>
    </div>
  );

  // Pre-build property image URL (supports abs/relative)
  const propertyImageUrl = buildFileUrl(data?.user_charge_data?.property_image);

  return (
    <div className="bg-background rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
      <div className="flex justify-between items-center container mx-auto py-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push(`/services/survey`)}
          className="hidden md:flex m-3"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/services/survey`)}
          className="md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-2 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black">
            Survey Details
          </h1>
        </div>

        {/* Survey Basic Info */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm bg-white overflow-x-auto">
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-black mb-4 border-b pb-2">
            <Image
              src="/online-survey.png"
              alt="Survey Icon"
              width={28}
              height={28}
            />
            Survey Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {renderField("Surveyor's name", data.user_full_name)}
            {renderField(
              "Created At",
              data.created_at ? new Date(data.created_at).toLocaleString() : "-"
            )}
          </div>
        </div>

        {/* Property Details */}
        {data.user_charge_data && (
          <div className="border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm bg-white overflow-x-auto">
            <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-black mb-4 border-b pb-2">
              <Image
                src="/listing.png"
                alt="Property Icon"
                width={28}
                height={28}
              />
              Property Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {renderField(
                "Property ID",
                data.user_charge_data.integrated_property_id
              )}
              {renderField(
                "Owner Name",
                data.user_charge_data.integrated_owner_name
              )}
              {/* {renderField(
                "Integrated Property ID",
                data.user_charge_data.integrated_property_id
              )}
              {renderField(
                "Integrated Owner",
                data.user_charge_data.integrated_owner_name
              )} */}
              {renderField("Colony", data.user_charge_data.colony)}
              {renderField("Address", data.user_charge_data.address)}
              {renderField("Area", data.user_charge_data.area)}
              {renderField("Category", data.user_charge_data.category)}
              {renderField("Type", data.user_charge_data.type)}
              {renderField("Sub Type", data.user_charge_data.sub_type)}
            </div>

            {propertyImageUrl && (
              <div className="mt-4 sm:mt-6">
                <Label className="text-black font-semibold text-base">
                  Property Image
                </Label>
                <div className="relative rounded-sm overflow-hidden object-contain w-44 aspect-square">
                  <Image
                    src={propertyImageUrl}
                    alt="Employee Image"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 120px, 200px"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm bg-white overflow-x-auto">
          <h2 className="flex items-center   gap-2 text-lg sm:text-xl font-bold text-black mb-4 border-b pb-2">
            <Image
              src="/documents.png"
              alt="Documents Icon"
              width={28}
              height={28}
            />
            Documents
          </h2>

          {data.doc_path && data.doc_path.length > 0 ? (
            <div className="relative rounded-sm overflow-hidden object-contain w-44 aspect-square">
              {data.doc_path.map((rawDoc: string, index: number) => {
                const url = buildFileUrl(rawDoc);
                const fileName =  `Document ${index + 1}`;

                return (
                  <div
                    key={`${rawDoc}-${index}`}
                    className="space-y-2 p-3 border rounded-lg  bg-gray-50 hover:shadow-md transition"
                  >
                    <Label
                      className="font-semibold text-black text-base line-clamp-1"
                      title={fileName}
                    >
                      {fileName}
                    </Label>

                    {!url ? (
                      <p className="text-sm text-gray-500">No file available</p>
                    ) : isImage(url) ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Image
                          src={url}
                          alt={fileName}
                          width={100}
                          height={60}
                          unoptimized
                          className="rounded-md border object-contain hover:opacity-90 transition w-full"
                        />
                      </a>
                    ) : isPdf(url) ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 px-3 py-2 border rounded-md bg-white hover:bg-gray-50"
                      >
                        <span className="text-sm font-medium truncate">
                          {fileName}
                        </span>
                        {/* simple file icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M3 4a2 2 0 012-2h6l4 4v10a2 2 0 01-2 2H5a2 2 0 01-2-2V4z" />
                        </svg>
                      </a>
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 px-3 py-2 border rounded-md bg-white hover:bg-gray-50"
                      >
                        <span className="text-sm font-medium truncate">
                          {fileName}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M3 3a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H9l-4 3v-3H5a2 2 0 01-2-2V3z" />
                        </svg>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-700 text-xs">No documents uploaded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
