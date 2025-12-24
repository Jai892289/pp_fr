import { z } from "zod";

export const employeeSchema = z.object({
  userEmail: z.string().email("Invalid email address"),
  userPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  agencyId: z.number().min(1, "Agency is required"),
  moduleTypeId: z.number().min(1, "Module type is required"),
  emp_FirstName: z.string().min(1, "First name is required"),
  emp_LastName: z.string().min(1, "Last name is required"),
  profile: z.any().optional(),
  emp_aadharNo: z.string().min(12, "Aadhar number must be 12 digits").max(12, "Aadhar number must be 12 digits"),
  emp_Address: z.string().min(1, "Address is required"),
  emp_JoiningDate: z.string().min(1, "Joining date is required"),
  emp_HolderName: z.string().min(1, "Account holder name is required"),
  emp_accountNo: z.string().min(1, "Account number is required"),
  emp_ifscCode: z.string().min(1, "IFSC code is required"),
  emp_bankName: z.string().min(1, "Bank name is required"),
  emp_jobTitle: z.string().min(1, "Job title is required"),
  emp_companyName: z.string().min(1, "Company name is required"),
  emp_experienceYears: z.string().min(1, "Experience is required"),
  emp_jobDescription: z.string().min(1, "Job description is required"),
  emp_reportToTypeId: z.string().min(1, "Report to type is required"),
  emp_reportToUserId: z.string().min(1, "Report to user is required"),
  emp_blockPayment: z.string().min(1, "Block payment status is required"),
  ulbIds: z.array(z.number()).min(1, "At least one ULB is required"),
  role: z.array(z.number()).min(1, "At least one role is required"),
  wards: z.array(z.number()).min(1, "At least one ward is required"),
  revokedPermissions: z.array(z.number()).optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;