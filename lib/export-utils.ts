import * as XLSX from "xlsx"

// Types for export configuration
export interface ExportColumn {
  key: string
  label: string
  formatter?: (value: any) => string
}

export interface ExportConfig {
  filename: string
  columns: ExportColumn[]
  data: any[]
  sheetName?: string
  includeTimestamp?: boolean
}

// Utility function to format date consistently
export const formatExportDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    return "Invalid date"
  }
}

// Utility function to format status
export const formatExportStatus = (status: number): string => {
  return status === 1 ? "Active" : "Inactive"
}

// Generate filename with timestamp
const generateFilename = (baseFilename: string, includeTimestamp = true): string => {
  if (!includeTimestamp) return baseFilename

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
  const nameWithoutExt = baseFilename.replace(/\.[^/.]+$/, "")
  const extension = baseFilename.match(/\.[^/.]+$/)?.[0] || ""

  return `${nameWithoutExt}_${timestamp}${extension}`
}

// Transform data based on column configuration
const transformDataForExport = (data: any[], columns: ExportColumn[]): any[] => {
  return data.map((item, index) => {
    const transformedItem: any = {}

    // Add serial number
    transformedItem["Sr. No."] = index + 1

    columns.forEach((column) => {
      const value = item[column.key]
      transformedItem[column.label] = column.formatter ? column.formatter(value) : value
    })

    return transformedItem
  })
}

/**
 * Export data to CSV format
 * @param config Export configuration object
 */
export const exportToCSV = (config: ExportConfig): void => {
  try {
    const { filename, columns, data, includeTimestamp = true } = config

    if (!data || data.length === 0) {
      throw new Error("No data available for export")
    }

    // Transform data
    const transformedData = transformDataForExport(data, columns)

    // Convert to CSV
    const headers = ["Sr. No.", ...columns.map((col) => col.label)]
    const csvContent = [
      headers.join(","),
      ...transformedData.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            // Escape commas and quotes in CSV
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", generateFilename(filename.replace(/\.[^/.]+$/, ".csv"), includeTimestamp))
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error("CSV Export Error:", error)
    throw new Error(`Failed to export CSV: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Export data to Excel format
 * @param config Export configuration object
 */
export const exportToExcel = (config: ExportConfig): void => {
  try {
    const { filename, columns, data, sheetName = "Sheet1", includeTimestamp = true } = config

    if (!data || data.length === 0) {
      throw new Error("No data available for export")
    }

    // Transform data
    const transformedData = transformDataForExport(data, columns)

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(transformedData)

    // Set column widths for better formatting
    const columnWidths = ["Sr. No.", ...columns.map((col) => col.label)].map((header) => {
      const maxLength = Math.max(header.length, ...transformedData.map((row) => String(row[header] || "").length))
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) }
    })

    worksheet["!cols"] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generate and download file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", generateFilename(filename.replace(/\.[^/.]+$/, ".xlsx"), includeTimestamp))
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error("Excel Export Error:", error)
    throw new Error(`Failed to export Excel: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Generic export function that handles both CSV and Excel
 * @param format Export format ('csv' | 'excel')
 * @param config Export configuration object
 */
export const exportData = (format: "csv" | "excel", config: ExportConfig): void => {
  try {
    if (format === "csv") {
      exportToCSV(config)
    } else if (format === "excel") {
      exportToExcel(config)
    } else {
      throw new Error("Unsupported export format")
    }
  } catch (error) {
    console.error("Export Error:", error)
    throw error
  }
}
