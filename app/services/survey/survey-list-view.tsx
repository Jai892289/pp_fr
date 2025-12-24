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
import {
  getSurveyDataList,
  getSurveyDashboardCount,
} from "@/apicalls/surveySetup";
import { Button } from "@/components/ui/button";
import { Search, RefreshCcw, X, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExportDropdown } from "@/components/ui/export-dropdown";
import { formatExportDate, type ExportConfig } from "@/lib/export-utils";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {encrypt} from "@/lib/hashEncrypt";

export function SurveyListView() {
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
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Tagged" | "Pending"
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

        const response = await getSurveyDataList(page, limit, {
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

  const fetchAllData = useCallback(
    async (opts?: {
      searchValue?: string | null;
      date_from?: string | null;
      date_upto?: string | null;
    }) => {
      try {
        setIsLoading(true);

        const today = !opts?.date_from && !opts?.date_upto ? "true" : "false";

        const response = await getSurveyDataList(1, 10000, {
          ...opts,
          today,
        });

        if (response?.data) {
          setAllData(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error("Error fetching all data for export:", err);
        // fallback to current data if fetch fails
        setAllData(data);
      } finally {
        setIsLoading(false);
      }
    },
    [data]
  );

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

  const handleView = (id: string) => {
    router.push(`/services/survey/${encrypt(id)}`);
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

  // const handleSearch = async () => {
  //   const q = searchTerm.trim();
  //   if (!q) {
  //     fetchData(1, itemsPerPage);
  //     return;
  //   }
  //   await fetchData(1, itemsPerPage, { searchValue: q });
  // };

  // const handleClearSearch = () => {
  //   setSearchTerm("");
  //   fetchData(1, itemsPerPage);
  // };

  // handleClearSearch remains the same

  // Update handleSearch to accept optional value
  const handleSearch = async (value?: string) => {
    const q = (value ?? searchTerm).trim();
    if (!q) {
      fetchData(1, itemsPerPage);
      fetchAllData(); // ✅ reset to unfiltered export data
      return;
    }
    await fetchData(1, itemsPerPage, { searchValue: q });
    await fetchAllData({ searchValue: q }); // ✅ fetch filtered export data
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchData(1, itemsPerPage);
  };

  // Handle date range filter application
  const handleDateRangeFilter = async () => {
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

    await fetchData(1, itemsPerPage, {
      date_from: dateFrom,
      date_upto: dateTo,
      ...(searchTerm ? { searchValue: searchTerm } : {}),
    });

    await fetchAllData({
      date_from: dateFrom,
      date_upto: dateTo,
      ...(searchTerm ? { searchValue: searchTerm } : {}),
    });

    setIsCalendarOpen(false);

    toast({
      title: "Date filter applied",
      description: `Showing data from ${dateFrom} to ${dateTo}`,
    });
  };

  // Clear date range filter
  const handleClearDateRange = async () => {
  setDateRange({ from: undefined, to: undefined });
  await fetchData(
    1,
    itemsPerPage,
    searchTerm ? { searchValue: searchTerm } : undefined
  );
  await fetchAllData(searchTerm ? { searchValue: searchTerm } : undefined);

  toast({
    title: "Date filter cleared",
    description: "Showing all dates",
  });
};


  const exportConfig: ExportConfig = useMemo(
    () => ({
      filename: "Survey_Report",
      sheetName: "Survey Details",
      includeTimestamp: true,
      data: allData.map((item) => ({
        id: item.id,
        user_full_name: item.user_full_name,
        created_at: formatExportDate(item.created_at),
        property_id: item.user_charge_data?.integrated_property_id || "",
        owner_name: item.user_charge_data?.integrated_owner_name || "",
        address: item.user_charge_data?.address || "",
      })),
      columns: [
        { key: "id", label: "Survey ID" },
        { key: "user_full_name", label: "Survyor Name" },
        { key: "created_at", label: "Created At" },
        { key: "property_id", label: "Property ID" },
        { key: "owner_name", label: "Owner Name" },
        { key: "address", label: "Address" },
      ],
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
    <div className=" rounded-lg scroll-auto bg-indigo-00 ">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-2xl font-bold">Survey Report</h2>
      </div>

      {/* Top Controls */}
      <div className="flex flex-col gap-4 p-4">
        {/* First Row: Counts left, Export right */}
        <div className="flex justify-between items-center">
          {/* Counts */}
          <div className="flex items-center gap-6">
            <div className="text-sm font-semibold">
              Total Count: {countData?.totalConsumerCount ?? 0}
            </div>
            <div className="text-sm font-semibold text-green-600">
              Tagged Count: {countData?.taggedCount ?? 0}
            </div>
            <div className="text-sm font-semibold text-yellow-600">
              Un-Tagged Count: {countData?.unTaggedCount ?? 0}
            </div>
          </div>
        </div>

        {/* Second Row: Search + Date Range + Status buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 flex-wrap">
          {/* Left side: Search + Date Range */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <input
                placeholder="Search By Property Id"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value); // 🔹 don't trim here

                  // 🔹 If input is cleared, show full data again
                  if (value.length === 0) {
                    handleClearSearch();
                    return;
                  }

                  // 🔹 When input length reaches 8 or more, trigger search
                  if (value.length >= 8) {
                    handleSearch(value); // 🔹 pass current input
                  }
                }}
                className="w-full h-9 sm:h-10 px-3 py-1 border rounded pr-16 text-sm"
              />
              {/* <button
                onClick={handleSearch}
                className="absolute right-6 top-1/2 -translate-y-1/2"
              >
                <Search className="h-4 w-4" />
              </button> */}
              <button
                onClick={() => handleSearch()} // 🔹 call it without passing event
                className="btn"
              ></button>
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Date Range Filter */}
            <div className="flex gap-2 flex-wrap">
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

          {/* Right side: Status Filter Buttons */}
          {/* <div className="flex gap-2 flex-wrap">
            {(["All", "Verified", "Pending", "Rejected"] as const).map(
              (status) => {
                const colorClasses: Record<typeof status, string> = {
                  All: "bg-gray-200",
                  Verified: "bg-green-100",
                  Pending: "bg-yellow-100",
                  Rejected: "bg-red-100",
                };
                return (
                  <button
                    key={status}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      colorClasses[status]
                    } ${
                      statusFilter === status
                        ? "ring-2 ring-offset-1 ring-primary"
                        : ""
                    }`}
                    onClick={() => handleStatusFilterChange(status)}
                  >
                    {status}
                  </button>
                );
              }
            )}
          </div> */}
          {/* Export Button */}
          <div className="w-full sm:w-auto">
            <ExportDropdown config={exportConfig} />
          </div>
          {/* <ExportDropdown
            config={{
              filename: "Survey_Report",
              sheetName: "Survey Details",
              includeTimestamp: true,
              data: allData,
              columns: [],
            }}
          /> */}
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-b-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-primary hover:bg-primary">
              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                SR.NO.
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                Property ID
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                Owner Name
              </TableHead>
              {/* <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                Integrated Owner
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                Integrated Property ID
              </TableHead> */}
              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                Address
              </TableHead>

              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                Surveyor Name
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
                  No Survey data found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow
                  key={item.id}
                  onClick={() => handleView(item.id)}
                  className="border-b hover:bg-gray-50/30 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-xs font-mono">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 cursor-pointer">
                    {item?.user_charge_data?.integrated_property_id || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {item?.user_charge_data?.integrated_owner_name || "-"}
                  </TableCell>
                  {/* <TableCell className="px-4 py-3">
                    {item?.user_charge_data?.integrated_owner_name || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {item?.user_charge_data?.integrated_property_id || "-"}
                  </TableCell> */}
                  <TableCell className="px-4 py-3 max-w-[200px] truncate">
                    {item?.user_charge_data?.address || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs">
                    {item.user_full_name || "-"}
                  </TableCell>

                  {/* <TableCell className="px-4 py-3 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAccept(item.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(item.id)}
                    >
                      Reject
                    </Button>
                  </TableCell> */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
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
