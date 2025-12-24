import { Agency } from './agency';
import { Menu } from './menu';

// API types
export type ApiResponse<T = unknown> = {
  data?: unknown;
  message?: string;
  success: boolean;
  error?: string;
};

export type ApiError = {
  message: string;
  code?: string | number;
  [key: string]: unknown;
  details?: unknown;
};

// Property types
export type PropertyType = "residential" | "commercial" | "industrial" | "agricultural";

export type OwnershipType = "individual" | "joint" | "company" | "trust" | "government";

export type HoldingType = "OLD" | "NEW";

export type WaterConnectionType = "metered" | "fixed" | "none";

// Assessment types
export type AssessmentData = {
  assessmentYear: string;
  holdingType: HoldingType;
  newHoldingNo?: string;
  oldHoldingNo?: string;
  oldUniquePropertyId?: string;
  circle: string;
  wardNo: string;
  revenueCircleNo?: string;
  ownershipType: OwnershipType;
  ownerTitle?: string;
  ownerName: string;
  guardianTitle?: string;
  guardianName?: string;
  contactNo: string;
  panNo?: string;
  propFlat?: string;
  propMohalla: string;
  propAddress: string;
  propPincode: string;
  sameAsProperty?: boolean;
  corrFlat?: string;
  corrMohalla?: string;
  corrAddress?: string;
  corrPincode?: string;
  primaryContactNo: string;
  phoneNo?: string;
  email?: string;
  harvesting?: boolean;
  lateSubmission?: boolean;
  propertyType: PropertyType;
  roadType?: string;
  plotArea: number;
  groundFloorArea: number;
  acquisitionDate: string;
  khataNo?: string;
  plotNo?: string;
  maujaName?: string;
  thanaNo?: string;
  floors: FloorDetail[];
  waterConnectionType: WaterConnectionType;
  fixedWaterTax?: string;
  terms: boolean;
};

export type FloorDetail = {
  floor: string;
  usage: string;
  factor: string;
  occupancy: string;
  construction: string;
  builtArea: number;
};

// Agency API Response types
export type AgencyListResponse = {
  data: Agency[];
  pagination: number;
  totalPages: number;
  page: number;
  limit: number;
};

export type AgencyApiResponse = {
  data: AgencyListResponse;
};

// Menu API Response types
export type MenuListResponse = {
  data: Menu[];
  pagination: {
    totalCount: number;
    totalPages: number;
    page: number;
    limit: number;
  };
};

export type MenuApiResponse = {
  data: MenuListResponse;
};
