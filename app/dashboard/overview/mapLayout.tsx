"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import GisViewGoogleCard from "./mapView";
import { getMapData, getUserListByRole } from "@/apicalls/dashboardSetup";
import { format } from "date-fns";

/** Types */
type TrackPoint = {
  latitude: number;
  longitude: number;
  created_date?: string;
};
type UserTrack = { user_id: number; locations: TrackPoint[] };
type User = { id: number; username?: string };

const DUMMY_MAP_POINT: TrackPoint = {
  latitude: 28.7041,
  longitude: 77.1025,
  created_date: "01-01-2024 00:00:00",
};

function toTs(s?: string) {
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
}

const userTypesName = ["Surveyor", "Driver"];

export default function MapLayout() {
  const [userType, setUserType] = useState<string>("Surveyor");
  const [userList, setUserList] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    undefined
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [mapData, setMapData] = useState<UserTrack[]>([
    { user_id: 0, locations: [DUMMY_MAP_POINT] },
  ]);

  /** ✅ Stable function with no stale closure */
  const fetchMapData = useCallback(
    async (id?: number, roleParam?: string, date?: Date) => {
      setIsLoadingMap(true);
      try {
        const roleToUse = roleParam ?? userType ?? "Surveyor";
        const formattedDate = date ? format(date, "dd-MM-yyyy") : undefined;

        const res = await getMapData({
          id,
          role: roleToUse,
          date: formattedDate,
        });

        const list: UserTrack[] = Array.isArray(res)
          ? (res as UserTrack[])
          : [];
        if (list.length > 0) {
          const sorted = list.map((u) => ({
            user_id: u.user_id,
            locations: [...(u.locations ?? [])].sort(
              (a, b) => toTs(a.created_date) - toTs(b.created_date)
            ),
          }));
          console.log("Map Data:", sorted);
          setMapData(sorted);
        } else {
          setMapData([{ user_id: 0, locations: [DUMMY_MAP_POINT] }]);
        }
      } catch (err) {
        console.error("Error fetching map data:", err);
        setMapData([{ user_id: 0, locations: [DUMMY_MAP_POINT] }]);
      } finally {
        setIsLoadingMap(false);
      }
    },
    [userType]
  );

  const fetchUserListData = useCallback(async (role: string) => {
    setIsLoadingUsers(true);
    try {
      const response = await getUserListByRole(role);
      const parsed: User[] = Array.isArray(response?.userList)
        ? response.userList
        : [];
      console.log("Fetched user list:", parsed);
      setUserList(parsed);
    } catch (err) {
      console.error("Error fetching user list:", err);
      setUserList([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  /** ✅ Fetch user list + initial map when userType changes */
  useEffect(() => {
    setSelectedUserId(undefined);
    setMapData([{ user_id: 0, locations: [DUMMY_MAP_POINT] }]);
    fetchUserListData(userType);
    fetchMapData(undefined, userType, selectedDate ?? undefined);
  }, [userType, selectedDate, fetchUserListData, fetchMapData]);

  /** ✅ Refetch map when user changes */
  useEffect(() => {
    fetchMapData(selectedUserId, userType, selectedDate ?? undefined);
  }, [selectedUserId, userType, selectedDate, fetchMapData]);

  const handleReset = () => {
    setSelectedUserId(undefined);
    fetchMapData(undefined, userType, selectedDate ?? undefined);
  };

  const mapKey = useMemo(() => {
    const parts = mapData.map((u) => {
      const last = u.locations?.[u.locations.length - 1];
      return `${u.user_id}-${u.locations?.length ?? 0}-${toTs(
        last?.created_date
      )}`;
    });
    return `map-${parts.join("|")}`;
  }, [mapData]);

  return (
    <div className="col-span-4 md:col-span-3 p-4">
      <div className="mb-4 flex gap-4 flex-wrap items-center">
        {/* Role dropdown */}
        <Select value={userType} onValueChange={setUserType}>
          <SelectTrigger className="justify-start *:data-[slot=select-value]:w-12 min-w-28 p-4">
            <span className="text-muted-foreground hidden sm:block">
              Select User Role:
            </span>
            <SelectValue placeholder="Pick a role" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              {userTypesName.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectSeparator />
          </SelectContent>
        </Select>

        {/* Users dropdown */}
        <Select
          value={selectedUserId ? String(selectedUserId) : "ALL"}
          onValueChange={(v) =>
            setSelectedUserId(v === "ALL" ? undefined : Number(v))
          }
          disabled={isLoadingUsers}
        >
          <SelectTrigger className="min-w-56">
            <span className="text-muted-foreground hidden sm:block mr-2">
              Users:
            </span>
            <SelectValue
              placeholder={isLoadingUsers ? "Loading users..." : "Pick a user"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Users</SelectItem>
            {userList.map((u) => (
              <SelectItem key={u.id} value={String(u.id)}>
                {u.username ?? `User #${u.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date picker */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="px-4 py-2 border rounded">
              {selectedDate
                ? format(selectedDate, "dd-MM-yyyy")
                : "Select Date"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate ?? undefined}
              onSelect={(date) => date && setSelectedDate(date)}
            />
          </PopoverContent>
        </Popover>

        {/* Reset button */}
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reset Map
        </button>
      </div>

      {/* Map section */}
      <div>
        {isLoadingMap ? (
          <div className="p-8 text-center text-gray-500">Loading map...</div>
        ) : (
          <GisViewGoogleCard key={mapKey} data={mapData} />
        )}
      </div>
    </div>
  );
}
