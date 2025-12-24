"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PaginationComponent } from "@/components/pagination"
import { Button } from "@/components/ui/button"
import { Edit3, Search, RefreshCcw, Eye, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ExportDropdown } from "@/components/ui/export-dropdown"
import { formatExportDate, type ExportConfig } from "@/lib/export-utils"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { getAllEmployees } from "@/apicalls/userSetup"
import type {
  EmployeeListApiResponse,
  User,
  Employee,
  Ulb
} from "@/types/employee"
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar"
import { AvatarImage } from "@/components/ui/avatar"

export function EmployeeListTable() {
  const [data, setData] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [allData, setAllData] = useState<User[]>([])
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const fetchData = useCallback(async (page: number = 1, limit: number = itemsPerPage) => {
    try {
      setIsLoading(true)
      const response: EmployeeListApiResponse = await getAllEmployees(page, limit)

      if (response?.data) {
        setData(response?.data?.data || [])
        setTotalItems(response.data.pagination?.total || 0)
        setTotalPages(response.data.pagination?.totalPages || 0)
        setCurrentPage(response.data.pagination?.page || 1)
        setItemsPerPage(response.data.pagination?.limit || 10)

        // Only fetch all data if we don't have it yet or if we're on the first page
        if (page === 1) {
          fetchAllData()
        }
      } else {
        throw new Error("Invalid response format: Missing data property")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      console.error("Error fetching data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [itemsPerPage])

  const fetchAllData = useCallback(async () => {
    try {
      // Only fetch all data if we don't have it yet
      if (allData.length === 0) {
        const response: EmployeeListApiResponse = await getAllEmployees(1, 1000)
        if (response?.data?.data) {
          setAllData(response.data.data)
        }
      }
    } catch (err) {
      console.error("Error fetching all data for export:", err)
    }
  }, [allData.length])

  // Initial data fetch
  useEffect(() => {
    fetchData()
    fetchAllData()
  }, [fetchData])

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, itemsPerPage)
  }

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    fetchData(1, newItemsPerPage)
  }

  // Handle view employee details
  const handleView = (employee: User) => {
    router.push(`employee-list/${employee.id}`)
  }

  // Handle add new employee
  const handleAdd = () => {
    router.push("employee-list/new")
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      console.error("Date formatting error:", error)
      return "Invalid date"
    }
  }

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return data

    return data.filter((user) => {
      if (!user) return false
      const searchLower = searchTerm.toLowerCase()
      const employee = user.employee

      return (
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.toLowerCase().includes(searchLower) ||
        (employee && (
          employee.empFirstName.toLowerCase().includes(searchLower) ||
          employee.empLastName.toLowerCase().includes(searchLower) ||
          employee.empEmail.toLowerCase().includes(searchLower)
        ))
      )
    })
  }, [data, searchTerm])

  // Get employee name
  const getEmployeeName = (user: User) => {
    if (user.employee) {
      return `${user.employee.empFirstName} ${user.employee.empLastName}`
    }
    return user.username
  }


  // Get ULB names
  const getULBNames = (ulbs: Ulb[]) => {
    if (ulbs.length === 0) return "Not assigned"
    return ulbs.map(ulb => ulb.name).join(", ")
  }

  const getWardNames = (wards: any[]) => {
    if (wards.length === 0) return "Not assigned"
    return wards.map(ward => ward.ward_no).join(", ")
  }

  // Transform data for export
  const exportData = useMemo(() => {
    return allData.map(user => ({
      ...user,
      ulb: user.ulb?.length ? user.ulb.map(ulb => ulb.name).join(', ') : 'Not assigned',
      recstatus: user.recstatus === 1 ? 'Active' : 'Inactive',
      created_at: user.created_at
    }))
  }, [allData])

  // Export configuration
  const exportConfig: ExportConfig = {
    filename: 'employees',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'recstatus', label: 'Status' },
      { key: 'ulb', label: 'ULBs' },
      { key: 'created_at', label: 'Created At' }
    ],
    data: exportData,
    sheetName: "Employees",
    includeTimestamp: true
  }


  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <div className="flex items-center text-red-800">
          <span className="mr-2">⚠️</span>
          <h3 className="text-sm font-medium">Error Loading Data</h3>
        </div>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <Button onClick={() => fetchData()} variant="outline" className="mt-3">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-background rounded-lg">
      {/* Header Controls */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left Section: Title */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <h2 className="text-xl sm:text-2xl font-bold pl-1 sm:pl-2">Employee List</h2>

            {/* Add Button (inline on mobile) */}
            <Button
              onClick={handleAdd}
              size="sm"
              className="sm:hidden h-9 px-3 text-xs bg-primary hover:bg-primary/80 font-medium cursor-pointer flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>

          {/* Right Section: Search + Export + Add (desktop only for add) */}
          <div className="flex items-center gap-2 sm:justify-end">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search Employee"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full h-9 sm:h-10 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Export Button */}
            <div className="shrink-0">
              <ExportDropdown config={exportConfig} />
            </div>

            {/* Add Button for Desktop */}
            <Button
              onClick={handleAdd}
              size="sm"
              className="hidden sm:flex h-10 px-6 text-xs bg-primary hover:bg-primary/80 font-medium cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add New Employee
            </Button>
          </div>
        </div>
      </div>






      {/* Search and Controls */}
      {/* <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search Employee"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-80 h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              fetchData()
              fetchAllData()
            }}
            variant="outline"
            size="lg"
            className="h-10 px-6 text-xs cursor-pointer"
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div> */}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-primary hover:bg-primary">
              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                SR.NO.
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                EMPLOYEE
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                CONTACT INFO
              </TableHead>

              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                ASSIGNED ULBs
              </TableHead>

              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                ASSIGNED Wards
              </TableHead>

              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                Designation
              </TableHead>

              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                STATUS
              </TableHead>

              <TableHead className="h-10 pr-10 text-xs font-medium text-gray-100 uppercase tracking-wide text-right">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-20 text-center text-sm text-gray-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-20 text-center text-sm text-gray-500">
                  {searchTerm ? "No employees match your search." : "No employees found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((user, index) => (
                <TableRow key={user.id} className="border-b hover:bg-gray-50/30 transition-colors">
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <span className="text-xs font-mono">
                          {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.employee?.empImage || ""} alt={getEmployeeName(user)} />
                        <AvatarFallback>{getEmployeeName(user)
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col ">
                        <span className="text-sm font-medium">{getEmployeeName(user)}</span>
                        <span className="text-xs text-gray-500">{user.username}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm">{user.email}</span>
                      <span className="text-xs text-gray-500">{user.phone}</span>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 w-[200px] truncate">
                    <span className="text-sm">
                      {getULBNames(user.ulb)}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 w-[200px] truncate">
                    <span className="text-sm">
                      {getWardNames(user.ward)}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-sm">
                    {user.employee?.jobTitle}
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${user.recstatus === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                    >
                      {user.recstatus === 1 ? "Active" : "Inactive"}
                    </span>
                  </TableCell>



                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(user)}
                        className="flex items-center h-8 p-0 hover:bg-blue-50 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />

                        <span className="">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`employee-list/${user.id}/edit`)}
                        className="h-8 w-8 p-0 hover:bg-green-50 cursor-pointer"
                        title="Edit Employee"
                      >
                        <Edit3 className="h-4 w-4 text-green-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center px-4 py-[3rem] border-t">


        <PaginationComponent
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}