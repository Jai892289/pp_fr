export interface WardApiResponse {
  data: Ward[];
  pagination: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WardListResponse {
  data: Ward[];
  pagination: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Ward {
  id: number;
  zone_circle_id: number;
  ward_no: string;
  name: string;
  ward_code: string;
  area: string;
  recstatus: number;
  created_at: string;
  updated_at: string;
}

export interface CreateWardData {
  zoneCircleId: number;
  wardNo: string;
  wardName: string;
  wardCode: string;
  wardArea: string;
}

export interface WardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ward: Ward | null;
  onSuccess: () => void;
}
