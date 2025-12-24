"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createUlbType, updateUlbType } from "@/apicalls/panelSetup"
import { Loader2, PlusCircle, Edit3, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ULBType {
  id: number
  name: string
  recstatus: number
}

interface ULBTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ulbType?: ULBType | null
  onSuccess: () => void
}

export function ULBTypeDialog({ open, onOpenChange, ulbType, onSuccess }: ULBTypeDialogProps) {
  const [ulbTypeName, setUlbTypeName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const isEditMode = !!ulbType

  useEffect(() => {
    if (open) {
      if (ulbType) {
        setUlbTypeName(ulbType.name)
      } else {
        setUlbTypeName("")
      }
      setError(null)
    }
  }, [open, ulbType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!ulbTypeName.trim()) {
      setError("ULB Type name is required")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (isEditMode && ulbType) {
        await updateUlbType(ulbType.id, ulbTypeName.trim())
        toast({
          title: "Success",
          description: "ULB Type updated successfully",
        })
      } else {
        await createUlbType(ulbTypeName.trim())
        toast({
          title: "Success",
          description: "ULB Type created successfully",
        })
      }

      onSuccess()
      onOpenChange(false)
      setUlbTypeName("")
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      const errorMessage = error?.response?.data?.message || error?.message || "An error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
      setUlbTypeName("")
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-auto rounded-2xl shadow-2xl border-0 bg-background backdrop-blur-sm ">
        <DialogHeader className="text-center space-y-6 pb-2  mb-2">
          {/* <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 shadow-lg">
            {isEditMode ? (
              <Edit3 className="h-7 w-7 text-blue-600" />
            ) : (
              <PlusCircle className="h-7 w-7 text-blue-600" />
            )}
          </div> */}

          <div className="space-y-1">
            <DialogTitle className="text-[20px] font-bold  text-left leading-tight">
              {isEditMode ? "Edit ULB Type" : "Add New ULB Type"}
            </DialogTitle>
            <DialogDescription className="text-[16px] text-gray-600 dark:text-gray-400 text-left max-w-sm leading-relaxed">
              {isEditMode ? "Update the ULB type information below." : "Enter the details for the new ULB type."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 ">
            <div className="space-y-2">
              <Label htmlFor="ulbTypeName" className="text-md font-medium  pl-1 text-left block">
                ULB Type Name
              </Label>
              <div className="relative">
                <Input
                  id="ulbTypeName"
                  value={ulbTypeName}
                  onChange={(e) => setUlbTypeName(e.target.value)}
                  placeholder="Enter ULB type name"
                  disabled={isLoading}
                  className={`w-full bg-background placeholder:text-gray-400 h-14 rounded-md border text-start font-normal transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                    error ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
                  }`}
                />
                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600 font-medium text-center">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col space-y-3 pt-2">
            <div className="flex gap-3 w-full">
            <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 h-12 rounded-sm border-2 border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium bg-transparent cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-12 rounded-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl bg-gradient-to-r from-[#1BB318] to-[#1BB318] hover:from-[#1BB318] hover:to-[#1BB318] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <>
                        Update
                      </>
                    ) : (
                      <>
                        Create
                      </>
                    )}
                  </>
                )}
              </Button>
              
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
