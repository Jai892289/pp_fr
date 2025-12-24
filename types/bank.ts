export interface BankList {
    id: number;
    name: string;
    recstatus: number;
    created_at: string;
    updated_at: string;
  }
  export interface BankListApiResponse {
    data: BankList[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
  
  export interface BankDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bank?: BankList | null;
    onSuccess: () => void;
  }