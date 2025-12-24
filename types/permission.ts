export interface PermissionPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface PermissionApiResponse {
  message: string;
  data: {
    data: Permission[];
    pagination: PermissionPagination;
  };
}


export interface PermissionListResponse {
  message: string;
  data: Permission[];
  pagination: number;
  page: number;
  limit: number;
  totalPages: number;
}



export interface Permission {
  id: number;
  name: string;
  recstatus: number;
  ulb_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePermissionData {
  name: string;
  ulb_id: number;
  recstatus?: number;
}

export interface UpdatePermissionData extends Partial<CreatePermissionData> {
  id: number;
}

export interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission: Permission | null;
  onSuccess: () => void;
}
