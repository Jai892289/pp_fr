"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, EmployeeFormData } from "@/lib/form-validation/addEmployee";
import { Button } from "@/components/ui/button";
import { User, Employee as EmployeeType } from "@/types/employee";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmployeeByIdApi, updateEmployeeApi } from "@/apicalls/userSetup";
import { getAllRoleApi, getUlbMasterData, getAllAgency, getAllModuleType, getAllWards } from "@/apicalls/panelSetup";
import { useParams, useRouter } from "next/navigation";
import { Role } from "@/types/role";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import PageContainer from "@/components/layout/page-container";
import FormCardSkeleton from "@/components/form-card-skeleton";

interface ApiDataItem {
  id: number;
  name: string;
}

interface ReportToType {
  id: string;
  name: string;
}

interface Permission {
  id: number;
  name: string;
  from: string;
}

interface EmployeeData {
  id: number;
  username: string;
  email: string;
  phone: string;
  ulb: ApiDataItem[];
  employee: EmployeeType;
  ward: ApiDataItem[];
  roles: Role[];
  permissions: Permission[];
  revokedPermissions: Permission[];
}

const reportToTypes = [
  { id: "Manager", name: "Manager" },
  { id: "Supervisor", name: "Supervisor" },
  { id: "Director", name: "Director" },
];

// Reusable MultiSelectDialog component
const MultiSelectDialog = ({
  title,
  description,
  items,
  selectedValues,
  onSelectionChange,
  open,
  onOpenChange,
  triggerText,
}: {
  title: string;
  description: string;
  items: ApiDataItem[];
  selectedValues: number[];
  onSelectionChange: (values: number[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerText: string;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Command>
            <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No {title.toLowerCase()} found.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem key={item.id}>
                    <div
                      className="flex items-center space-x-2 w-full"
                      onClick={() => {
                        const newValue = selectedValues.includes(item.id)
                          ? selectedValues.filter((id) => id !== item.id)
                          : [...selectedValues, item.id];
                        onSelectionChange(newValue);
                      }}
                    >
                      <Checkbox
                        checked={selectedValues.includes(item.id)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...selectedValues, item.id]
                            : selectedValues.filter((id) => id !== item.id);
                          onSelectionChange(newValue);
                        }}
                      />
                      <label className="text-sm font-medium leading-none cursor-pointer">
                        {item.name}
                      </label>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Reusable PermissionDialog component
const PermissionDialog = ({
  title,
  description,
  permissions,
  selectedPermissions,
  onSelectionChange,
  open,
  onOpenChange,
  triggerText,
}: {
  title: string;
  description: string;
  permissions: Permission[];
  selectedPermissions: number[];
  onSelectionChange: (values: number[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerText: string;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Command>
            <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No {title.toLowerCase()} found.</CommandEmpty>
              <CommandGroup>
                {permissions.map((permission) => (
                  <CommandItem key={permission.id}>
                    <div
                      className="flex items-center space-x-2 w-full"
                      onClick={() => {
                        const newValue = selectedPermissions.includes(permission.id)
                          ? selectedPermissions.filter((id) => id !== permission.id)
                          : [...selectedPermissions, permission.id];
                        onSelectionChange(newValue);
                      }}
                    >
                      <Checkbox
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...selectedPermissions, permission.id]
                            : selectedPermissions.filter((id) => id !== permission.id);
                          onSelectionChange(newValue);
                        }}
                      />
                      <label className="text-sm font-medium leading-none cursor-pointer">
                        {permission.name} ({permission.from})
                      </label>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Reusable ImageUpload component
const ImageUpload = ({
  previewImage,
  onImageChange,
  onRemoveImage,
}: {
  previewImage: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}) => {
  return (
    <div className="flex items-center justify-center w-full">
      {previewImage ? (
        <div className="relative">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/${previewImage}`}
            alt="Preview"
            className="h-32 w-32 rounded-lg object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={onRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 dark:border-gray-600">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              SVG, PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>
          <Input
            type="file"
            className="hidden"
            onChange={onImageChange}
          />
        </label>
      )}
    </div>
  );
};

const EmployeeForm = () => {
  const params = useParams();
  const employeeId = params.id ? parseInt(params.id as string) : undefined;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ulbDialogOpen, setUlbDialogOpen] = useState(false);
  const [wardDialogOpen, setWardDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<ApiDataItem[]>([]);
  const [ulbs, setUlbs] = useState<ApiDataItem[]>([]);
  const [wards, setWards] = useState<ApiDataItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [moduleTypes, setModuleTypes] = useState<ApiDataItem[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [revokedPermissions, setRevokedPermissions] = useState<number[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      userEmail: "",
      userPhone: "",
      agencyId: undefined,
      moduleTypeId: undefined,
      emp_FirstName: "",
      emp_LastName: "",
      profile: undefined,
      emp_aadharNo: "",
      emp_Address: "",
      emp_JoiningDate: "",
      emp_HolderName: "",
      emp_accountNo: "",
      emp_ifscCode: "",
      emp_bankName: "",
      emp_jobTitle: "",
      emp_companyName: "",
      emp_experienceYears: "",
      emp_jobDescription: "",
      emp_reportToTypeId: "",
      emp_reportToUserId: "",
      emp_blockPayment: "false",
      ulbIds: [],
      role: [],
      wards: [],
      revokedPermissions: [],
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("profile", file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    form.setValue("profile", undefined);
  };

  // Fetch all necessary data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch all data in parallel
        const [agencyResponse, ulbResponse, wardResponse, roleResponse, moduleTypeResponse] =
          await Promise.allSettled([
            getAllAgency(),
            getUlbMasterData(),
            getAllWards(),
            getAllRoleApi(),
            getAllModuleType()
          ]);

        // Handle responses
        if (agencyResponse.status === 'fulfilled' && agencyResponse.value?.data?.data) {
          setAgencies(agencyResponse.value.data.data);
        }

        if (ulbResponse.status === 'fulfilled' && ulbResponse.value?.data) {
          setUlbs(ulbResponse.value.data);
        }

        if (wardResponse.status === 'fulfilled' && wardResponse.value?.data) {
          setWards(wardResponse.value.data);
        }

        if (roleResponse.status === 'fulfilled' && roleResponse.value?.data) {
          setRoles(roleResponse.value.data);
        }

        if (moduleTypeResponse.status === 'fulfilled' && moduleTypeResponse.value?.data) {
          setModuleTypes(moduleTypeResponse.value.data);
        }

        // Fetch employee data
        if (employeeId) {
          const response = await getEmployeeByIdApi(employeeId);
          console.log("Employee idX:", employeeId);
          console.log("Employee response:", response);

          if (response) {
            const employeeResponse = response as EmployeeData;
            console.log("Employee response data:", employeeResponse);
            const { employee: employeeData, ...userData } = employeeResponse;

            // Set user-level fields
            form.setValue('userEmail', userData.email || '');
            form.setValue('userPhone', userData.phone || '');

            if (employeeData) {
              // Map employee fields to form fields
              const fieldMappings = {
                // API field: Form field
                empFirstName: 'emp_FirstName',
                empLastName: 'emp_LastName',
                empEmail: 'emp_Email',
                contactNo: 'userPhone',
                aadharNo: 'emp_aadharNo',
                empAddress: 'emp_Address',
                joiningDate: 'emp_JoiningDate',
                accountHolderName: 'emp_HolderName',
                accountNo: 'emp_accountNo',
                ifscCode: 'emp_ifscCode',
                bankName: 'emp_bankName',
                jobTitle: 'emp_jobTitle',
                companyName: 'emp_companyName',
                experienceYears: 'emp_experienceYears',
                jobDescription: 'emp_jobDescription',
                reportToTypeId: 'emp_reportToTypeId',
                reportToUserId: 'emp_reportToUserId',
                blockPayment: 'emp_blockPayment',
                agency_id: 'agencyId',
                moduleType_id: 'moduleTypeId'
                
              } as const;

              // Set employee fields using the mapping
              (Object.entries(fieldMappings) as Array<[keyof EmployeeType, keyof EmployeeFormData]>).forEach(([apiField, formField]) => {
                const value = employeeData[apiField as keyof EmployeeType];
                if (value !== undefined && value !== null) {
                  form.setValue(formField, value as any);
                }
              });


              // Handle ULB if present
              if (userData.ulb?.length) {
                form.setValue('ulbIds', userData.ulb.map(ulb => ulb.id));
              }

              // Handle roles if present
              if (userData.roles?.length) {
                form.setValue('role', userData.roles.map((role: Role) => role.id));
              }

              // Handle wards if present
              if (userData.ward?.length) {
                form.setValue('wards', userData.ward.map(ward => ward.id));
              }

              // Handle permissions if present
              if (userData.permissions) {
                setPermissions(userData.permissions);
              }

              // Handle revoked permissions if present
              if (userData.revokedPermissions?.length) {
                const revokedIds = userData.revokedPermissions.map(p => p.id);
                setRevokedPermissions(revokedIds);
                form.setValue('revokedPermissions', revokedIds);
              }

              // Handle image if present
              if (employeeData.empImage) {
                setPreviewImage(employeeData.empImage);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [employeeId, form, toast]);



  // Form submission handler
  const onSubmit = async (formData: EmployeeFormData) => {
    setIsSubmitting(true);
    console.log("Form data panel:", formData, employeeId);
    try {
      setIsLoading(true);
      const payload = new FormData();
      console.log("Form data panel:", payload, employeeId);

      if (!employeeId) {
        throw new Error("Employee ID is required for update");
      }

      // Append all form data to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'profile' && value instanceof File) {
          payload.append('profile', value);
        } else if (Array.isArray(value)) {
          // Handle array fields
          value.forEach(item => payload.append(`${key}[]`, item.toString()));
        } else if (value !== undefined && value !== null) {
          payload.append(key, value.toString());
        }
      });

      // Add revoked permissions
      if (revokedPermissions.length > 0) {
        revokedPermissions.forEach(permissionId => {
          payload.append('revokedPermissions[]', permissionId.toString());
        });
      }


      const response = await updateEmployeeApi(employeeId.toString(), payload);
      console.log("Response panel:", employeeId, payload);

      if (response?.data) {
        toast({
          title: 'Success',
          description: 'Employee updated successfully',
        });

        setTimeout(() => {
          router.push("/dashboard/user-setup/employee-list");
        }, 1000);
      } else {
        throw new Error(response?.message || 'Failed to update employee');
      }
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update employee',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter permissions to only show those with "from": "role"
  const rolePermissions = permissions.filter(permission => permission.from === "role");

  if (isLoading) {
    return (
      <div className="w-full p-4">
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <p>Loading data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <div className="flex justify-between items-center ">
            <Button variant="outline" size="lg" onClick={() => router.push(`/dashboard/user-setup/employee-list/${employeeId}`)} className="hidden md:flex">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/user-setup/employee-list/${employeeId}`)} className="md:hidden">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-semibold">Edit Employee</h2>
          </div>





          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Employee Details Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Employee Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="profile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee Image</FormLabel>
                          <FormControl>
                            <ImageUpload
                              previewImage={previewImage}
                              onImageChange={handleImageChange}
                              onRemoveImage={removeImage}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_FirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_LastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="userEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee Email <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter employee email" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_aadharNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aadhar Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter 12 Digit Adhaar No" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="userPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter contact number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_JoiningDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Joining Date <span className="text-red-500">*</span></FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_Address"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Bank Details Section */}
              <Card className="space-y-4 p-4">
                <CardHeader>
                  <CardTitle>Bank Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="emp_HolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter account holder name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_accountNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter account number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter IFSC code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bank name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Job Details Section */}
              <Card className="space-y-4 p-4 ">
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="agencyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agency <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Select agency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {agencies.map((agency) => (
                                <SelectItem key={agency.id} value={agency.id.toString()}>
                                  {agency.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="moduleTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Module Type <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Select module type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {moduleTypes.map((module) => (
                                <SelectItem key={module.id} value={module.id.toString()}>
                                  {module.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter job title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_experienceYears"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience (Years) <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter years of experience" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_reportToTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report To Type <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Select report type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {reportToTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_reportToUserId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report To User ID <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter report to user ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_blockPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Block Payment <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Select block payment status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="false">No</SelectItem>
                              <SelectItem value="true">Yes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emp_jobDescription"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Job Description <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter job description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ULB Selection Section */}
              <Card className="space-y-4 p-4">
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <FormField
                      control={form.control}
                      name="ulbIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ULBs <span className="text-red-500">*</span></FormLabel>
                          <div>
                            <MultiSelectDialog
                              title="Select ULBs"
                              description="Select the ULBs this employee should have access to."
                              items={ulbs}
                              selectedValues={field.value}
                              onSelectionChange={field.onChange}
                              open={ulbDialogOpen}
                              onOpenChange={setUlbDialogOpen}
                              triggerText="Select ULBs"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {field.value.map((ulbId) => {
                              const ulb = ulbs.find((u) => u.id === ulbId);
                              return (
                                <Badge key={ulbId} variant="secondary">
                                  {ulb?.name || ulbId}
                                </Badge>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wards"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wards <span className="text-red-500">*</span></FormLabel>
                          <div>
                            <MultiSelectDialog
                              title="Select Wards"
                              description="Select the wards this employee should have access to."
                              items={wards}
                              selectedValues={field.value}
                              onSelectionChange={field.onChange}
                              open={wardDialogOpen}
                              onOpenChange={setWardDialogOpen}
                              triggerText="Select Wards"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {field.value.map((wardId) => {
                              const ward = wards.find((w) => w.id === wardId);
                              return (
                                <Badge key={wardId} variant="secondary">
                                  {ward?.name || wardId}
                                </Badge>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roles <span className="text-red-500">*</span></FormLabel>
                          <div>
                            <MultiSelectDialog
                              title="Select Roles"
                              description="Select the roles for this employee."
                              items={roles}
                              selectedValues={field.value}
                              onSelectionChange={field.onChange}
                              open={roleDialogOpen}
                              onOpenChange={setRoleDialogOpen}
                              triggerText="Select Roles"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {field.value.map((roleId) => {
                              const role = roles.find((r) => r.id === roleId);
                              return (
                                <Badge key={roleId} variant="secondary">
                                  {role?.name || roleId}
                                </Badge>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Revoke Permissions Section */}
              <Card className="space-y-4 p-4">
                <CardHeader>
                  <CardTitle>Revoke Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="revokedPermissions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Permissions to Revoke</FormLabel>
                        <div>
                          <PermissionDialog
                            title="Select Permissions to Revoke"
                            description="Select permissions with 'role' source to revoke from this employee."
                            permissions={rolePermissions}
                            selectedPermissions={revokedPermissions}
                            onSelectionChange={(values) => {
                              setRevokedPermissions(values);
                              field.onChange(values);
                            }}
                            open={permissionDialogOpen}
                            onOpenChange={setPermissionDialogOpen}
                            triggerText="Select Permissions to Revoke"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {revokedPermissions.map((permissionId) => {
                            const permission = rolePermissions.find((p) => p.id === permissionId);
                            return (
                              <Badge key={permissionId} variant="destructive">
                                {permission?.name || permissionId}
                              </Badge>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </Form>

        </Suspense>
      </div>
    </PageContainer>
  );
};

export default EmployeeForm;