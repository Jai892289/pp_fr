import { Permission } from "./permission";

export interface Menu {
    id: number;
    label: string;
    path: string;
    parentId: number | null;
    recstatus: number;
    permissionName?: string;
    ulb_id?: number;
    order: number;
    created_at: string;
    updated_at: string;
    // Response format fields
    menuLabel?: string;
    menuPath?: string;
    menuParentId?: number | null;
    menuPermission?: string;
    permissions?: Array<{
      id: number;
      name: string;
      [key: string]: any;
    }>;
  }
  
  export interface Pagination {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  // ✅ matches your JSON: "data" contains { data: Menu[], pagination: Pagination }
  export interface MenuListResponse {
    data: Menu[];
    pagination: Pagination;
    permissions: Permission[];
  }
  
  // ✅ full API response wrapper
  export interface MenuApiResponse {
    message?: string; // sometimes present
    data: MenuListResponse;
    pagination?: Pagination; // top-level pagination (optional)
  }
  

  
    export interface MenuDialogProps {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        menu: Menu | null;
        onSuccess: () => void;
    }

    export interface TreeMenuItem extends Menu {
      children: TreeMenuItem[];
      level: number;
      isExpanded: boolean;
    }