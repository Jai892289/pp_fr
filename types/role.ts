// types/role.ts
export interface Permission {
    id: number;
    name: string;
  }
  
  export interface Role {
    id: number;
    name: string;
    recstatus: number;
    ulb_id: number;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
  }
  
  export interface RoleApiResponse {
    data: Role[];
    pagination: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface CreateRoleData {
    role_name: string;
    ulb_id: number;
    permission_names: string[];
  }
  
  export interface RoleByIdResponse {
    id: number;
    name: string;
    recstatus: number;
    ulb_id: number;
    created_at: string;
    updated_at: string;
    permissions: Permission[];
  }


  export interface RoleDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      role: Role | null;
      onSuccess: () => void;
  }