"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
} from "@react-google-maps/api";

type TrackPoint = {
  latitude: number;
  longitude: number;
  created_date?: string;
};
type UserTrack = { user_id: number; locations: TrackPoint[] };

interface GisViewGoogleCardProps {
  data: UserTrack[];
}

const containerStyle = { width: "100%", height: "65vh" };

const isValidLat = (v: unknown): v is number =>
  typeof v === "number" && !isNaN(v) && Math.abs(v) <= 90;
const isValidLng = (v: unknown): v is number =>
  typeof v === "number" && !isNaN(v) && Math.abs(v) <= 180;

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // India center

// Parse "DD-MM-YYYY HH:mm:ss"
const parseDDMMYYYY = (s?: string): number => {
  if (!s) return NaN;
  const [datePart, timePart = "00:00:00"] = s.split(" ");
  const [dd, mm, yyyy] = datePart.split("-").map(Number);
  const [HH, MM, SS] = timePart.split(":").map(Number);
  return new Date(
    yyyy,
    (mm ?? 1) - 1,
    dd ?? 1,
    HH ?? 0,
    MM ?? 0,
    SS ?? 0
  ).getTime();
};

// Deterministic color per user
const palette = [
  "#d32f2f",
  "#1976d2",
  "#388e3c",
  "#f57c00",
  "#7b1fa2",
  "#0097a7",
  "#c2185b",
  "#512da8",
  "#00796b",
  "#455a64",
];
const colorForUser = (userId: number) =>
  palette[Math.abs(userId) % palette.length];

const GisViewGoogleCard: React.FC<GisViewGoogleCardProps> = ({ data }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Normalize + clean + sort
  const tracks: UserTrack[] = useMemo(() => {
    return (Array.isArray(data) ? data : []).map((u) => {
      const valid = (u.locations ?? []).filter(
        (loc) => isValidLat(loc.latitude) && isValidLng(loc.longitude)
      );
      const sorted = valid
        .map((loc) => ({ ...loc, __ts: parseDDMMYYYY(loc.created_date) }))
        .sort((a, b) => (a.__ts ?? 0) - (b.__ts ?? 0))
        .map(({ __ts, ...rest }) => rest);
      return { user_id: u.user_id, locations: sorted };
    });
  }, [data]);

  // Center map to first valid point or fallback
  const center = useMemo(() => {
    for (const t of tracks) {
      if (t.locations?.length) {
        return { lat: t.locations[0].latitude, lng: t.locations[0].longitude };
      }
    }
    return DEFAULT_CENTER;
  }, [tracks]);

  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      const bounds = new google.maps.LatLngBounds();
      let count = 0;
      tracks.forEach((t) =>
        t.locations.forEach((p) => {
          bounds.extend({ lat: p.latitude, lng: p.longitude });
          count++;
        })
      );

      if (count >= 2) mapInstance.fitBounds(bounds, 64);
      else if (count === 1) {
        const t = tracks.find((tt) => tt.locations.length > 0)!;
        const p = t.locations[0];
        mapInstance.setCenter({ lat: p.latitude, lng: p.longitude });
        mapInstance.setZoom(15);
      } else {
        mapInstance.setCenter(DEFAULT_CENTER);
        mapInstance.setZoom(5);
      }

      setMap(mapInstance);
    },
    [tracks]
  );

  const onUnmount = useCallback(() => setMap(null), []);

  if (loadError)
    return <div className="text-red-500">Failed to load Google Maps</div>;
  if (!isLoaded) return <div className="text-gray-500">Loading map...</div>;

  const hasAnyPoints = tracks.some((t) => t.locations.length > 0);

  return (
    <>
      {hasAnyPoints ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {tracks.map((u) => {
            const path = u.locations.map((loc) => ({
              lat: loc.latitude,
              lng: loc.longitude,
            }));
            const color = colorForUser(u.user_id);

            return (
              <React.Fragment key={`user-${u.user_id}`}>
                {/* Straight polyline connection */}
                {path.length > 1 && (
                  <Polyline
                    path={path}
                    options={{
                      geodesic: true,
                      strokeOpacity: 0.8,
                      strokeWeight: 3,
                      strokeColor: color,
                    }}
                  />
                )}

                {/* Numbered markers */}
                {u.locations.map((loc, i) => (
                  <Marker
                    key={`${u.user_id}-${loc.latitude}-${loc.longitude}-${i}`}
                    position={{ lat: loc.latitude, lng: loc.longitude }}
                    label={{
                      text: String(i + 1),
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                    zIndex={i + 1}
                  />
                ))}
              </React.Fragment>
            );
          })}
        </GoogleMap>
      ) : (
        <div className="flex w-full h-[65vh] items-center justify-center">
          <p className="text-2xl">No GIS Data Found</p>
        </div>
      )}
    </>
  );
};

export default React.memo(GisViewGoogleCard);
