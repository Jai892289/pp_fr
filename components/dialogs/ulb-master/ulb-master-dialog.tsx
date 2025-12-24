// components/dialogs/ulb-master/ulb-master-dialog.tsx
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
import { createUlbMaster, updateUlbMaster } from "@/apicalls/panelSetup";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ULBMasterDialogProps } from "@/types/ulb";
import Image from "next/image";

export function ULBMasterDialog({
  open,
  onOpenChange,
  ulbMaster,
  onSuccess,
  ulbType,
}: ULBMasterDialogProps) {
  const [formData, setFormData] = useState({
    ulbTypeId: "",
    ulbName: "",
    ulbNameHindi: "",
    ulbAddress: "",
    ulbNigamTollFreeNo: "",
    ulbReceiptTollfreeNo: "",
    ulbBankName: "",
    ulbAccountno: "",
    ulbIFSCcode: "",
    ulbAgencyFullName: "",
    ulbDomainName: "",
    ulbGST: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const isEditMode = !!ulbMaster;

  // reset form when modal opens
  useEffect(() => {
    if (open) {
      if (ulbMaster) {
        setFormData({
          ulbTypeId: ulbMaster?.ulb_type_id?.toString() || "",
          ulbName: ulbMaster.name || "",
          ulbNameHindi: ulbMaster.name_hindi || "",
          ulbAddress: ulbMaster.address || "",
          ulbNigamTollFreeNo: ulbMaster.nigamtollfreeno || "",
          ulbReceiptTollfreeNo: ulbMaster.receipttollfreeno || "",
          ulbBankName: ulbMaster.bankname || "",
          ulbAccountno: ulbMaster.accountno || "",
          ulbIFSCcode: ulbMaster.ifsccode || "",
          ulbAgencyFullName: ulbMaster.agencyfullname || "",
          ulbDomainName: ulbMaster.domainname || "",
          ulbGST: ulbMaster.gstno || "",
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          ulbTypeId: prev.ulbTypeId || "",
          ulbName: "",
          ulbNameHindi: "",
          ulbAddress: "",
          ulbNigamTollFreeNo: "",
          ulbReceiptTollfreeNo: "",
          ulbBankName: "",
          ulbAccountno: "",
          ulbIFSCcode: "",
          ulbAgencyFullName: "",
          ulbDomainName: "",
          ulbGST: "",
        }));
      }
      setError(null);
    }
  }, [open, ulbMaster]);

  // pre-select first ulbType if none chosen
  useEffect(() => {
    if (!formData.ulbTypeId && ulbType && ulbType.length > 0) {
      setFormData((prev) => ({
        ...prev,
        ulbTypeId: ulbType[0].id.toString(),
      }));
    }
  }, [ulbType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ulbName.trim()) {
      setError("ULB name is required");
      return;
    }
    if (!formData.ulbTypeId) {
      setError("ULB type is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    // ✅ ensure ulbTypeId is number before API
    const payload = {
      ...formData,
      ulbTypeId: Number(formData.ulbTypeId),
    };

    try {
      if (isEditMode && ulbMaster) {
        await updateUlbMaster(ulbMaster.id, payload);
        toast({
          title: "Success",
          description: "ULB updated successfully",
          variant: "success",
        });
      } else {
        await createUlbMaster(payload);
        toast({
          title: "Success",
          description: "ULB created successfully",
          variant: "success",
        });
      }
      onSuccess();
      onOpenChange(false);
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
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto p-6 ml-25 mt-2">
        {/* <DialogHeader className="border-b pb-2 flex items-center flex-row">
          <Image
            src="/add.png"
            alt="ADD Icon"
            className="mr-4"
            width={40}
            height={40}
          />
          <DialogTitle className="text-xl font-bold text-gray-800 text-center flex-1 mr-10">
            {isEditMode ? "Edit ULB" : "Add New ULB"}
          </DialogTitle>
        </DialogHeader> */}
        <DialogHeader className="text-center space-y-6 pb-2 mb-6">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold  text-center">
              {isEditMode ? 'Edit ULB' : 'Create New ULB'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 text-center">
              {isEditMode
                ? 'Update the ulb details'
                : 'Define a new ulb'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-6 space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ulbTypeId">ULB Type</Label>
                <select
                  id="ulbTypeId"
                  value={formData.ulbTypeId}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full border rounded-md p-2 bg-background hover:border-[#7367F0] focus:border-[#7367F0]"
                >
                  <option value="">Select Type</option>
                  {ulbType?.length ? (
                    ulbType.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No ULB types available
                    </option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ulbName">ULB Name</Label>
                <Input
                  id="ulbName"
                  value={formData.ulbName}
                  onChange={handleChange}
                  placeholder="Enter ULB Name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ulbNameHindi">ULB Name (Hindi)</Label>
                <Input
                  id="ulbNameHindi"
                  value={formData.ulbNameHindi}
                  onChange={handleChange}
                  placeholder="Enter ULB Name in Hindi"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ulbAddress">ULB Address</Label>
                <Input
                  id="ulbAddress"
                  value={formData.ulbAddress}
                  onChange={handleChange}
                  placeholder="Enter ULB Address"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ulbNigamTollFreeNo">Nigam Toll Free No</Label>
                <Input
                  id="ulbNigamTollFreeNo"
                  value={formData.ulbNigamTollFreeNo}
                  onChange={handleChange}
                  placeholder="Enter Nigam Toll Free No"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ulbReceiptTollfreeNo">
                  Receipt Tollfree No
                </Label>
                <Input
                  id="ulbReceiptTollfreeNo"
                  value={formData.ulbReceiptTollfreeNo}
                  onChange={handleChange}
                  placeholder="Enter Receipt Tollfree No"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ulbBankName">Bank Name</Label>
                <Input
                  id="ulbBankName"
                  value={formData.ulbBankName}
                  onChange={handleChange}
                  placeholder="Enter Bank Name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ulbAccountno">Account Number</Label>
                <Input
                  id="ulbAccountno"
                  value={formData.ulbAccountno}
                  onChange={handleChange}
                  placeholder="Enter Account Number"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ulbIFSCcode">IFSC Code</Label>
                <Input
                  id="ulbIFSCcode"
                  value={formData.ulbIFSCcode}
                  onChange={handleChange}
                  placeholder="Enter IFSC Code"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ulbAgencyFullName">Agency Full Name</Label>
                <Input
                  id="ulbAgencyFullName"
                  value={formData.ulbAgencyFullName}
                  onChange={handleChange}
                  placeholder="Enter Agency Full Name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ulbDomainName">Domain Name</Label>
                <Input
                  id="ulbDomainName"
                  value={formData.ulbDomainName}
                  onChange={handleChange}
                  placeholder="Enter Domain Name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ulbGST">GST Number</Label>
                <Input
                  id="ulbGST"
                  value={formData.ulbGST}
                  onChange={handleChange}
                  placeholder="Enter GST Number"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>

          <DialogFooter className="flex justify-end space-x-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="min-w-[100px] rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[100px] bg-[#7367F0] rounded-md hover:bg-[#7367F0]"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}