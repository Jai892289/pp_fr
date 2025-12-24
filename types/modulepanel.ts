// {
//     "message": "Data decrypted successfully",
//     "data": {
//         "data": [
//             {
//                 "id": 1,
//                 "name": "Property",
//                 "ulb_id": 3,
//                 "created_at": "2025-09-04T12:03:12.324Z",
//                 "recstatus": 1
//             }
//         ],
//         "pagination": 1,
//         "page": 1,
//         "limit": 10,
//         "totalPages": 1
//     }
// }

export interface ModuleApiResponse {
  data: Module[];
  pagination: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ModuleListResponse {
  data: Module[];
  pagination: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Module {
    id: number;
    name: string;
    ulb_id: number;
    recstatus: number;
    created_at: string;
}



export interface ModuleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    module: Module | null;
    onSuccess: () => void;
}
