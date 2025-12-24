"use client";

import PageContainer from "@/components/layout/page-container";
import { Label } from "@/components/ui/label";
import { Droplets, Trash2, Receipt } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

import React, { useState, useEffect, useCallback } from "react";

import { SurveyCountDetail } from "@/types/survey";
import { getSurveyDashboardCount } from "@/apicalls/surveySetup";
import { getUserListByRole } from "@/apicalls/dashboardSetup";
import MapLayout from "./mapLayout";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { getUserCharge } from "@/apicalls/citizen";
import { MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PreviousCollection {
  date: string
  status: "completed" | "pending"
}

/** Types for multi-user tracks coming from your API */
type TrackPoint = {
  latitude: number;
  longitude: number;
  created_date?: string;
};
type UserTrack = { user_id: number; locations: TrackPoint[] };

/** User type for the dropdown (adapt keys to your API) */
type User = {
  id: number;
  username?: string;
};

/** ✅ Stable dummy map fallback */
const DUMMY_MAP_POINT: TrackPoint = {
  latitude: 28.7041,
  longitude: 77.1025,
  created_date: "01-01-2024 00:00:00",
};

export function formatToISTWithAMPM(dateString: string): string {
  const date = new Date(dateString);

  // Convert UTC → IST
  const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);

  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, "0");
  const day = String(istDate.getDate()).padStart(2, "0");

  let hours = istDate.getHours();
  const minutes = String(istDate.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // 0 → 12

  const hh = String(hours).padStart(2, "0");

  return `${year}-${month}-${day} ${hh}:${minutes} ${ampm}`;
}

export function formatToYMDHM(dateString: string): string {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatLocalDateTime(dateString: string): string {
  const clean = dateString.replace("Z", "").split(".")[0]; // "2025-12-01T00:00:00"

  // Split date & time
  const [datePart, timePart] = clean.split("T");
  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats,
  hourly_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
  hourly_stats: React.ReactNode;
}) {
  const [countData, setCountData] = useState<SurveyCountDetail>();
  const [userType, setUserType] = useState<string | undefined>();
  const { user } = useAuth()
  const [property, setProperty] = useState<any>({})
  const [showPrevious, setShowPrevious] = useState(false)

  const previousCollections: PreviousCollection[] = [
    { date: "Nov 21, 2024 at 10:15 AM", status: "completed" },
    { date: "Nov 14, 2024 at 10:45 AM", status: "completed" },
    { date: "Nov 7, 2024 at 9:30 AM", status: "completed" },
  ]

  // tracks shown on the map (one array entry per user)
  const [mapData, setMapData] = useState<UserTrack[]>([
    { user_id: 0, locations: [DUMMY_MAP_POINT] },
  ]);

  // dropdown 2 state
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    undefined
  );
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const fetchCountData = useCallback(async () => {
    try {
      const response = await getSurveyDashboardCount();
      if (response?.data) setCountData(response.data);
    } catch (err) {
      console.error("Error fetching count data:", err);
    }
  }, []);

  // helper: parse "DD-MM-YYYY HH:mm:ss"
  const toTs = (s?: string) => {
    if (!s) return 0;
    const [d, t = "00:00:00"] = s.split(" ");
    const [dd, MM, yyyy] = d.split("-").map(Number);
    const [HH, mm, ss] = t.split(":").map(Number);
    return new Date(
      yyyy,
      (MM ?? 1) - 1,
      dd ?? 1,
      HH ?? 0,
      mm ?? 0,
      ss ?? 0
    ).getTime();
  };



  /** 🔔 Fetch users WHENEVER a role is selected in the Map dropdown */
  const fetchUserListData = useCallback(async (role: string) => {
    setIsLoadingUsers(true);
    try {
      const response = await getUserListByRole(role);

      // Accept either { data: { userList: [...] } } or { data: [...] }
      const fromNested = response;
      const fromFlat = response;
      const parsed: User[] = Array.isArray(fromNested)
        ? fromNested
        : Array.isArray(fromFlat)
          ? fromFlat
          : [];

      setUserList(parsed);
    } catch (err) {
      console.error("Error fetching user list:", err);
      setUserList([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  // counts once
  useEffect(() => {
    fetchCountData();
  }, [fetchCountData]);

  useEffect(() => {
    if (!userType) return;
    setSelectedUserId(undefined); // ALL
    fetchUserListData(userType);
  }, [userType, fetchUserListData /*, fetchMapData */]);


  useEffect(() => {
    const socket: Socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      transports: ["websocket"], // force WebSocket transport
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    socket.on("COUNT_UPDATE", (countData) => {
      console.log("📩 COUNT_UPDATE received:", countData);
      setCountData(countData.data); // ✅ live update dashboard counts
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (user?.roles.includes('citizen')) {
      const getPropertyData = async () => {
        const response = await getUserCharge()
        setProperty(response.data?.data)
      }
      getPropertyData()
    }
  }, [])

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-4 m-2 bg-[#55C17A11] rounded-md">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight m-2">
            Hi, Welcome back 👋
          </h2>
        </div>


        {!user?.roles.includes('citizen') && (
          <>
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4 m-4">
              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Total Workers</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {countData
                      ? countData.driverCount + countData.surveyorCount
                      : "Loading..."}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                  <div className="line-clamp-1 flex gap-2 font-medium">
                    <span className="text-muted-foreground hidden sm:block">
                      Surveyor Count:{" "}
                      {countData ? countData.surveyorCount : "Loading..."}
                    </span>
                  </div>
                  <div className="line-clamp-1 flex gap-2 font-medium">
                    <span className="text-muted-foreground hidden sm:block">
                      Driver Count:{" "}
                      {countData ? countData.driverCount : "Loading..."}
                    </span>
                  </div>
                </CardFooter>
              </Card>

              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Total Consumers</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {countData?.totalConsumerCount ?? "—"}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm" />
              </Card>

              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>QR Scan Count</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {countData?.taggedCount ?? "—"}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm" />
              </Card>

              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Pending Count</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {countData?.unTaggedCount ?? "—"}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm" />
              </Card>
            </div>

            {/* Two-row equal-height layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 m-4">
              <div className="h-full">
                <div className="h-full bg-white rounded-xl  p-4">
                  {hourly_stats}
                </div>
              </div>

              <div className="h-full">
                <div className="h-full bg-white rounded-xl ">
                  <MapLayout />
                </div>
              </div>

              {/* Row 2 */}
              <div className="h-full">
                <div className="h-full bg-white rounded-xl  p-4">
                  {bar_stats}
                </div>
              </div>

              <div className="h-full">
                <div className="h-full bg-white rounded-xl  p-4">
                  {pie_stats}
                </div>
              </div>

              {/* <div className="h-full">
                <div className="h-full bg-white rounded-xl  p-4">
                  {area_stats}
                </div>
              </div> */}

            </div>
          </>
        )}

        {user?.roles.includes('citizen') && (
          <>
            <main className="h-screen bg-gradient-to-b from-slate-50 to-slate-100 overflow-y-scroll">
              {/* Header */}
              <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-4">
                  <h1 className="text-2xl font-bold text-slate-900">Property Details</h1>
                  <p className="text-sm text-slate-600 mt-1">ID: {property?.integrated_property_id}</p>
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
                    <PropertyTaxesSection />
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


                    <div className="max-w-2xl mx-auto">

                      <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Waste Collection Status</h2>
                        <div className="space-y-4">
                          <div className="bg-slate-50 p-4 rounded">
                            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Status</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${property?.current_waste_collection_status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                <span className={`w-2 h-2 rounded-full ${property.current_waste_collection_status ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {property.current_waste_collection_status ? 'Completed' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded">
                            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Last Collected</p>
                            <p className="text-sm font-mono text-slate-900 mt-2">{property?.last_collection_date ? formatLocalDateTime(property?.last_collection_date) : '-'}</p>
                          </div>
                          <button
                            onClick={() => setShowPrevious(true)}
                            className="w-full cursor-pointer bg-blue-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded transition-colors"
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



                  </div>
                </div>
              </div>
            </main>
          </>
        )}

      </div>
    </PageContainer>
  );
}

export function PropertyTaxesSection() {
  // Static tax and utility data
  const taxData = [
    {
      id: 1,
      type: "Property Tax",
      icon: Receipt,
      amount: "₹12,500",
      dueDate: "2024-12-31",
      status: "Pending",
      statusColor: "bg-yellow-100 text-yellow-800",
      iconColor: "text-blue-600",
      backgroundColor: "bg-blue-50",
    },
    {
      id: 2,
      type: "Water Bill",
      icon: Droplets,
      amount: "₹850",
      dueDate: "2024-12-15",
      status: "Paid",
      statusColor: "bg-green-100 text-green-800",
      iconColor: "text-green-600",
      backgroundColor: "bg-green-50",
    },
    {
      id: 3,
      type: "Waste Management",
      icon: Trash2,
      amount: "₹500",
      dueDate: "2024-12-20",
      status: "Pending",
      statusColor: "bg-yellow-100 text-yellow-800",
      iconColor: "text-orange-600",
      backgroundColor: "bg-orange-50",
    },
  ]

  const totalDue = "₹13,850"

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Taxes & Utilities</h2>

      {/* Tax Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {taxData.map((tax) => {
          const IconComponent = tax.icon
          return (
            <div key={tax.id} className={`${tax.backgroundColor} rounded-lg p-6 border border-slate-200`}>
              <div className="flex items-start justify-between mb-4">
                <IconComponent className={`w-6 h-6 ${tax.iconColor}`} />
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tax.statusColor}`}>{tax.status}</span>
              </div>
              <p className="text-sm text-slate-600 font-medium mb-1">{tax.type}</p>
              <p className="text-2xl font-bold text-slate-900 mb-3">{tax.amount}</p>
              <p className="text-xs text-slate-600">Due: {tax.dueDate}</p>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 font-medium">Total Amount Due</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{totalDue}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600 font-medium">Last Updated</p>
            <p className="text-slate-900 font-semibold mt-1">Nov 28, 2025</p>
          </div>
        </div>
      </div>
      <button
        onClick={() => alert("Payment processing for " + totalDue)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
      >
        Pay Now
      </button>
    </div>
  )
}