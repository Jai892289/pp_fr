"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BankDialogProps } from "@/types/bank";
import { createBankList, updateBankName } from "@/apicalls/panelSetup";

export function BankDialog({ open, onOpenChange, bank, onSuccess }: BankDialogProps) {
  const [bankName, setBankName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const isEditMode = !!bank;

  useEffect(() => {
    if (open) {
      if (bank) {
        setBankName(bank.name);
      } else {
        setBankName("");
      }
      setError(null);
    }
  }, [open, bank]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankName.trim()) {
      setError("Bank name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isEditMode && bank) {
        console.log(bank.id,bankName);
        await updateBankName(bank.id, bankName.trim());
         toast({
          title: "Success",
          description: "ULB Type updated successfully",
          variant: "success",
        });
       
      } else {
        await createBankList({ bankName: bankName.trim() });
        toast({
          title: "Success",
          description: "Bank created successfully",
          variant: "success",
        });
      }

      onSuccess();
      onOpenChange(false);
      setBankName("");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "An error occurred";
      setError(errorMessage);
    
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setBankName("");
      setError(null);
    }
  };

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
            <DialogTitle className="text-[20px] font-bold text-primary text-left leading-tight">
            {isEditMode ? 'Edit Bank' : 'Add New Bank'}
            </DialogTitle>
            <DialogDescription className="text-[16px] text-gray-600 text-left max-w-sm leading-relaxed">
            {isEditMode
              ? 'Update the bank information below.'
              : 'Enter the details for the new bank.'
            }</DialogDescription>
            </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" >
        <div className="space-y-4 ">
        <div className="space-y-2">
              <Label htmlFor="bankName" className="text-md font-medium  pl-1 text-left block">
                Bank Name
              </Label>
        
              <div className="relative">
                <Input
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Enter Bank Name"
                  disabled={isLoading}
                  className={`w-full bg-background placeholder:text-gray-400 h-14 rounded-md border text-start font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 mb-4 ${
                    error && !bankName ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
                  }`}
                />
                {error && (
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col space-y-3 pt-2">
          <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 h-12 rounded-sm border-2 hover:bg-background transition-all duration-200 font-medium bg-transparent cursor-pointer"
              >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}
              className="flex-1 h-12 rounded-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl bg-gradient-to-r from-[#1BB318] to-[#1BB318] hover:from-[#1BB318] hover:to-[#1BB318] cursor-pointer"
              >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditMode ? (
                'Update Bank'
              ) : (
                'Create Bank'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}