"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react"
import { exportData, type ExportConfig } from "@/lib/export-utils"
import { useToast } from "@/hooks/use-toast"

interface ExportDropdownProps {
  config: ExportConfig
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "ghost"
}

export function ExportDropdown({ config, className = "", size = "lg", variant = "outline" }: ExportDropdownProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async (format: "csv" | "excel") => {
    try {
      setIsExporting(true)

      // Validate data
      if (!config.data || config.data.length === 0) {
        toast({
          title: "No Data",
          description: "No data available to export",
          variant: "destructive",
        })
        return
      }

      await exportData(format, config)

      toast({
        title: "Export Successful",
        description: `Data exported to ${format.toUpperCase()} successfully`,
        variant: "success",
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`h-10 px-8 text-xs font-medium cursor-pointer bg-transparent ${className}`}
          disabled={isExporting}
        >
          <Download className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">
          {isExporting ? "Exporting..." : "Export"}
          </span>
          <ChevronDown className="hidden sm:inline h-3 w-3 ml-1" />
         
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => handleExport("csv")} disabled={isExporting} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")} disabled={isExporting} className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
