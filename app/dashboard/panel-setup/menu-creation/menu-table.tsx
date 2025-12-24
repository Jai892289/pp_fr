"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PaginationComponent } from "@/components/pagination"
import { Menu, TreeMenuItem } from '@/types/menu';
import { MenuDialog } from '@/components/dialogs/menu-creation/menu-dialog';
import { ToggleConfirmationDialog } from '@/components/dialogs/menu-creation/toggle-dialog';
import { toggleMenu, getAllMenu } from '@/apicalls/panelSetup';
import { Button } from "@/components/ui/button"
import { Edit3, Search, RefreshCcw, ChevronRight, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { ExportDropdown } from "@/components/ui/export-dropdown"
import { formatExportDate, formatExportStatus, type ExportConfig } from "@/lib/export-utils"
import { MenuTreeManager } from '@/lib/menu-tree';

// Menu Row Component
interface MenuRowProps {
  menu: TreeMenuItem;
  index: number;
  currentPage: number;
  itemsPerPage: number;
  onEdit: (menu: Menu) => void;
  onToggle: (menu: Menu) => void;
  onToggleExpansion: (menuId: number) => void;
  toggleLoading: number | null;
}

function MenuRow({
  menu,
  index,
  currentPage,
  itemsPerPage,
  onEdit,
  onToggle,
  onToggleExpansion,
  toggleLoading
}: MenuRowProps) {
  const hasChildren = menu.children && menu.children.length > 0;
  const indentLevel = menu.level || 0;

  return (
    <TableRow className="border-b transition-colors">
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
        <div className="flex items-center gap-2">
          {/* Hierarchical Indentation */}
          <div style={{ marginLeft: `${indentLevel * 20}px` }} className="flex items-center gap-2">
            {/* Expansion Toggle for Parent Menus */}
            {hasChildren && (
              <button
                onClick={() => onToggleExpansion(menu.id)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {menu.isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            )}
            
            {/* Menu Label with Level Indicator */}
            <div className="flex items-center gap-2">
              {indentLevel > 0 && (
                <div className="flex items-center">
                  {Array.from({ length: indentLevel }, (_, i) => (
                    <div key={i} className="w-3 border-l border-gray-200 ml-1" />
                  ))}
                </div>
              )}
              
              <span className={`text-sm font-medium ${indentLevel > 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white font-semibold'}`}>
                {menu.menuLabel || menu.label}
              </span>
              
              {/* Level Badge */}
              {indentLevel > 0 && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  L{indentLevel}
                </span>
              )}
              
              {/* Children Count Badge */}
              {hasChildren && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  {menu.children.length} child{menu.children.length !== 1 ? 'ren' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="px-4 py-3">
        <span className="text-sm font-medium font-mono bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
          {menu.menuPath || menu.path}
        </span>
      </TableCell>

      <TableCell className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {menu.menuParentId !== undefined ? menu.menuParentId : menu.parentId || 'Root'}
          </span>
          {indentLevel > 0 && (
            <span className="text-xs text-gray-500">
              (Level {indentLevel})
            </span>
          )}
        </div>
      </TableCell>

      <TableCell className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">{menu.ulb_id}</span>
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
            Order: {menu.order}
          </span>
        </div>
      </TableCell>

      <TableCell className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${
            menu.recstatus === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {menu.recstatus === 1 ? "Active" : "Inactive"}
        </span>
      </TableCell>

      <TableCell className="px-4 py-3">
        <div className="flex items-center justify-end gap-8">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(menu)}
              className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900 cursor-pointer"
            >
              <Edit3 className="h-4 w-4 text-green-600" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={menu.recstatus === 1}
              onCheckedChange={() => onToggle(menu)}
              disabled={toggleLoading === menu.id}
              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300 cursor-pointer"
            />
            {toggleLoading === menu.id && (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Main Menu Table Component
export function MenuTable() {
  const [data, setData] = useState<Menu[]>([])
  const [treeData, setTreeData] = useState<TreeMenuItem[]>([])
  const [displayData, setDisplayData] = useState<TreeMenuItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [allData, setAllData] = useState<Menu[]>([])
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggleLoading, setToggleLoading] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const { toast } = useToast()

  // Build tree structure when data changes
  useEffect(() => {
    if (data.length > 0) {
      const tree = MenuTreeManager.buildMenuTree(data);
      setTreeData(tree);
      
      // Flatten for display
      const flattened = MenuTreeManager.flattenTreeForDisplay(tree);
      setDisplayData(flattened);
    }
  }, [data]);

  const fetchAllData = useCallback(async () => {
    try {
      const response = await getAllMenu(1, 1000) 

      if (response && response.data.data) {
        const responseData = response.data.data.data;
        setAllData(responseData || []);
      }
    } catch (err) {
      console.error("Error fetching all data for export:", err)
      setAllData(data)
    }
  }, [data])

  const fetchData = useCallback(async (page: number = 1, limit: number = itemsPerPage) => {
    try {
      setIsLoading(true);
      const response = await getAllMenu(page, limit);

      console.log("API Menu Response:", response);
      
      if (response && response.data.data) {
        const responseData = response.data.data.data;
        
        setData(responseData || []);
        setTotalItems(responseData.pagination?.totalCount || 0);
        setTotalPages(responseData.pagination?.totalPages || 0);
        setCurrentPage(responseData.pagination?.page || 1);
        setItemsPerPage(responseData.pagination?.limit || 80);
      } else {
        throw new Error("Invalid response format: Missing data property");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]);

  console.log("Menu Data", data)

  useEffect(() => {
    fetchData();
    fetchAllData();
  }, [fetchData]);

  // Handle expansion toggle
  const handleToggleExpansion = (menuId: number) => {
    const updatedTree = MenuTreeManager.toggleExpansion(treeData, menuId);
    setTreeData(updatedTree);
    
    const flattened = MenuTreeManager.flattenTreeForDisplay(updatedTree);
    setDisplayData(flattened);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchData(page, itemsPerPage)
  }

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    fetchData(1, newItemsPerPage)
  }

  // Handle edit menu
  const handleEdit = (menu: Menu) => {
    setSelectedMenu(menu)
    setIsEditDialogOpen(true)
  }

  // Handle toggle menu status
  const handleToggle = (menu: Menu) => {
    setSelectedMenu(menu)
    setToggleError(null)
    setIsToggleDialogOpen(true)
  }

  // Handle toggle confirmation
  const handleToggleConfirm = async () => {
    if (!selectedMenu) return

    try {
      await toggleMenu(selectedMenu.id)
      await fetchData(currentPage, itemsPerPage)
      const action = selectedMenu.recstatus === 1 ? "deactivated" : "activated"
      toast({
        title: "Success",
        description: `Menu ${action} successfully`,
        variant: "success",
      })
      setIsToggleDialogOpen(false)
      setSelectedMenu(null)
      setToggleError(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to toggle menu status"
      setToggleError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const handleAddSuccess = async () => {
    setIsAddDialogOpen(false);  
    await fetchData(currentPage, itemsPerPage); 
    await fetchAllData();       
  };
  
  const handleFormSuccess = async () => {
    setIsEditDialogOpen(false); 
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
      })
    } catch (error) {
      console.error("Date formatting error:", error)
      return "Invalid date"
    }
  }

  const filteredMenuData = displayData.filter((menu) => {
    const matchesSearch = (menu.label || menu.menuLabel || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const exportConfig: ExportConfig = useMemo(
    () => ({
      filename: "Menu_Hierarchy_Report",
      data: allData,
      columns: [
        { key: "label", label: "Menu Name" },
        { key: "path", label: "Path" },
        { key: "parentId", label: "Parent ID" },
        { key: "order", label: "Order" },
        { key: "recstatus", label: "Status", formatter: formatExportStatus },
        { key: "created_at", label: "Created Date", formatter: formatExportDate },
      ],
      sheetName: "MenuHierarchy",
      includeTimestamp: true,
    }),
    [allData],
  )

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
    <>
      <div className="bg-background rounded-lg">
        {/* Header Controls */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold pl-2">Menu Hierarchy</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {displayData.length} items in hierarchy
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportDropdown config={exportConfig} />
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
              className="h-10 px-6 text-xs bg-primary hover:bg-primary/80 font-medium cursor-pointer"
            >
              + Add New Menu
            </Button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search menus in hierarchy..."
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
              size="sm"
              className="h-7 px-3 text-xs rounded-sm bg-transparent cursor-pointer"
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-primary hover:bg-primary">
                <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                  ORDER
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                  MENU HIERARCHY
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                  PATH
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                  PARENT INFO
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-gray-100 uppercase tracking-wide">
                  ULB & ORDER
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
              {isLoading || filteredMenuData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-20 text-center text-sm text-gray-500">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        Loading menu hierarchy...
                      </div>
                    ) : (
                      "No menus found in hierarchy."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMenuData.map((menu, index) => (
                  <MenuRow
                    key={menu.id}
                    menu={menu}
                    index={index}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onEdit={handleEdit}
                    onToggle={handleToggle}
                    onToggleExpansion={handleToggleExpansion}
                    toggleLoading={toggleLoading}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {/* <div className="flex items-center justify-center px-4 py-[3rem] border-t">
          

          <PaginationComponent
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div> */}
      </div>

      {/* Dialogs */}
      <MenuDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        menu={null}
        onSuccess={handleAddSuccess}
      />

      <MenuDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        menu={selectedMenu}
        onSuccess={handleFormSuccess}
      />

      <ToggleConfirmationDialog
        open={isToggleDialogOpen}
        onOpenChange={setIsToggleDialogOpen}
        title={`${selectedMenu?.recstatus === 1 ? "Deactivate" : "Activate"} Menu`}
        description={`Are you sure you want to ${selectedMenu?.recstatus === 1 ? "deactivate" : "activate"} "${selectedMenu?.menuLabel || selectedMenu?.label}"?`}
        onConfirm={handleToggleConfirm}
        currentStatus={selectedMenu?.recstatus || 0}
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
  )
}