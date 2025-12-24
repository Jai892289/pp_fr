"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationComponent } from "@/components/pagination";
import { SurveyDetail, SurveyCountDetail } from "@/types/survey";
import { getDriversDataList } from "@/apicalls/driverSetup";
import { Button } from "@/components/ui/button";
import { Search, RefreshCcw, X, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExportDropdown } from "@/components/ui/export-dropdown";
import { formatExportDate, type ExportConfig } from "@/lib/export-utils";
import { format } from "date-fns";
import { encrypt } from "@/lib/hashEncrypt";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getSurveyDashboardCount } from "@/apicalls/surveySetup";

export function DriversListView() {
  const [data, setData] = useState<SurveyDetail[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [currentPage, setCurrentPage] = useState(1);
  const [allData, setAllData] = useState<SurveyDetail[]>([]);
  const [countData, setCountData] = useState<SurveyCountDetail>();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Verified" | "Pending" | "Rejected"
  >("All");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const fetchData = useCallback(
    async (
      page: number = 1,
      limit: number = itemsPerPage,
      opts?: {
        searchValue?: string | null;
        date_from?: string | null;
        date_upto?: string | null;
      }
    ) => {
      try {
        setIsLoading(true);
        const today = !opts?.date_from && !opts?.date_upto ? "true" : "false"; // ✅ dynamic toggle

        const response = await getDriversDataList(page, limit, {
          ...opts,
          today,
        });

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
    [itemsPerPage]
  );

  // ✅ Modified fetchAllData to support filters
  const fetchAllData = useCallback(
    async (opts?: {
      searchValue?: string | null;
      date_from?: string | null;
      date_upto?: string | null;
    }) => {
      try {
        setIsLoading(true);

        const today = !opts?.date_from && !opts?.date_upto ? "true" : "false";

        const response = await getDriversDataList(1, 10000, {
          ...opts,
          today,
        });

        // ✅ Fallback: if no data returned, keep old allData instead of empty
        if (response?.data && response.data.length > 0) {
          setAllData(response.data);
        } else if (!opts) {
          // if no filter, fetch unfiltered data again
          const defaultRes = await getDriversDataList(1, 10000, {
            today: "true",
          });
          setAllData(defaultRes?.data || []);
        }
      } catch (err) {
        console.error("❌ Error fetching all data for export:", err);
        if (!opts) {
          // fallback fetch for export safety
          const defaultRes = await getDriversDataList(1, 10000, {
            today: "true",
          });
          setAllData(defaultRes?.data || []);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData();
    fetchAllData();
    // fetchCountData();
  }, [fetchData]);

  const handleView = (id: string) => {
    router.push(`/services/drivers/${encrypt(id)}`);
  };

  // const handleAccept = (id: string) =>
  //   toast({ title: "Accepted", description: `Survey ${id} accepted.` });
  // const handleReject = (id: string) =>
  //   toast({ title: "Rejected", description: `Survey ${id} rejected.` });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const opts = searchTerm ? { searchValue: searchTerm } : undefined;
    fetchData(page, itemsPerPage, opts);
  };

  const handleItemsPerPageChange = (n: number) => {
    setItemsPerPage(n);
    const opts = searchTerm ? { searchValue: searchTerm } : undefined;
    fetchData(1, n, opts);
  };

  const handleStatusFilterChange = (status: string) => {
    // setItemsPerPage(status);
    // const opts = status ;
    // fetchData(1,itemsPerPage, opts);
  };

  // const handleSearch = async () => {
  //   const q = searchTerm.trim();
  //   if (!q) {
  //     fetchData(1, itemsPerPage);
  //     return;
  //   }
  //   await fetchData(1, itemsPerPage, { searchValue: q });
  // };

  // Update handleSearch to accept optional value
  const handleSearch = async (value?: string) => {
    const q = (value ?? searchTerm).trim();
    if (!q) {
      fetchData(1, itemsPerPage);
      fetchAllData(); // 🔹 no filters
      return;
    }

    const opts = { searchValue: q };
    await fetchData(1, itemsPerPage, opts);
    await fetchAllData(opts); // 🔹 keeps export consistent
  };

  // const handleClearSearch = () => {
  //   setSearchTerm("");
  //   fetchData(1, itemsPerPage);
  // };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchData(1, itemsPerPage);
    fetchAllData(); // 🔹 reset export data
  };

  // Handle date range filter application
  const handleDateRangeFilter = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Select date range",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    const dateFrom = format(dateRange.from, "yyyy-MM-dd");
    const dateTo = format(dateRange.to, "yyyy-MM-dd");

    const opts = {
      date_from: dateFrom,
      date_upto: dateTo,
      ...(searchTerm ? { searchValue: searchTerm } : {}),
    };

    fetchData(1, itemsPerPage, opts);
    fetchAllData(opts); // 🔹 fetch filtered export data

    setIsCalendarOpen(false);

    toast({
      title: "Date filter applied",
      description: `Showing data from ${dateFrom} to ${dateTo}`,
    });
  };

  // Clear date range filter
  const handleClearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
    const opts = searchTerm ? { searchValue: searchTerm } : undefined;

    fetchData(1, itemsPerPage, opts);
    fetchAllData(opts); // 🔹 reset filtered export

    toast({
      title: "Date filter cleared",
      description: "Showing all dates",
    });
  };

  const fetchCountData = useCallback(async () => {
    try {
      const response = await getSurveyDashboardCount();
      if (response && response.data) {
        setCountData(response.data);
      }
    } catch (err) {
      console.error("Error fetching count data:", err);
      setAllData(data);
    }
  }, [data]);

  useEffect(() => {
    fetchData();
    fetchAllData();
    fetchCountData();
  }, [fetchData]);

  // const exportConfig: ExportConfig = useMemo(
  //   () => ({
  //     filename: "Driver Report",
  //     sheetName: "Waste Collection Details",
  //     includeTimestamp: true,
  //     data: allData.map((item) => ({
  //       id: item.id,
  //       qr_number: item.qr_number || "",
  //       created_at: formatExportDate(item.created_at),
  //       property_id: item.user_charge_data?.integrated_property_id || "",
  //       owner_name: item.user_charge_data?.integrated_owner_name || "",
  //       address: item.user_charge_data?.address || "",
  //       driver_name: item.user_charge_data?.user_full_name || "",
  //     })),
  //     columns: [
  //       { key: "id", label: "Survey ID" },
  //       { key: "qr_number", label: "QR Number" },
  //       { key: "created_at", label: "Created At" },
  //       { key: "property_id", label: "Property ID" },
  //       { key: "owner_name", label: "Owner Name" },
  //       { key: "address", label: "Address" },
  //       { key: "driver_name", label: "Driver Name" },
  //     ],
  //   }),
  //   [allData]
  // );

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
    <div className="bg-background rounded-lg p-2 sm:p-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-2 sm:p-4">
        <h2 className="text-xl sm:text-2xl font-bold">Garbage Collection Report</h2>
      </div>

      {/* Top Controls */}
      <div className="flex flex-col gap-3 sm:gap-4 p-2 sm:p-4">
        {/* First Row: Counts left, Export right */}
        {/* (unchanged, still commented) */}

        <div className="flex justify-between items-center">
          {/* Counts */}
          <div className="flex items-center gap-6">
            <div className="text-sm font-semibold">
              Total Count: {countData?.totalConsumerCount ?? 0}
            </div>
            <div className="text-sm font-semibold text-green-600">
              Scanned QR Count: {countData?.todaysWasteCollection ?? 0}
            </div>
            <div className="text-sm font-semibold text-yellow-600">
              Un-Scanned QR Count: {(countData?.totalConsumerCount ?? 0) - (countData?.todaysWasteCollection ?? 0)}
            </div>
          </div>
        </div>

        {/* Second Row: Search + Date Range + (Export on right) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-start gap-3">
          {/* Left side: Search + Date Range */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
            {/* Search Bar */}
            <div className="relative w-full sm:max-w-md">
              <input
                placeholder="Search By Property Id"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value); // 🔹 don't trim here

                  if (value.length === 0) {
                    handleClearSearch();
                    return;
                  }

                  if (value.length >= 8) {
                    handleSearch(value); // 🔹 pass current input
                  }
                }}
                className="w-full h-9 sm:h-10 px-3 py-1 border rounded pr-16 text-sm"
              />

              {/* <button
                onClick={handleSearch}
                className="absolute right-9 top-1/2 -translate-y-1/2 p-1"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button> */}
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  aria-label="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Date Range Filter */}
            <div className="flex gap-2 flex-wrap w-full sm:w-auto">
              {/* <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[240px] justify-start text-left font-normal h-9 sm:h-10",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange?.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Filter by date range</span>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-[calc(100vw-2rem)] sm:w-auto p-0"
                  align="start"
                >
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1} 
                    className="rounded-lg border shadow-sm"
                  />
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearDateRange}
                      className="w-full sm:w-auto"
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDateRangeFilter}
                      disabled={!dateRange?.from || !dateRange?.to}
                      className="w-full sm:w-auto"
                    >
                      Apply Filter
                    </Button>
                  </div>
                </PopoverContent>
              </Popover> */}
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange?.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Filter by date range</span>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="rounded-lg border shadow-sm"
                  />
                  <div className="flex justify-between p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearDateRange}
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDateRangeFilter}
                      disabled={!dateRange?.from || !dateRange?.to}
                    >
                      Apply Filter
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Right side: Export (kept on the right for desktop, stacks on mobile) */}
          <ExportDropdown
            config={{
              filename: "Driver_Report",
              sheetName: "Waste Collection Details",
              includeTimestamp: true,
              data: allData.map((item) => ({
                id: item.id,
                qr_number: item.qr_number || "-",
                created_at: formatExportDate(item.created_at),
                property_id:
                  item.user_charge_data?.integrated_property_id || "-",
                owner_name: item.user_charge_data?.integrated_owner_name || "-",
                address: item.user_charge_data?.address || "-",
                driver_name: item.user_full_name || "-", // main driver field
              })),
              columns: [
                { key: "id", label: "Survey ID" },
                { key: "qr_number", label: "QR Number" },
                { key: "created_at", label: "Created At" },
                { key: "property_id", label: "Property ID" },
                { key: "owner_name", label: "Owner Name" },
                { key: "address", label: "Address" },
                { key: "driver_name", label: "Collector Name" },
              ],
            }}
          />
        </div>
      </div>

      {/* Table (mobile scroll) */}
      <div className="-mx-2 sm:mx-0">
        <div className="w-full overflow-x-auto rounded-b-lg">
          <Table className="min-w-[720px] sm:min-w-0">
            <TableHeader>
              <TableRow className="border-b bg-primary hover:bg-primary">
                <TableHead className="h-10 px-3 sm:px-4 text-[11px] sm:text-xs font-medium text-gray-100 uppercase tracking-wide">
                  SR.NO.
                </TableHead>
                <TableHead className="h-10 px-3 sm:px-4 text-[11px] sm:text-xs font-medium text-gray-100 uppercase tracking-wide">
                  Property ID
                </TableHead>
                <TableHead className="h-10 px-3 sm:px-4 text-[11px] sm:text-xs font-medium text-gray-100 uppercase tracking-wide">
                  Owner Name
                </TableHead>
                <TableHead className="h-10 px-3 sm:px-4 text-[11px] sm:text-xs font-medium text-gray-100 uppercase tracking-wide hidden sm:table-cell">
                  Address
                </TableHead>
                <TableHead className="h-10 px-3 sm:px-4 text-[11px] sm:text-xs font-medium text-gray-100 uppercase tracking-wide">
                  Collector Name
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                  Status
                </TableHead>
                {/* <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                  Action
                </TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="h-20 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="h-20 text-center text-sm text-gray-500"
                  >
                    No waste collection data found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow
                    key={item.id}
                    onClick={() => handleView(item.id)}
                    className="border-b hover:bg-gray-50/50 transition-colors "
                  >
                    <TableCell className="px-3 sm:px-4 py-3 text-[11px] sm:text-xs font-mono">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-3 text-sm cursor-pointer">
                      {item?.user_charge_data?.integrated_property_id || "-"}
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-3 text-sm">
                      {item?.user_charge_data?.integrated_owner_name || "-"}
                    </TableCell>

                    <TableCell className="px-3 sm:px-4 py-3 max-w-[220px] truncate hidden sm:table-cell">
                      {item?.user_charge_data?.address || "-"}
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-3 text-[11px] sm:text-xs">
                      {item.user_full_name || "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs">
                      {(() => {
                        const rawVal = item?.current_waste_collection_status;
                        return (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold
          ${rawVal ? "bg-green-100 text-green-700" : "bg-red-100 text-orange-400"
                              }`}
                          >
                            {rawVal ? "Completed" : "Pending"}
                          </span>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center sm:justify-between px-2 sm:px-4 py-3 border-t">
        <PaginationComponent
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}
