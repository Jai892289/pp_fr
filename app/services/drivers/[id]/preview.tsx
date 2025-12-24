"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { getDriversDetails } from "@/apicalls/driverSetup";
import { SurveyDetail } from "@/types/survey";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewProps {
  id: string;
}

export default function DriversDetailsView({ id }: PreviewProps) {
  const [data, setData] = useState<SurveyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getDriversDetails(Number(id));
        setData(response?.data);
      
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

  return (
    <div className="bg-background rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
      <div className="flex justify-between items-center container mx-auto py-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push(`/services/drivers`)}
          className="hidden md:flex m-3"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/services/drivers`)}
          className="md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-2 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black">
            Drivers Details
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
            Basic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* {renderField("QR Number", data.qr_number)} */}
            {renderField("Driver's name", data.user_full_name)}

            {renderField(
              "Created At",
              new Date(data.created_at).toLocaleString()
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
              {renderField("Property ID", data.user_charge_data.integrated_property_id)}
              {renderField("Owner Name", data.user_charge_data.integrated_owner_name)}
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
              {/* {renderField("Category", data.user_charge_data.category)} */}
              {/* {renderField("Type", data.user_charge_data.type)} */}
              {/* {renderField("Sub Type", data.user_charge_data.sub_type)} */}
            </div>

            {/* {data.user_charge_data.property_image && (
              <div className="mt-4 sm:mt-6">
                <Label className="text-black font-semibold text-base">
                  Property Image
                </Label>
                <div className="mt-2 w-full flex justify-center">
                  <Image
                    src={data?.user_charge_data?.property_image}
                    alt="Property Image"
                    width={150}
                    height={150}
                    className="rounded-lg border object-cover w-full max-w-md"
                  />
                </div>
              </div>
            )} */}
          </div>
        )}

        {/* Documents */}
        {/* <div className="border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm bg-white overflow-x-auto">
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-black mb-4 border-b pb-2">
            <Image
              src="/documents.png"
              alt="Documents Icon"
              width={28}
              height={28}
            />
            Documents
          </h2>
          {data.doc_path && data.doc_path.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {data.doc_path.map((doc: string, index: number) => (
                <div
                  key={index}
                  className="space-y-2 p-3 border rounded-lg bg-gray-50 hover:shadow-md transition"
                >
                  <Label className="font-semibold text-black text-base">
                    Document {index + 1}
                  </Label>
                  <a href={doc} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={doc}
                      alt={`Document ${index + 1}`}
                      width={200}
                      height={120}
                      className="rounded-md border object-cover hover:opacity-90 transition w-full"
                    />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700 text-xs">No documents uploaded.</p>
          )}
        </div> */}
      </div>
    </div>
  );
}
