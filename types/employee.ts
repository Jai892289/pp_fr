import {  Role } from "./role";
import { Ward } from "./wardpanel";

// Encrypted Response (before decryption)
export interface EncryptedEmployeeListApiResponse {
  message: string;
  data: {
    encryptedData: string;
    iv: string;
  };
}



export interface EmployeeApiResponse {
  message: string;
  data: Employee;
}

export interface EmployeeListApiResponse {
  message: string;
  data: {
    data: Employee[] | any;
    pagination: Pagination;
  };
}

// Paginated Response Data
export interface UserListResponse {
  data: User[];
  pagination: Pagination;
}

// Pagination Info
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User Model
export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  recstatus: number;
  created_at: string;
  updated_at: string;
  ulb: Ulb[];
  ward: Ward[];
  roles: Role[];
  permissions: any[];
  revokedPermissions: any[];
  employee: Employee | null;
}

// ULB Model
export interface Ulb {
  id: number;
  ulb_type_id: number;
  name: string;
  name_hindi: string | null;
  address: string;
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
}

// Form Employee Data
export interface EmployeeFormData {
  userEmail: string;
  userPhone: string;
  userPassword?: string;
  agencyId: number;
  moduleTypeId: number;
  emp_FirstName: string;
  emp_LastName: string;
  empImage?: File | string;
  emp_Email: string;
  emp_aadharNo: string;
  emp_Address: string;
  emp_JoiningDate: string;
  emp_HolderName: string;
  emp_accountNo: string;
  emp_ifscCode: string;
  emp_bankName: string;
  emp_jobTitle: string;
  emp_companyName: string;
  emp_experienceYears: string;
  emp_jobDescription: string;
  emp_reportToTypeId?: string;
  emp_reportToUserId?: string;
  emp_blockPayment: 'true' | 'false';
  ulbIds: number[];
  roles: number[];
  ward: number[];
}

// Employee Model (API Response)
export interface Employee {
  id: number;
  user_id: number;
  agency_id: number;
  moduleType_id: number;
  empCode?: string;
  empFirstName: string;
  empLastName: string;
  empImage: string;
  contactNo: string;
  empEmail: string;
  aadharNo: string;
  empAddress: string;
  joiningDate: string;
  accountHolderName: string;
  accountNo: string;
  ifscCode: string;
  bankName: string;
  jobTitle: string;
  companyName: string;
  experienceYears: string;
  jobDescription: string;
  reportToTypeId: string;
  reportToUserId: string;
  blockPayment: string;
  is_active: boolean;
  entryBy: string;
  entryIpAddress: string;
  updateBy: string;
  updateIpAddress: string;
  recstatus: number;
  created_at: string;
  updated_at: string;
  ulb_masterId: number | null;
  ulbs?: Array<{ id: number; name: string }>;
  roles?: Array<{ id: number; name: string }>;
  ward?: Array<{ id: number; name: string }>;
}