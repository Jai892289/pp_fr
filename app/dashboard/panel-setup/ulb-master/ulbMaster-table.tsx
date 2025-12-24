"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationComponent } from "@/components/pagination";
import { ULBMasterDetail, ULBType } from "@/types/ulb";
import { ToggleConfirmationDialog } from "@/components/dialogs/ulb-master/master-confirmation-dialog";
import { ULBMasterDialog } from "@/components/dialogs/ulb-master/ulb-master-dialog";
import {
  getUlbMasterData,
  getUlbTypeData,
  toggleUlbMaster,
} from "@/apicalls/panelSetup";
import { Button } from "@/components/ui/button";
import { Edit3, Search, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ExportDropdown } from "@/components/ui/export-dropdown";
import {
  formatExportDate,
  formatExportStatus,
  type ExportConfig,
} from "@/lib/export-utils";

export function ULBMasterTable() {
  const [data, setData] = useState<ULBMasterDetail[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [allData, setAllData] = useState<ULBMasterDetail[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableKey, setTableKey] = useState(0);
  const [ulbType, setUlbType] = useState<ULBType[]>([]);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [selectedULBMaster, setSelectedULBMaster] =
    useState<ULBMasterDetail | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUlbTypes = useCallback(async () => {
    try {
      const typeData = await getUlbTypeData();
      setUlbType(typeData.data.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch ULB types", err);
    }
  }, [getUlbTypeData]);

  const fetchAllData = useCallback(async () => {
    try {
      // Fetch all data by requesting a large limit (or implement proper pagination)
      const response = await getUlbMasterData(1, 1000); // Fetch up to 1000 records

      if (response && response.data) {
        setAllData(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error("Error fetching all data for export:", err);
      // Fallback to current data if all data fetch fails
      setAllData(data);
    }
  }, [getUlbMasterData, data]);

  const fetchData = useCallback(
    async (page: number = 1, limit: number = itemsPerPage) => {
      try {
        setIsLoading(true);
        const response = await getUlbMasterData(page, limit);

        if (response?.data && response?.pagination) {
          setData(response.data || []);
          setTotalItems(response.pagination.total || 0);
          setTotalPages(response.pagination.totalPages || 0);
          setCurrentPage(response.pagination.page || 1);
          setItemsPerPage(response.pagination.limit || 10);
        } else {
          throw new Error(
            "Invalid response format: Missing data or pagination"
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [getUlbMasterData, itemsPerPage]
  );

  useEffect(() => {
    fetchData();
    fetchUlbTypes();
    fetchAllData();
  }, [fetchData]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, itemsPerPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    fetchData(1, newItemsPerPage);
  };

  // Handle edit ULB Type
  const handleEdit = (ulbMaster: ULBMasterDetail) => {
    setSelectedULBMaster(ulbMaster);
    setIsEditDialogOpen(true);
  };

  // Handle toggle ULB Type status
  const handleToggle = (ulbMaster: ULBMasterDetail) => {
    setSelectedULBMaster(ulbMaster);
    setToggleError(null);
    setIsToggleDialogOpen(true);
  };

  // Handle toggle confirmation
  const handleToggleConfirm = async () => {
    if (!selectedULBMaster) return;

    try {
      await toggleUlbMaster(selectedULBMaster.id);
      await fetchData(currentPage, itemsPerPage);
      const action =
        selectedULBMaster.recstatus === 1 ? "deactivated" : "activated";
      toast({
        title: "Success",
        description: `Permission ${action} successfully`,
        variant: "success",
      });
      setIsToggleDialogOpen(false);
      setSelectedULBMaster(null);
      setToggleError(null);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to toggle ULB Type status";
      setToggleError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const handleAddSuccess = async () => {
    setIsAddDialogOpen(false); // close dialog
    await fetchData(currentPage, itemsPerPage); // reload data
    await fetchAllData(); // refresh export data too
  };

  // Handle successful EDIT
  const handleFormSuccess = async () => {
    setIsEditDialogOpen(false); // close dialog
    await fetchData(currentPage, itemsPerPage);
    await fetchAllData();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  const filteredULBTypeData = data.filter((ulbType) => {
    const matchesSearch = ulbType.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const exportConfig: ExportConfig = useMemo(
    () => ({
      filename: "ULB Master_Report",
      data: allData,
      columns: [
        { key: "name", label: "ULB Name" },
        { key: "name_hindi", label: "ULB Name Hindi" },
        { key: "address", label: "Address" },
        { key: "nigamtollfreeno", label: "Nigam Toll Free No" },
        { key: "receipttollfreeno", label: "Receipt Toll Free No" },
        { key: "bankname", label: "Bank Name" },
        { key: "accountno", label: "Account No" },
        { key: "ifsccode", label: "IFS Code" },
        { key: "agencyfullname", label: "Agency Full Name" },
        { key: "agencylogo", label: "Agency Logo" },
        { key: "domainname", label: "Domain Name" },
        { key: "gstno", label: "GST No" },
        {
          key: "created_at",
          label: "Created Date",
          formatter: formatExportDate,
        },
      ],
      sheetName: "ULB Master",
      includeTimestamp: true,
    }),
    [allData]
  );

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
    );
  }

  return (
    <>
      <div className="bg-background rounded-lg">
        {/* Header Controls */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold pl-2">ULB Master</h2>
          </div>
          <div className="flex items-center gap-2">
            <ExportDropdown config={exportConfig} />
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
              className="h-10 px-6 text-xs bg-primary hover:bg-primary/80 font-medium cursor-pointer"
            >
              + Add New ULB
            </Button>
          </div>
        </div>

        {/* Items per page and Export */}
        {/* <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by ULB name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div></div>

          <div className="flex items-center gap-2">
          
            <Button
              onClick={() => {
                fetchData()
                fetchAllData() // Refresh all data when refresh button is clicked
              }}
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs rounded-sm bg-transparent cursor-pointer"
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
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
                  NAME
                </TableHead>

                <TableHead className="hidden md:table-cell h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                  ADDRESS
                </TableHead>
                <TableHead className="hidden md:table-cell h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                  TOLL NO
                </TableHead>

                <TableHead className="hidden md:table-cell h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                  BANK DETAILS
                </TableHead>

                <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                  AGENCY NAME
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
              {isLoading || data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-20 text-center text-sm text-gray-500"
                  >
                    {isLoading ? "Loading..." : "No ULB types found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredULBTypeData.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="border-b hover:bg-gray-50/30 transition-colors"
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          <span className="text-xs font-mono">
                            {String(
                              (currentPage - 1) * itemsPerPage + index + 1
                            ).padStart(2, "0")}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">
                        {item.ulb_type?.name}
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{item.address}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">
                        {item.name_hindi}
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <div className="flex items-center text-gray-500  gap-2 text-xs">
                        <span className="font-medium dark:text-gray-400">
                          Nigam Toll No:&nbsp;{" "}
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {item.nigamtollfreeno}
                          </span>
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">
                        Receipt Toll No:&nbsp;{" "}
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.receipttollfreeno}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-2">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{item.bankname}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">
                        IFS Code:&nbsp;
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.ifsccode}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">
                        Account No:&nbsp;
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.accountno}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">
                          {item.agencyfullname}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">
                        Domain Name:&nbsp;
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.domainname}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">
                        GST No:&nbsp;
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.gstno}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${
                          item.recstatus === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.recstatus === 1 ? "Active" : "Inactive"}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-end gap-8">
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="h-8 w-8 p-0 hover:bg-green-50 cursor-pointer dark:hover:bg-green-900"
                          >
                            <Edit3 className="h-4 w-4 text-green-600" />
                          </Button>
                        </div>
                        <div>
                          <Switch
                            checked={item.recstatus === 1}
                            onCheckedChange={() => handleToggle(item)}
                            disabled={toggleLoading === item.id}
                            className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300 cursor-pointer"
                          />
                          {toggleLoading === item.id && (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-center px-4 py-3 border-t ">
          <PaginationComponent
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <ULBMasterDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        ulbMaster={null}
        ulbType={ulbType}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Dialog */}
      <ULBMasterDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        ulbMaster={selectedULBMaster}
        ulbType={ulbType}
        onSuccess={handleFormSuccess}
      />

      {/* Toggle Confirmation Dialog */}
      <ToggleConfirmationDialog
        open={isToggleDialogOpen}
        onOpenChange={setIsToggleDialogOpen}
        title={`${
          selectedULBMaster?.recstatus === 1 ? "Deactivate" : "Activate"
        } ULB`}
        description={`Are you sure you want to ${
          selectedULBMaster?.recstatus === 1 ? "deactivate" : "activate"
        } "${selectedULBMaster?.name}"?`}
        onConfirm={handleToggleConfirm}
        currentStatus={selectedULBMaster?.recstatus || 0}
      />

      {/* Toggle Error Display */}
      {toggleError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex items-center text-red-800">
            <span className="mr-2">⚠️</span>
            <h3 className="text-sm font-medium">Toggle Failed</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{toggleError}</p>
        </div>
      )}
    </>
  );
}
