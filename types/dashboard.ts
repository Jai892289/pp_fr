// Represents a single latitude/longitude entry
export interface LocationPoint {
  latitude: number | null;
  longitude: number | null;
  created_date: Date;
}

// Represents all locations grouped for one user
export interface UserMapData {
  user_id: number;
  locations: LocationPoint[];
}