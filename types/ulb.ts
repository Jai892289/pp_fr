import { User } from "./auth";

export interface ULBType {
  id: number;
  name: string;
  recstatus: number;
  created_at: string;
  updated_at: string;
}

export interface ULBTypeApiResponse {
  message: string;
  data: {
    data: {
      data: ULBType[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  };
}


export interface PaginationComponentProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }

  export interface ULBMasterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ulbMaster?: ULBMasterDetail | null;
    ulbType?: ULBType[] | null;
    onSuccess: () => void;
  }

  export interface ULBMasterDetail {
    id: number;
    ulb_type_id: number;
    name: string;
    name_hindi: string | null;
    address: string | null;
    nigamtollfreeno: string | null;
    receipttollfreeno: string | null;
    bankname: string | null;
    accountno: string | null;
    ifsccode: string | null;
    municipallogo: string | null;
    agencyfullname: string | null;
    agencylogo: string | null;
    domainname: string | null;
    gstno: string | null;
    entryby: number | null;
    recstatus: number;
    payee_id: string | null;
    latitude: string | null;
    longitude: string | null;
    created_at: string;
    updated_at: string;
    ulb_type: ULBType;
    user: User[];
    // role: Role[];
    // permissions: Permission[];
    // menu: Menu[];
    // zone_circle_master: ZoneCircle[];
  }