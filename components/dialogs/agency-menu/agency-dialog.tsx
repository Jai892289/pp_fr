"use client";

import { useState, useEffect } from 'react';
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
import { createAgency, updateAgency, getUlbMasterData } from '@/apicalls/panelSetup';
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AgencyDialogProps } from '@/types/agency';


export function AgencyDialog({ open, onOpenChange, agency, onSuccess }: AgencyDialogProps) {
  const [formData, setFormData] = useState<{
    agencyName: string;
    ulb_id: string | number;
  }>({
    agencyName: '',
    ulb_id: '',
  });
  const [ulbs, setUlbs] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const isEditMode = !!agency;

  useEffect(() => {
    const fetchUlbs = async () => {
      try {
        setIsLoading(true);
        const ulbResponse = await getUlbMasterData();
        if (ulbResponse?.data) {
          setUlbs(ulbResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching ULBs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load ULBs',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };


    if (open) {
      fetchUlbs();
      if (agency) {
        setFormData({
          agencyName: agency.name || '',
          ulb_id: agency.ulb_id
        });
      } else {
        setFormData({
          agencyName: '',
          ulb_id: ''
        });
      }
      setError(null);
    }
  }, [open, agency]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agencyName) {
      setError('Agency name is required');
      return;
    }

    if (!formData.ulb_id) {
      setError('ULB ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const agencyData = {
        agencyName: formData.agencyName,
        ulb_id: Number(formData.ulb_id)
      };

      if (isEditMode && agency) {
        await updateAgency(agency.id, agencyData);
        toast({
          title: "Success",
          description: "Agency updated successfully",
          variant: "success",
        });
      } else {
        await createAgency(agencyData);
        toast({
          title: "Success",
          description: "Agency created successfully",
          variant: "success",
        });
      }

      onSuccess();
      onOpenChange(false);
      setFormData({
        agencyName: '',
        ulb_id: ''
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
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
      setFormData({
        agencyName: '',
        ulb_id: ''
      });
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
              {isEditMode ? 'Edit Agency' : 'Add New Agency'}
            </DialogTitle>
            <DialogDescription className="text-[16px] text-gray-600 text-left max-w-sm leading-relaxed">
              {isEditMode
                ? 'Update the agency information below.'
                : 'Enter the details for the new agency.'
              }</DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 ">
            <div className="space-y-2">
              <Label htmlFor="agencyName" className="text-md font-medium  pl-1 text-left block">
                Agency Name
              </Label>
              <div className="relative">
                <Input
                  id="agencyName"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleChange}
                  placeholder="Enter agency name"
                  disabled={isLoading}
                  className={`w-full bg-background placeholder:text-gray-400 h-14 rounded-md border text-start font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 mb-4 ${error && !formData.agencyName ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
                    }`}
                />
                {error && !formData.agencyName && (
                  <div className="mt-2 text-sm text-red-500">
                    {error}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ulb_id" className="text-sm font-medium ">
                ULB ID
              </Label>
              <div className="relative">
                <select
                  id="ulb_id"
                  name="ulb_id"
                  value={formData.ulb_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, ulb_id: e.target.value }))}
                  disabled={isLoading}
                  className={`w-full p-3 bg-background rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error && !formData.ulb_id ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                >
                  <option value="">Select ULB</option>
                  {ulbs.map((ulb) => (
                    <option key={ulb.id} value={ulb.id}>
                      {ulb.name}
                    </option>
                  ))}
                </select>
                {error && !formData.ulb_id && (
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
              className="flex-1 h-12 rounded-sm border-2 hover:bg-gray-50 transition-all duration-200 font-medium bg-transparent cursor-pointer"
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
                'Update Agency'
              ) : (
                'Create Agency'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
