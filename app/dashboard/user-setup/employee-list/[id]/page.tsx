"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
    getEmployeeByIdApi,
    toggleEmployeeApi,
    connectEmployeeWards,
    disconnectEmployeeWards,
    connectEmployeeULBs,
    disconnectEmployeeULBs,
    connectEmployeeRoles,
    disconnectEmployeeRoles,
    connectEmployeePermission,
    disconnectEmployeePermission
} from "@/apicalls/userSetup"
import { getAllRoleApi, getUlbMasterData, getAllWards, getAllPermissions } from "@/apicalls/panelSetup"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Mail, Phone, MoreVertical, MapPin, Edit3, ArrowLeft, Ban, Trash2, Plus, Shield, Building, Users, MapPin as MapPinIcon, Building2, BuildingIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { ToggleConfirmationDialog } from "@/components/dialogs/agency-menu/toggle-agency-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { User, Ulb as ApiDataItem } from "@/types/employee"
import PageContainer from "@/components/layout/page-container"
import FormCardSkeleton from "@/components/form-card-skeleton"

export default function EmployeeDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [employee, setEmployee] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("overview")
    const [ulbs, setUlbs] = useState<ApiDataItem[]>([])
    const [wards, setWards] = useState<ApiDataItem[]>([])
    const [roles, setRoles] = useState<ApiDataItem[]>([])
    const [permissions, setPermissions] = useState<ApiDataItem[]>([])

    // Dialog states
    const [wardDialogOpen, setWardDialogOpen] = useState(false)
    const [ulbDialogOpen, setUlbDialogOpen] = useState(false)
    const [roleDialogOpen, setRoleDialogOpen] = useState(false)
    const [permissionDialogOpen, setPermissionDialogOpen] = useState(false)
    const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false)

    // Selection states for multi-select
    const [selectedWards, setSelectedWards] = useState<number[]>([])
    const [selectedUlbs, setSelectedUlbs] = useState<number[]>([])
    const [selectedRoles, setSelectedRoles] = useState<number[]>([])
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

    // Delete confirmation states
    const [deleteWardId, setDeleteWardId] = useState<number | null>(null)
    const [deleteUlbId, setDeleteUlbId] = useState<number | null>(null)
    const [deleteRoleId, setDeleteRoleId] = useState<number | null>(null)
    const [deletePermissionId, setDeletePermissionId] = useState<number | null>(null)

    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const employeeId = parseInt(params.id as string)

    console.log("EMPLOYEE ID:", employee)


    const fetchEmployee = async () => {
        if (!employeeId || isNaN(employeeId)) {
            toast({
                title: "Error",
                description: "Invalid employee ID",
                variant: "destructive",
            })
            return
        }

        try {
            setIsLoading(true)
            const response = await getEmployeeByIdApi(employeeId)
            setEmployee(response as User)
        } catch (error) {
            console.error("Error fetching employee:", error)
            toast({
                title: "Error",
                description: "Failed to load employee details",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (params.id) {
            fetchEmployee()
        }
    }, [params.id])

    // Fetch all necessary data from APIs
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ulbResponse, wardResponse, roleResponse, permissionResponse] = await Promise.allSettled([
                    getUlbMasterData(),
                    getAllWards(),
                    getAllRoleApi(),
                    getAllPermissions(),
                ])

                if (ulbResponse.status === 'fulfilled' && ulbResponse.value?.data) {
                    setUlbs(ulbResponse.value.data)
                }

                if (wardResponse.status === 'fulfilled' && wardResponse.value?.data) {
                    setWards(wardResponse.value.data)
                }

                if (roleResponse.status === 'fulfilled' && roleResponse.value?.data) {
                    setRoles(roleResponse.value.data)
                }

                if (permissionResponse.status === 'fulfilled' && permissionResponse.value?.data) {
                    setPermissions(permissionResponse.value.data.data)
                }
            } catch (error) {
                console.error('Error fetching data:', error)
                toast({
                    title: 'Error',
                    description: 'Failed to load data',
                    variant: 'destructive',
                })
            }
        }

        fetchData()
    }, [toast])


    const handleToggleConfirm = async () => {
        if (!employee || !employee.employee) return

        try {
            setActionLoading('toggle')
            await toggleEmployeeApi(employee.id)
            const action = employee.employee.recstatus === 1 ? "deactivated" : "activated"
            toast({
                title: "Success",
                description: `Employee ${action} successfully`,
                variant: "default",
            })
            setIsToggleDialogOpen(false)
            await fetchEmployee()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }; message?: string }
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to toggle Employee status"
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
        }
    }

    // Ward management functions
    const handleConnectWards = async () => {
        if (selectedWards.length === 0) {
            toast({
                title: "Warning",
                description: "Please select at least one ward",
                variant: "destructive",
            })
            return
        }

        try {
            setActionLoading('connect-wards')
            await connectEmployeeWards(employeeId, selectedWards)
            toast({
                title: "Success",
                description: `${selectedWards.length} ward(s) connected successfully`,
                variant: "default",
            })
            setWardDialogOpen(false)
            setSelectedWards([])
            await fetchEmployee()
        } catch (error) {
            console.error("Error connecting wards:", error)
            toast({
                title: "Error",
                description: "Failed to connect wards",
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
        }
    }

    const handleDisconnectWard = async (wardId: number) => {
        try {
            setActionLoading(`disconnect-ward-${wardId}`)
            await disconnectEmployeeWards(employeeId, [wardId])
            toast({
                title: "Success",
                description: "Ward disconnected successfully",
                variant: "default",
            })
            await fetchEmployee()
        } catch (error) {
            console.error("Error disconnecting ward:", error)
            toast({
                title: "Error",
                description: "Failed to disconnect ward",
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
            setDeleteWardId(null)
        }
    }

    // ULB management functions
    const handleConnectULBs = async () => {
        if (selectedUlbs.length === 0) {
            toast({
                title: "Warning",
                description: "Please select at least one ULB",
                variant: "destructive",
            })
            return
        }

        try {
            setActionLoading('connect-ulbs')
            await connectEmployeeULBs(Number(employeeId), selectedUlbs)
            toast({
                title: "Success",
                description: `${selectedUlbs.length} ULB(s) connected successfully`,
                variant: "default",
            })
            setUlbDialogOpen(false)
            setSelectedUlbs([])
            await fetchEmployee()
        } catch (error) {
            console.error("Error connecting ULBs:", error)
            toast({
                title: "Error",
                description: "Failed to connect ULBs",
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
        }
    }

    const handleDisconnectULB = async (ulbId: number) => {
        try {
            setActionLoading(`disconnect-ulb-${ulbId}`)
            await disconnectEmployeeULBs(employeeId, [ulbId])
            toast({
                title: "Success",
                description: "ULB disconnected successfully",
                variant: "default",
            })
            await fetchEmployee()
        } catch (error) {
            console.error("Error disconnecting ULB:", error)
            toast({
                title: "Error",
                description: "Failed to disconnect ULB",
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
            setDeleteUlbId(null)
        }
    }

    // Role management functions
    const handleConnectRoles = async () => {
        if (selectedRoles.length === 0) {
            toast({
                title: "Warning",
                description: "Please select at least one role",
                variant: "destructive",
            })
            return
        }

        try {
            setActionLoading('connect-roles')
            await connectEmployeeRoles(employeeId, selectedRoles)
            toast({
                title: "Success",
                description: `${selectedRoles.length} role(s) connected successfully`,
                variant: "default",
            })
            setRoleDialogOpen(false)
            setSelectedRoles([])
            await fetchEmployee()
        } catch (error) {
            console.error("Error connecting roles:", error)
            toast({
                title: "Error",
                description: "Failed to connect roles",
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
        }
    }

    const handleDisconnectRole = async (roleId: number) => {
        try {
            setActionLoading(`disconnect-role-${roleId}`)
            await disconnectEmployeeRoles(employeeId, [roleId])
            toast({
                title: "Success",
                description: "Role disconnected successfully",
                variant: "default",
            })
            await fetchEmployee()
        } catch (error) {
            console.error("Error disconnecting role:", error)
            toast({
                title: "Error",
                description: "Failed to disconnect role",
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
            setDeleteRoleId(null)
        }
    }

    // Permission management functions

    const handleConnectPermissions = async () => {
        if (selectedPermissions.length === 0) {
            toast({
                title: "Warning",
                description: "Please select at least one permission",
                variant: "destructive",
            })
            return
        }

        try {
            setActionLoading('connect-permissions')
            await connectEmployeePermission(employeeId, selectedPermissions)
            toast({
                title: "Success",
                description: `${selectedPermissions.length} permission(s) connected successfully`,
                variant: "default",
            })
            setPermissionDialogOpen(false)
            setSelectedPermissions([])
            await fetchEmployee()
        } catch (error) {
            console.error("Error connecting permissions:", error)
            toast({
                title: "Error",
                description: "Failed to connect permissions",
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
        }
    }

    //disconnect permissions
    const handleDisconnectPermission = async (permissionId: number) => {
        try {
            setActionLoading(`disconnect-permission-${permissionId}`)
            await disconnectEmployeePermission(employeeId, [permissionId])
            toast({
                title: "Success",
                description: "Permission disconnected successfully",
                variant: "default",
            })
            await fetchEmployee()
        } catch (error) {
            console.error("Error disconnecting permission:", error)
            toast({
                title: "Error",
                description: "Failed to disconnect permission",
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
            setDeletePermissionId(null)
        }
    }

    // Helper function to get available items for selection
    const getAvailableWards = () => {
        const assignedWardIds = employee?.ward?.map(w => w.id) || []
        return wards.filter(ward => !assignedWardIds.includes(ward.id))
    }

    const getAvailableUlbs = () => {
        const assignedUlbIds = employee?.ulb?.map(u => u.id) || []
        return ulbs.filter(ulb => !assignedUlbIds.includes(ulb.id))
    }

    const getAvailableRoles = () => {
        const assignedRoleIds = employee?.roles?.map(r => r.id) || []
        return roles.filter(role => !assignedRoleIds.includes(role.id))
    }

    const getAvailablePermissions = () => {
        const assignedPermissionIds = employee?.permissions?.map(p => p.id) || []
        return permissions.filter(permission => !assignedPermissionIds.includes(permission.id))
    }



    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                    <p className="text-slate-600 font-medium">Loading employee details...</p>
                </div>
            </div>
        )
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-6">
                            <div className="flex items-center text-red-800 mb-4">
                                <span className="mr-3 text-2xl">⚠️</span>
                                <h3 className="text-lg font-semibold">Employee Not Found</h3>
                            </div>
                            <p className="text-red-700 mb-4">The requested employee could not be found or may have been deleted.</p>
                            <Button
                                onClick={() => router.push("/dashboard/user-setup/employee-list")}
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-100"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Employee List
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const fullName = employee.employee
        ? `${employee.employee.empFirstName || ''} ${employee.employee.empLastName || ''}`.trim()
        : employee.username || 'Unknown'

    return (
          <PageContainer scrollable>
              <div className='flex-1 space-y-4'>
              <Suspense fallback={<FormCardSkeleton />}>
                {/* Header Section */}
                <div className="flex justify-between gap-4 hidden md:flex ">
                    {/* Left Side */}
                    <div className="flex items-center gap-4">
                        {/* Back Button (Desktop) */}
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => router.push("/dashboard/user-setup/employee-list")}
                            className="hidden md:flex"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>

                        {/* Back Button (Mobile Icon) */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push("/dashboard/user-setup/employee-list")}
                            className="md:hidden"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        {/* Desktop Buttons */}
                        <div className="hidden md:flex items-center gap-2">
                            <Button
                                onClick={() => setWardDialogOpen(true)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg"
                                disabled={getAvailableWards().length === 0}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Assign Wards
                            </Button>

                            <Button
                                onClick={() => setUlbDialogOpen(true)}
                                className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg"
                                disabled={getAvailableUlbs().length === 0}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Assign ULBs
                            </Button>

                            <Button
                                onClick={() => setRoleDialogOpen(true)}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg"
                                disabled={getAvailableRoles().length === 0}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Assign Roles
                            </Button>

                            <Button
                                onClick={() => setIsToggleDialogOpen(true)}
                                size="lg"
                                variant={employee?.employee?.recstatus === 1 ? "destructive" : "success"}
                                className="flex items-center gap-2"
                                disabled={!employee}
                            >
                                <Ban className="h-4 w-4" />
                                {employee?.employee?.recstatus === 1 ? "Deactivate" : "Activate"}
                            </Button>
                        </div>


                    </div>
                </div>

                <div className="flex justify-between gap-4">
                    <div className="flex items-center gap-4">

                        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/user-setup/employee-list")} className="md:hidden">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-xl font-bold tracking-tight lg:text-2xl">
                            Employee Details
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">

                        {/* Edit Button */}
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => router.push(`${employee?.id}/edit`)}
                            className="flex items-center gap-2"
                        >
                            <Edit3 className="h-4 w-4" />
                            <span className="hidden md:inline">Edit Employee</span>
                        </Button>

                        {/* Mobile Dropdown */}
                        <div className="md:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        disabled={getAvailableWards().length === 0}
                                        onClick={() => setWardDialogOpen(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Assign Wards
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        disabled={getAvailableUlbs().length === 0}
                                        onClick={() => setUlbDialogOpen(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Assign ULBs
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        disabled={getAvailableRoles().length === 0}
                                        onClick={() => setRoleDialogOpen(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Assign Roles
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={() => setIsToggleDialogOpen(true)}>
                                        <Ban className="h-4 w-4 mr-2" />
                                        {employee?.employee?.recstatus === 1 ? "Deactivate" : "Activate"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Employee Profile Card */}
                <Card className="grid grid-cols-1 lg:grid-cols-3 gap-4 rounded-xl border shadow-sm p-4 ">
                    <div className="flex flex-row  gap-4">
                        {/* Left: Image */}
                        <div className="relative rounded-sm overflow-hidden w-1/2 h-full h-[20rem] aspect-square">
                            <Image
                                src={
                                    employee?.employee?.empImage
                                      ? `${process.env.NEXT_PUBLIC_API_URL}/${employee.employee.empImage}`
                                      : '/placeholder.png'
                                  }
                                alt="Employee Image"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 120px, 200px"
                            />

                            
                        </div>

                        {/* Right: Details as List */}
                        <div className="text-center md:text-left space-y-1">
                            <h2 className="text-md sm:text-xl font-semibold">
                                {employee.employee ? `${employee.employee.empFirstName} ${employee.employee.empLastName}` : employee.username}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">{employee.employee?.jobTitle || "Employee"}</p>
                            <div className="mt-3 space-y-2">
                                {/* <div className="flex items-start justify-start md:justify-start gap-2">
                                           <Building2 className="h-4 w-4 text-muted-foreground" />
                                                   <span className="text-sm">{employee.employee?.companyName}</span>
                                               </div>
                                               <div className="flex items-start justify-start md:justify-start gap-2">
                                                   <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                                                   <span className="text-sm">{employee.employee?.empCode}</span>
                                               </div> */}
                                <div className="flex items-start justify-start md:justify-start gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{employee.email}</span>
                                </div>
                                <div className="flex items-start justify-start md:justify-start gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{employee.employee?.contactNo || employee.phone}</span>
                                </div>

                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="flex items-start gap-2">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Status</span>
                                </div>
                                <Badge variant={employee.employee?.recstatus === 1 ? "success" : "destructive"}>
                                    {employee.employee?.recstatus === 1 ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                    </div>





                    {/* Right Section - Details */}
                    <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
                        {employee.employee?.empCode && (
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs text-muted-foreground">Joining Date</span>
                                <span className="font-medium">{employee.employee.joiningDate}</span>
                            </div>
                        )}
                        {employee.employee?.aadharNo && (
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs text-muted-foreground">Aadhar Number</span>
                                <span className="font-medium">{employee.employee.aadharNo}</span>
                            </div>
                        )}
                        {employee.employee?.companyName && (
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs text-muted-foreground">Company</span>
                                <span className="font-medium">{employee.employee.companyName}</span>
                            </div>
                        )}
                        {employee.employee?.experienceYears && (
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs text-muted-foreground">Experience</span>
                                <span className="font-medium">{employee.employee.experienceYears} years</span>
                            </div>
                        )}
                        {employee.employee?.accountNo && (
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs text-muted-foreground">Account Number</span>
                                <span className="font-medium">{employee.employee.accountNo}</span>
                            </div>
                        )}
                        {employee.employee?.bankName && (
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs text-muted-foreground">Bank Name</span>
                                <span className="font-medium">{employee.employee.bankName}</span>
                            </div>
                        )}
                        {employee.employee?.ifscCode && (
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs text-muted-foreground">IFSC Code</span>
                                <span className="font-medium">{employee.employee.ifscCode}</span>
                            </div>
                        )}
                        {employee.employee?.accountHolderName && (
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs text-muted-foreground">Account Holder</span>
                                <span className="font-medium">{employee.employee.accountHolderName}</span>
                            </div>
                        )}
                        {employee.employee?.empAddress && (
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs text-muted-foreground">Address</span>
                                <span className="font-medium">{employee.employee.empAddress}</span>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Assigned Wards</p>
                                    <p className="text-3xl font-bold">{employee.ward?.length || 0}</p>
                                </div>
                                <MapPinIcon className="h-10 w-10 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Assigned ULBs</p>
                                    <p className="text-3xl font-bold">{employee.ulb?.length || 0}</p>
                                </div>
                                <Building className="h-10 w-10 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Assigned Roles</p>
                                    <p className="text-3xl font-bold">{employee.roles?.length || 0}</p>
                                </div>
                                <Shield className="h-10 w-10 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Card className=" shadow-lg border-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="border-b pb-4">
                            <TabsList className="w-full bg-transparent overflow-x-auto">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="details" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                                    Details
                                </TabsTrigger>
                                <TabsTrigger value="wards" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                                    Wards
                                </TabsTrigger>
                                <TabsTrigger value="ulbs" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                                    ULBs
                                </TabsTrigger>
                                <TabsTrigger value="roles" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                                    Roles
                                </TabsTrigger>
                                <TabsTrigger value="permissions" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                                    Permissions
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-2 md:p-6">
                            <TabsContent value="overview" className="space-y-6 mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {employee.employee && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Personal Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-slate-400">First Name</p>
                                                        <p className="font-medium">{employee.employee.empFirstName || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400">Last Name</p>
                                                        <p className="font-medium">{employee.employee.empLastName || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400">Aadhar Number</p>
                                                        <p className="font-medium">{employee.employee.aadharNo || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400">Joining Date</p>
                                                        <p className="font-medium">{employee.employee.joiningDate || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {employee.employee && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Professional Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-slate-400">Job Title</p>
                                                        <p className="font-medium">{employee.employee.jobTitle || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400">Experience</p>
                                                        <p className="font-medium">{employee.employee.experienceYears ? `${employee.employee.experienceYears} years` : 'N/A'}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-slate-400">Job Description</p>
                                                        <p className="font-medium">{employee.employee.jobDescription || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                                {employee.employee?.empAddress && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <MapPin className="h-5 w-5" />
                                                Address Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-slate-700">{employee.employee.empAddress}</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="details" className="mt-0">
                                {employee.employee && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Banking Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm text-slate-400">Account Holder Name</p>
                                                        <p className="font-medium">{employee.employee.accountHolderName || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-400">Account Number</p>
                                                        <p className="font-medium">{employee.employee.accountNo || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-400">Bank Name</p>
                                                        <p className="font-medium">{employee.employee.bankName || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-400">IFSC Code</p>
                                                        <p className="font-medium">{employee.employee.ifscCode || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Additional Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm text-slate-400">Employee Email</p>
                                                        <p className="font-medium">{employee.employee.empEmail || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-400">Contact Number</p>
                                                        <p className="font-medium">{employee.employee.contactNo || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-400">Block Payment</p>
                                                        {/* <Badge variant={employee.employee.blockPayment === 'true' ? 'destructive' : 'default'}>
                              {employee.employee.blockPayment === 'true' ? 'Blocked' : 'Allowed'}
                            </Badge> */}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="wards" className="space-y-6 mt-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold">Ward Assignments</h3>
                                        <p className="text-slate-400">Manage ward access for this employee</p>
                                    </div>
                                    <Button
                                        onClick={() => setWardDialogOpen(true)}
                                        className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                                        disabled={getAvailableWards().length === 0}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Assign Wards
                                    </Button>
                                </div>

                                {employee.ward && employee.ward.length > 0 ? (
                                    <Card>
                                        <CardContent className="p-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="">
                                                        <TableHead className="font-semibold">Ward Name</TableHead>
                                                        <TableHead className="font-semibold">Ward No.</TableHead>
                                                        <TableHead className="font-semibold">Ward Code</TableHead>
                                                        <TableHead className="font-semibold">Area</TableHead>
                                                        <TableHead className="font-semibold">Status</TableHead>
                                                        <TableHead className="font-semibold text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {employee.ward.map((ward) => (
                                                        <TableRow key={ward.id} >
                                                            <TableCell className="font-medium">{ward.name}</TableCell>
                                                            <TableCell>{ward.ward_no || 'N/A'}</TableCell>
                                                            <TableCell>{ward.ward_code || 'N/A'}</TableCell>
                                                            <TableCell>{ward.area || 'N/A'}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={ward.recstatus === 1 ? "default" : "secondary"}>
                                                                    {ward.recstatus === 1 ? "Active" : "Inactive"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => setDeleteWardId(ward.id)}
                                                                    disabled={actionLoading === `disconnect-ward-${ward.id}`}
                                                                    className="shadow-sm"
                                                                >
                                                                    {actionLoading === `disconnect-ward-${ward.id}` ? (
                                                                        <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                                                                    ) : (
                                                                        <Trash2 className="h-3 w-3" />
                                                                    )}
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card>
                                        <CardContent className="text-center py-12">
                                            <MapPinIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-slate-900 mb-2">No Wards Assigned</h3>
                                            <p className="text-slate-600 mb-4">This employee has no ward assignments yet.</p>
                                            <Button
                                                onClick={() => setWardDialogOpen(true)}
                                                disabled={getAvailableWards().length === 0}
                                            >
                                                Assign First Ward
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="ulbs" className="space-y-6 mt-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold">ULB Assignments</h3>
                                        <p className="text-slate-400">Manage ULB access for this employee</p>
                                    </div>
                                    <Button
                                        onClick={() => setUlbDialogOpen(true)}
                                        className="bg-green-600 hover:bg-green-700 shadow-sm"
                                        disabled={getAvailableUlbs().length === 0}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Assign ULBs
                                    </Button>
                                </div>

                                {employee.ulb && employee.ulb.length > 0 ? (
                                    <Card>
                                        <CardContent className="p-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="">
                                                        <TableHead className="font-semibold">ULB Name</TableHead>
                                                        <TableHead className="font-semibold">Hindi Name</TableHead>
                                                        <TableHead className="font-semibold">Address</TableHead>
                                                        <TableHead className="font-semibold">Domain</TableHead>
                                                        <TableHead className="font-semibold">Status</TableHead>
                                                        <TableHead className="font-semibold text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {employee.ulb.map((ulb) => (
                                                        <TableRow key={ulb.id} >
                                                            <TableCell className="font-medium">{ulb.name}</TableCell>
                                                            <TableCell>{ulb.name_hindi || 'N/A'}</TableCell>
                                                            <TableCell className="max-w-xs truncate">{ulb.address || 'N/A'}</TableCell>
                                                            <TableCell>{ulb.domainname || 'N/A'}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={ulb.recstatus === 1 ? "default" : "secondary"}>
                                                                    {ulb.recstatus === 1 ? "Active" : "Inactive"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => setDeleteUlbId(ulb.id)}
                                                                    disabled={actionLoading === `disconnect-ulb-${ulb.id}`}
                                                                    className="shadow-sm"
                                                                >
                                                                    {actionLoading === `disconnect-ulb-${ulb.id}` ? (
                                                                        <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                                                                    ) : (
                                                                        <Trash2 className="h-3 w-3" />
                                                                    )}
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card>
                                        <CardContent className="text-center py-12">
                                            <Building className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-slate-900 mb-2">No ULBs Assigned</h3>
                                            <p className="text-slate-600 mb-4">This employee has no ULB assignments yet.</p>
                                            <Button
                                                onClick={() => setUlbDialogOpen(true)}
                                                disabled={getAvailableUlbs().length === 0}
                                            >
                                                Assign First ULB
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="roles" className="space-y-6 mt-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold">Role Assignments</h3>
                                        <p className="text-slate-400">Manage role permissions for this employee</p>
                                    </div>
                                    <Button
                                        onClick={() => setRoleDialogOpen(true)}
                                        className="bg-purple-600 hover:bg-purple-700 shadow-sm"
                                        disabled={getAvailableRoles().length === 0}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Assign Roles
                                    </Button>
                                </div>

                                {employee.roles && employee.roles.length > 0 ? (
                                    <Card>
                                        <CardContent className="p-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="font-semibold">Role Name</TableHead>
                                                        <TableHead className="font-semibold">Role ID</TableHead>
                                                        <TableHead className="font-semibold">ULB ID</TableHead>
                                                        <TableHead className="font-semibold">Status</TableHead>
                                                        <TableHead className="font-semibold text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {employee.roles.map((role) => (
                                                        <TableRow key={role.id}>
                                                            <TableCell className="font-medium">{role.name}</TableCell>
                                                            <TableCell>{role.id}</TableCell>
                                                            <TableCell>{role.ulb_id || 'N/A'}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={role.recstatus === 1 ? "default" : "secondary"}>
                                                                    {role.recstatus === 1 ? "Active" : "Inactive"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => setDeleteRoleId(role.id)}
                                                                    disabled={actionLoading === `disconnect-role-${role.id}`}
                                                                    className="shadow-sm"
                                                                >
                                                                    {actionLoading === `disconnect-role-${role.id}` ? (
                                                                        <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                                                                    ) : (
                                                                        <Trash2 className="h-3 w-3" />
                                                                    )}
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card>
                                        <CardContent className="text-center py-12">
                                            <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-slate-900 mb-2">No Roles Assigned</h3>
                                            <p className="text-slate-600 mb-4">This employee has no role assignments yet.</p>
                                            <Button
                                                onClick={() => setRoleDialogOpen(true)}
                                                disabled={getAvailableRoles().length === 0}
                                            >
                                                Assign First Role
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="permissions" className="space-y-6 mt-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg md:text-xl font-semibold">Permissions</h3>
                                        <p className="text-slate-400 text-xs md:text-sm">Manage permissions for this employee</p>
                                    </div>
                                    <Button
                                        onClick={() => setPermissionDialogOpen(true)}
                                        className="bg-purple-600 hover:bg-purple-700 shadow-sm"
                                        disabled={getAvailablePermissions().length === 0}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        <span className="hidden md:inline"> Assign Permissions </span>
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Assigned Permissions */}
                                    <div>
                                        {employee?.permissions?.filter(p => p.from === "permission").length > 0 ? (
                                            <div>
                                                <CardContent className="p-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {employee.permissions
                                                            .filter((permission) => permission.from === "permission")
                                                            .map((permission) => (
                                                                <div
                                                                    key={permission.id}
                                                                    className="flex items-center outline bg-primary/20 px-3 py-1 rounded-lg shadow-sm"
                                                                >
                                                                    <span className="mr-2 text-sm">{permission.name}</span>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        onClick={() => setDeletePermissionId(permission.id)}
                                                                        disabled={actionLoading === `disconnect-permission-${permission.id}`}
                                                                    >
                                                                        {actionLoading === `disconnect-permission-${permission.id}` ? (
                                                                            <div className="animate-spin h-2 w-2 border border-white border-t-transparent rounded-full" />
                                                                        ) : (
                                                                            <Trash2 className="h-2 w-2" />
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </CardContent>
                                            </div>
                                        ) : (
                                            <Card>
                                                <CardContent className="text-center py-12">
                                                    <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Permissions Assigned</h3>
                                                    <p className="text-slate-600 mb-4">This employee has no permission assignments yet.</p>
                                                    <Button
                                                        onClick={() => setPermissionDialogOpen(true)}
                                                        disabled={getAvailablePermissions().length === 0}
                                                    >
                                                        Assign Permission
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>

                                    {/* Revoked Permissions */}
                                    <div>
                                        {employee?.revokedPermissions && employee.revokedPermissions.length > 0 && (
                                            <Card>
                                                <CardContent className="p-4">
                                                    <h3 className="font-semibold mb-2">Permission Revoked</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {employee.revokedPermissions.map((permission) => (
                                                            <div
                                                                key={permission.id}
                                                                className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full shadow-sm"
                                                            >
                                                                <span className="mr-2">{permission.name}</span>
                                                                {/* Optional delete button if you want to allow un-revoke */}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </div>



                            </TabsContent>
                        </div>
                    </Tabs>
                </Card>

                {/* Dialogs */}
                <MultiSelectDialog
                    title="Assign Wards"
                    description="Select the wards this employee should have access to."
                    items={getAvailableWards()}
                    selectedValues={selectedWards}
                    onSelectionChange={setSelectedWards}
                    open={wardDialogOpen}
                    onOpenChange={setWardDialogOpen}
                    onConfirm={handleConnectWards}
                    isLoading={actionLoading === 'connect-wards'}
                />

                <MultiSelectDialog
                    title="Assign ULBs"
                    description="Select the ULBs this employee should have access to."
                    items={getAvailableUlbs()}
                    selectedValues={selectedUlbs}
                    onSelectionChange={setSelectedUlbs}
                    open={ulbDialogOpen}
                    onOpenChange={setUlbDialogOpen}
                    onConfirm={handleConnectULBs}
                    isLoading={actionLoading === 'connect-ulbs'}
                />

                <MultiSelectDialog
                    title="Assign Roles"
                    description="Select the roles this employee should have."
                    items={getAvailableRoles()}
                    selectedValues={selectedRoles}
                    onSelectionChange={setSelectedRoles}
                    open={roleDialogOpen}
                    onOpenChange={setRoleDialogOpen}
                    onConfirm={handleConnectRoles}
                    isLoading={actionLoading === 'connect-roles'}
                />

                <MultiSelectDialog
                    title="Assign Permissions"
                    description="Select the permissions this employee should have."
                    items={getAvailablePermissions()}
                    selectedValues={selectedPermissions}
                    onSelectionChange={setSelectedPermissions}
                    open={permissionDialogOpen}
                    onOpenChange={setPermissionDialogOpen}
                    onConfirm={handleConnectPermissions}
                    isLoading={actionLoading === 'connect-permissions'}
                />

                {/* Confirmation Dialogs */}
                <ToggleConfirmationDialog
                    open={isToggleDialogOpen}
                    onOpenChange={setIsToggleDialogOpen}
                    title={`${employee?.employee?.recstatus === 1 ? "Deactivate" : "Activate"} Employee`}
                    description={`Are you sure you want to ${employee?.employee?.recstatus === 1 ? "deactivate" : "activate"} "${fullName}"?`}
                    onConfirm={handleToggleConfirm}
                    currentStatus={employee?.employee?.recstatus}
                />

                <AlertDialog open={deleteWardId !== null} onOpenChange={(open) => !open && setDeleteWardId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect Ward</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to disconnect this ward from the employee? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deleteWardId && handleDisconnectWard(deleteWardId)}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Disconnect
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={deleteUlbId !== null} onOpenChange={(open) => !open && setDeleteUlbId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect ULB</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to disconnect this ULB from the employee? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deleteUlbId && handleDisconnectULB(deleteUlbId)}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Disconnect
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={deleteRoleId !== null} onOpenChange={(open) => !open && setDeleteRoleId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect Role</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to disconnect this role from the employee? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deleteRoleId && handleDisconnectRole(deleteRoleId)}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Disconnect
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={deletePermissionId !== null} onOpenChange={(open) => !open && setDeletePermissionId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect Permission</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to disconnect this permission from the employee? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deletePermissionId && handleDisconnectPermission(deletePermissionId)}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Disconnect
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>


             </Suspense>
                 </div>
               </PageContainer>
    )
}

const MultiSelectDialog = ({
    title,
    description,
    items,
    selectedValues,
    onSelectionChange,
    open,
    onOpenChange,
    onConfirm,
    isLoading,
}: {
    title: string
    description: string
    items: ApiDataItem[]
    selectedValues: number[]
    onSelectionChange: (values: number[]) => void
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    isLoading?: boolean
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
                    <DialogDescription className="text-slate-700 dark:text-slate-400">{description}</DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {items.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No items available for assignment</p>
                        </div>
                    ) : (
                        <Command className="border rounded-lg">
                            <CommandInput placeholder={`Search ${title.toLowerCase()}...`} className="border-0" />
                            <CommandList className="max-h-64">
                                <CommandEmpty>No {title.toLowerCase()} found.</CommandEmpty>
                                <CommandGroup>
                                    {items.map((item) => (
                                        <CommandItem key={item.id} className="flex items-center space-x-3 p-3 cursor-pointer">
                                            <Checkbox
                                                checked={selectedValues.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                    const newValue = checked
                                                        ? [...selectedValues, item.id]
                                                        : selectedValues.filter((id) => id !== item.id)
                                                    onSelectionChange(newValue)
                                                }}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium ">{item.name}</p>
                                                {(item.domainname || item.address) && (
                                                    <p className="text-sm text-slate-400 truncate">
                                                        {item.domainname ? `Domain: ${item.domainname}` : ''}
                                                        {item.address ? `Address: ${item.address}` : ''}
                                                    </p>
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-slate-700 dark:text-slate-400">
                        {selectedValues.length} item(s) selected
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={selectedValues.length === 0 || isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                    Assigning...
                                </>
                            ) : (
                                `Assign ${selectedValues.length} Item(s)`
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}