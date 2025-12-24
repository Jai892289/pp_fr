"use client";

import { getProperty } from "@/apicalls/property";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PreviousCollection {
  date: string
  status: "completed" | "pending"
}

export default function Property() {
  const [property, setProperty] = useState<any>({})
  const params = useParams();
  const pid = params.id
  const [showPrevious, setShowPrevious] = useState(false)

  const previousCollections: PreviousCollection[] = [
    { date: "Nov 21, 2024 at 10:15 AM", status: "completed" },
    { date: "Nov 14, 2024 at 10:45 AM", status: "completed" },
    { date: "Nov 7, 2024 at 9:30 AM", status: "completed" },
  ]

  useEffect(() => {
    if (pid) {
      const getPropertyData = async () => {
        const response = await getProperty(String(pid))
        setProperty(response.data?.data)
      }
      getPropertyData()
    }
  }, [pid])

  if (!property) return <p>Loading...</p>;

  return (
    <main className="h-screen bg-gradient-to-b from-slate-50 to-slate-100 overflow-y-scroll">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Property Details</h1>
          <p className="text-sm text-slate-600 mt-1">ID: {property.integrated_property_id}</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative w-full h-96 bg-slate-200">
                <Image
                  src={property.property_image || "/placeholder.svg"}
                  alt={`${property.type} at ${property.colony}`}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* Key Property Details */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Property Information</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-slate-600 font-medium">Type</p>
                  <p className="text-lg font-semibold text-slate-900">{property.type}</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-slate-600 font-medium">Sub Type</p>
                  <p className="text-lg font-semibold text-slate-900">{property.sub_type}</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-slate-600 font-medium">Category</p>
                  <p className="text-lg font-semibold text-slate-900">{property.category}</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm text-slate-600 font-medium">Area</p>
                  <p className="text-lg font-semibold text-slate-900">{property.area} {property.unit}</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm text-slate-600 font-medium">Authorized</p>
                  <p className="text-lg font-semibold text-slate-900">{property.authorized_area}</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm text-slate-600 font-medium">Self Certified</p>
                  <p className="text-lg font-semibold text-slate-900">{property.is_selfcertified}</p>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Location
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Address</p>
                  <p className="text-slate-900">{property.address}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Colony</p>
                  <p className="text-slate-900">{property.colony}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Latitude</p>
                    <p className="text-slate-900 font-mono">{property.latitude}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Longitude</p>
                    <p className="text-slate-900 font-mono">{property.longitude}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Owner & Contact Info */}
          <div className="space-y-6">
            {/* Owner Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-8 border border-blue-200">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Owner Information</h2>

              <div className="space-y-6">
                <div>
                  <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Owner Name</p>
                  <p className="text-lg font-semibold text-slate-900 mt-2">{property.owner_name}</p>
                </div>

                {/* <div className="pt-4 border-t border-blue-200">
                  <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Contact</p>
                  <a href={`tel:${property.mobile}`} className="flex items-center gap-2 mt-2 text-blue-600 hover:text-blue-700 font-semibold">
                    <Phone className="w-5 h-5" />
                    {property.mobile}
                  </a>
                </div> */}

                <div className="pt-4 border-t border-blue-200">
                  <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Municipality</p>
                  <p className="text-lg font-semibold text-slate-900 mt-2">{property.mc_name}</p>
                </div>
              </div>
            </div>

            {/* IDs Card */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Identifiers</h2>

              <div className="space-y-4">
                {/* <div className="bg-slate-50 p-4 rounded">
                  <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Property ID</p>
                  <p className="text-sm font-mono text-slate-900 mt-2">{property.property_id}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded">
                  <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Integrated ID</p>
                  <p className="text-sm font-mono text-slate-900 mt-2">{property.integrated_property_id}</p>
                </div> */}

                <div className="bg-slate-50 p-4 rounded">
                  <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Bill Sequence</p>
                  <p className="text-sm font-mono text-slate-900 mt-2">{property.bill_sequence}</p>
                </div>
              </div>
            </div>


            <main className="min-h-screen bg-background p-8">
              <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-8">Property Dashboard</h1>

                <div className="bg-white rounded-lg shadow-md p-8">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Waste Collection Status</h2>
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded">
                      <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Status</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Completed
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded">
                      <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Last Collected</p>
                      <p className="text-sm font-mono text-slate-900 mt-2">Nov 28, 2024 at 10:30 AM</p>
                    </div>
                    <button
                      onClick={() => setShowPrevious(true)}
                      className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                    >
                      View Previous Collections
                    </button>
                  </div>
                </div>

                <Dialog open={showPrevious} onOpenChange={setShowPrevious}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Previous Collections</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {previousCollections.map((collection, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-50 p-4 rounded">
                          <p className="text-sm font-mono text-slate-900">{collection.date}</p>
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${collection.status === "completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                              }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${collection.status === "completed" ? "bg-green-500" : "bg-amber-500"
                                }`}
                            ></span>
                            {collection.status === "completed" ? "Completed" : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </main>


          </div>
        </div>
      </div>
    </main>
  );
}
