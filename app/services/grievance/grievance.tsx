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
import { ConsumerDetail } from "@/types/consumer";
// import { getConsumerDataList } from "@/apicalls/consumerSetup";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import { ExportDropdown } from "@/components/ui/export-dropdown";
import { useRouter } from "next/navigation";
import { encrypt } from "@/lib/hashEncrypt";
import { getGrievances } from "@/apicalls/citizen";
import { SubmissionForm } from "./add";

function maskNumber(num: string | number): string {
  const str = String(num);

  if (str.length <= 4) return str; // Nothing to mask

  const start = str.slice(0, 2);
  const end = str.slice(-2);
  const masked = "*".repeat(str.length - 4);

  return `${start}${masked}${end}`;
}

export function Grievance() {
  const [data, setData] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [allData, setAllData] = useState<ConsumerDetail[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [refetch, setRefetch] = useState(false);

  // 1) Strongly-typed status
  type Status = "all" | "tagged" | "pending";

  // state
  const [statusFilter, setStatusFilter] = useState<Status>("all");

  const fetchData = useCallback(
    async (
      page: number = 1,
      limit: number = itemsPerPage,
      opts?: {
        searchValue?: string | null;
        status?: Status;
      }
    ) => {
      try {
        setIsLoading(true);

        const response = await getGrievances(page, limit, {
          ...opts,
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

  // const fetchAllData = useCallback(async () => {
  //   try {
  //     // const response = await getSurveyDataList(1, 1000); // Uncomment if needed
  //     if (allData) {
  //       setAllData(Array.isArray(allData) ? allData : []);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching all data for export:", err);
  //     setAllData(data);
  //   }
  // }, [allData, data]);

  const fetchAllData = useCallback(async () => {
    try {
      // Fetch a large number of records for export (adjust limit as needed)
      const response = await getGrievances(1, 10000);

      if (response?.data) {
        setAllData(response.data);
      } else {
        console.warn("No data returned for export");
        setAllData([]);
      }
    } catch (err) {
      console.error("Error fetching all data for export:", err);
      setAllData([]);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchAllData();
  }, [fetchData, refetch]);

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

  const handleSearch = async (value?: string) => {
    const q = (value ?? searchTerm).trim(); // use passed value or current searchTerm
    if (!q) {
      fetchData(1, itemsPerPage);
      return;
    }
    await fetchData(1, itemsPerPage, { searchValue: q });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchData(1, itemsPerPage);
  };

  const handleStatusFilterChange = (status: Status) => {
    setStatusFilter(status); // ✅ Correct state to update
    const opts = {
      searchValue: searchTerm ? searchTerm.trim() : null,
      status,
    };
    fetchData(1, itemsPerPage, opts);
  };

  const handleView = (id: string) => {
    router.push(`/services/consumer/${id}`);
  };

  //   const exportConfig: ExportConfig = useMemo(
  //   () => ({
  //     filename: "Survey_Report",
  //     sheetName: "Survey Details",
  //     includeTimestamp: true,
  //     data: allData.map((item) => ({
  //       id: item.id,
  //       // user_full_name: item.user_full_name,
  //       // created_at: formatExportDate(item.created_at),
  //       property_id: item?.integrated_property_id || "",
  //       owner_name: item?.integrated_owner_name || "",
  //       address: item?.address || "",
  //     })),
  //     columns: [
  //       { key: "id", label: "Survey ID" },
  //       { key: "user_full_name", label: "Survyor Name" },
  //       { key: "created_at", label: "Created At" },
  //       { key: "property_id", label: "Property ID" },
  //       { key: "owner_name", label: "Owner Name" },
  //       { key: "address", label: "Address" },
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
    <div className="bg-background rounded-lg">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-2xl font-bold">Grievance</h2>
      </div>

      {/* Top Controls */}
      <div className="flex flex-col gap-4 p-4">
        {/* Second Row: Search + Date Range + Status buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 flex-wrap">
          {/* Left side: Search + Date Range */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            {/* Search Bar */}
            {/* <div className="relative flex-1 max-w-md">
              <input
                placeholder="Search By Property Id"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setSearchTerm(value);

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
            </div> */}
          </div>

          {/* <ExportDropdown
            config={{
              filename: "Consumer_Report",
              sheetName: "Consumer Details",
              includeTimestamp: true,
              data: allData.map((item) => ({
                property_id: item.integrated_property_id || "-",
                owner_name: item.integrated_owner_name || "-",
                address: item.address || "-",
                mobile: item.mobile || "-",
                type: item.type || "-",
                sub_type: item.sub_type || "-",
                tagged: item.is_tagged ? "True" : "False",
              })),
              columns: [
                { key: "property_id", label: "Property ID" },
                { key: "owner_name", label: "Owner Name" },
                { key: "address", label: "Address" },
                { key: "mobile", label: "Mobile" },
                { key: "type", label: "Type" },
                { key: "sub_type", label: "Sub-Type" },
                { key: "tagged", label: "Tagged" },
              ],
            }}
          /> */}
          <SubmissionForm setRefetch={setRefetch} />
        </div>
      </div>

      {/* Table with horizontal scroll */}
      <div className="w-full overflow-x-auto rounded-b-lg">
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow className="border-b bg-primary hover:bg-primary">
              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                SR.NO.
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                Mobile
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                Email
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                Remark
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-4 text-gray-500"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-4 text-gray-500"
                >
                  No grievance data found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors border-b  cursor-pointer"
                >
                  <TableCell className="px-4 py-3 text-xs font-mono">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs">
                    {item?.mobile || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs">
                    {item?.email || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs truncate max-w-[200px]">
                    {item?.remark || "-"}
                  </TableCell>
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
