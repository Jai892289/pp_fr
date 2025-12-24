export interface ZoneApiResponse {
  data: Zone[];
  pagination: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ZoneListResponse {
  data: Zone[];
  pagination: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Zone {
  id: number;
  ulb_id: number;
  name: string;
  zonecode: string;
  recstatus: number;
  created_at: string;
  updated_at: string;
}

export interface ZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone: Zone | null;
  onSuccess: () => void;
}
