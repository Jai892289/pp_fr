export interface Agency {
    id: number;
    name: string;
    ulb_id: number;
    recstatus: number;
    created_at: string;
    updated_at?: string;
}

export interface AgencyApiResponse {
    message: string;
    data: {
        data: Agency[];
        pagination: {
            totalCount?: number;
            total?: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface AgencyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agency: Agency | null;
    onSuccess: () => void;
}
