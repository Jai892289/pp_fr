"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export function PaginationComponent({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getVisiblePages = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4 text-gray-600" />
      </Button>

      {getVisiblePages().map((page, index) => (
        <Button
          key={index}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
          className={`h-8 w-8 p-0 text-sm font-medium cursor-pointer ${
            page === currentPage
              ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600"
              : page === "..."
                ? "border-none hover:bg-transparent cursor-default text-gray-800 font-bold"
                : "border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900"
          }`}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
      >
        <ChevronRight className="h-4 w-4 text-gray-600" />
      </Button>
      </div>
    </div>
  )
}

  //  <div className="flex items-center gap-2">
  //           <div className="flex items-center">
  //             <Select
  //               value={itemsPerPage.toString()}
  //               onValueChange={(value) => handleItemsPerPageChange(Number(value))}
  //             >
  //               <SelectTrigger className="w-16 h-7 text-xs">
  //                 <SelectValue />
  //               </SelectTrigger>
  //               <SelectContent>
  //                 <SelectItem value="5">5</SelectItem>
  //                 <SelectItem value="10">10</SelectItem>
  //                 <SelectItem value="20">20</SelectItem>
  //                 <SelectItem value="50">50</SelectItem>
  //               </SelectContent>
  //             </Select>
  //           </div>
  //           <div className="text-xs text-gray-600 dark:text-gray-400">
  //             Showing 1 to {Math.min(itemsPerPage, totalItems)} of {totalItems} entries
  //           </div>
  //         </div>