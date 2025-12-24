"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  employeeSchema,
  EmployeeFormData,
} from "@/lib/form-validation/addEmployee";
import { Button } from "@/components/ui/button";
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
import {
  createEmployeeApi,
  getEmployeeByIdApi,
  updateEmployeeApi,
} from "@/apicalls/userSetup";
import {
  getAllRoleApi,
  getUlbMasterData,
  getAllAgency,
  getAllModuleType,
  getAllWards,
} from "@/apicalls/panelSetup";
import { useRouter } from "next/navigation";
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
            src={previewImage}
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
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              SVG, PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>
          <Input
            type="file"
            className="hidden"
            onChange={onImageChange}
            accept="image/*"
          />
        </label>
      )}
    </div>
  );
};

const SuccessModal = ({
  username,
  password,
  isOpen,
  onClose,
}: {
  username: string;
  password: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background bg-opacity-50 dark:bg-background dark:bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Employee Created Successfully
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Username:</p>
            <p className="font-mono bg-gray-100 p-2 rounded">{username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Password:</p>
            <p className="font-mono bg-gray-100 p-2 rounded">{password}</p>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Please save these credentials. This dialog will close in 10 seconds.
          </p>
        </div>
      </div>
    </div>
  );
};

const EmployeeForm = ({ employeeId }: { employeeId?: number }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!employeeId);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userCredentials, setUserCredentials] = useState({
    username: "",
    password: "",
  });
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [ulbDialogOpen, setUlbDialogOpen] = useState(false);
  const [wardDialogOpen, setWardDialogOpen] = useState(false);
  const [agencies, setAgencies] = useState<ApiDataItem[]>([]);
  const [ulbs, setUlbs] = useState<ApiDataItem[]>([]);
  const [wards, setWards] = useState<ApiDataItem[]>([]);
  const [roles, setRoles] = useState<ApiDataItem[]>([]);
  const [moduleTypes, setModuleTypes] = useState<ApiDataItem[]>([]);
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
        const [
          agencyResponse,
          ulbResponse,
          wardResponse,
          roleResponse,
          moduleTypeResponse,
        ] = await Promise.allSettled([
          getAllAgency(),
          getUlbMasterData(),
          getAllWards(),
          getAllRoleApi(),
          getAllModuleType(),
        ]);

        // Handle responses
        if (
          agencyResponse.status === "fulfilled" &&
          agencyResponse.value?.data
        ) {
          setAgencies(agencyResponse.value.data.data || []);
        }

        if (ulbResponse.status === "fulfilled" && ulbResponse.value?.data) {
          setUlbs(ulbResponse.value.data || []);
        }

        if (wardResponse.status === "fulfilled" && wardResponse.value?.data) {
          setWards(wardResponse.value.data || []);
        }

        if (roleResponse.status === "fulfilled" && roleResponse.value?.data) {
          setRoles(roleResponse.value.data || []);
        }

        if (
          moduleTypeResponse.status === "fulfilled" &&
          moduleTypeResponse.value?.data
        ) {
          setModuleTypes(moduleTypeResponse.value.data || []);
        }

        // If editing an existing employee, fetch their data
        if (employeeId) {
          const employeeResponse: any = await getEmployeeByIdApi(employeeId);
          if (employeeResponse?.data) {
            const employeeData = employeeResponse.data;

            // Set form values from API response
            Object.keys(employeeData).forEach((key) => {
              if (key in form.getValues()) {
                // Handle array fields
                if (key === "ulbIds" || key === "roles" || key === "wards") {
                  const arrayValue = employeeData[key];
                  if (Array.isArray(arrayValue)) {
                    // Extract IDs if objects, or use as-is if already IDs
                    const ids = arrayValue.map((item) =>
                      typeof item === "object" && item !== null ? item.id : item
                    );
                    form.setValue(key as keyof EmployeeFormData, ids);
                  }
                } else {
                  form.setValue(
                    key as keyof EmployeeFormData,
                    employeeData[key]
                  );
                }
              }
            });

            // Handle image if present
            if (employeeData.profile) {
              setPreviewImage(employeeData.profile);
            }
          } else {
            toast({
              title: "Error",
              description: "Failed to load employee data",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [employeeId, form, toast]);

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      // Convert form data to match API expected format
      const payload = new FormData();
      console.log("Form data:", data);

      // Append all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === "profile" && value instanceof File) {
          payload.append("profile", value);
        } else if (key === "ulbIds" || key === "role" || key === "wards") {
          // Handle array fields
          const arrayValue = value as number[];
          if (Array.isArray(arrayValue)) {
            arrayValue.forEach((item) =>
              payload.append(`${key}[]`, item.toString())
            );
          }
        } else if (key === "emp_blockPayment") {
          // Convert boolean to string for the API
          payload.append(key, data.emp_blockPayment?.toString() || "false");
        } else if (value !== undefined && value !== null) {
          // Handle all other fields
          payload.append(key, value.toString());
        }
      });

      let response;
      if (employeeId) {
        // Update existing employee
        response = await updateEmployeeApi(employeeId.toString(), payload);
      } else {
        // Create new employee
        response = await createEmployeeApi(payload);
      }

      // Check for successful response
      if (response && response.data) {
        if (!employeeId) {
          // Show success modal with credentials for new employees
          setUserCredentials({
            username: response?.data?.data?.userData?.username || "N/A",
            password: "0000", // Default password or from response if available
          });
          setShowSuccessModal(true);

          // Hide modal and redirect after 10 seconds
          const redirectTimer = setTimeout(() => {
            setShowSuccessModal(false);
            router.push("/dashboard/user-setup/employee-list");
          }, 10000);

          // Clean up timer on component unmount
          return () => clearTimeout(redirectTimer);
        } else {
          // For updates, just show toast and redirect
          toast({
            title: "Employee Updated",
            description: "Employee details have been updated successfully.",
          });

          setTimeout(() => {
            router.push("/dashboard/user-setup/employee-list");
          }, 800);
        }

        // Reset form after successful submission
        form.reset();
        setPreviewImage(null);
      } else {
        throw new Error(response?.message || "Failed to save employee");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save employee details",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="flex-1 space-y-4 mb-4">
        <Suspense fallback={<FormCardSkeleton />}>
          <SuccessModal
            isOpen={showSuccessModal}
            onClose={() => {
              setShowSuccessModal(false);
              router.push("/dashboard/user-setup/employee-list");
            }}
            username={userCredentials.username}
            password={userCredentials.password}
          />

          <div className="flex justify-between items-center container mx-auto ">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push(`/dashboard/user-setup/employee-list`)}
              className="hidden md:flex"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push(`/dashboard/user-setup/employee-list`)}
              className="md:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">
              {employeeId ? "Edit Employee" : "Add New Employee"}
            </CardTitle>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Employee Details Section */}
              <Card className="space-y-4">
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
                          <FormLabel>
                            First Name <span className="text-red-500">*</span>
                          </FormLabel>
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
                          <FormLabel>
                            Last Name <span className="text-red-500">*</span>
                          </FormLabel>
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
                          <FormLabel>
                            Employee Email{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter employee email"
                              type="email"
                              {...field}
                            />
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
                          <FormLabel>
                            Aadhar Number{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter 12 Digit Adhaar No"
                              {...field}
                            />
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
                          <FormLabel>
                            Contact Number{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter contact number"
                              {...field}
                            />
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
                          <FormLabel>
                            Joining Date <span className="text-red-500">*</span>
                          </FormLabel>
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  field.onChange(
                                    date?.toISOString().split("T")[0]
                                  )
                                }
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
                          <FormLabel>
                            Address <span className="text-red-500">*</span>
                          </FormLabel>
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
              <Card className="space-y-4">
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
                          <FormLabel>
                            Account Holder Name{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter account holder name"
                              {...field}
                            />
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
                          <FormLabel>
                            Account Number{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter account number"
                              {...field}
                            />
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
                          <FormLabel>
                            IFSC Code <span className="text-red-500">*</span>
                          </FormLabel>
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
                          <FormLabel>
                            Bank Name <span className="text-red-500">*</span>
                          </FormLabel>
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
              <Card className="space-y-4 ">
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 space-y-1">
                    <FormField
                      control={form.control}
                      name="agencyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Agency <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={field.value?.toString()}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Select agency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {agencies.map((agency) => (
                                <SelectItem
                                  key={agency.id}
                                  value={agency.id.toString()}
                                >
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
                          <FormLabel>
                            Module Type <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={field.value?.toString()}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Select module type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {moduleTypes.map((module) => (
                                <SelectItem
                                  key={module.id}
                                  value={module.id.toString()}
                                >
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
                          <FormLabel>
                            Job Title <span className="text-red-500">*</span>
                          </FormLabel>
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
                          <FormLabel>
                            Company Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter company name"
                              {...field}
                            />
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
                          <FormLabel>
                            Experience (Years){" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter years of experience"
                              {...field}
                            />
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
                          <FormLabel>
                            Report To Type{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
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
                          <FormLabel>
                            Report To User ID{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter report to user ID"
                              {...field}
                            />
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
                          <FormLabel>
                            Block Payment{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
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
                          <FormLabel>
                            Job Description{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter job description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ULB Selection Section */}
              <Card className="space-y-4">
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="ulbIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            ULBs <span className="text-red-500">*</span>
                          </FormLabel>
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
                          <FormLabel>
                            Wards <span className="text-red-500">*</span>
                          </FormLabel>
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
                          <FormLabel>
                            Roles <span className="text-red-500">*</span>
                          </FormLabel>
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

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
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
