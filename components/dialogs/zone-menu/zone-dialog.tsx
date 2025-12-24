'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { createZoneData, updateZoneData, getUlbMasterData, updatePermission } from '@/apicalls/panelSetup';
import { ZoneDialogProps } from '@/types/zonepanel';
import { Loader2 } from 'lucide-react';

export function ZoneDialog({ open, onOpenChange, zone, onSuccess }: ZoneDialogProps) {
  const [formData, setFormData] = useState({
    zoneListName: '',
    zoneCode: '',
    ulb_id: 3,
  });
  

  const [ulbs, setUlbs] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUlbs, setIsLoadingUlbs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  

  const isEditMode = !!zone;

  

  useEffect(() => {
    const fetchUlbs = async () => {
      try {
        setIsLoadingUlbs(true);
        const response = await getUlbMasterData(1, 100);
        if (response?.data && response?.pagination) {
          setUlbs(response.data || []);}
      } catch (error) {
        console.error('Error fetching ULBs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load ULBs',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingUlbs(false);
      }
    };

    if (open) {
      fetchUlbs();
      if (zone) {
        setFormData({
          zoneListName: zone.name,
          zoneCode: zone.zonecode,
          ulb_id: zone.ulb_id,
        });
      } else {
        setFormData({
          zoneListName: '',
          zoneCode: '',
          ulb_id: 0,
        });
      }
      setError(null);
    }
  }, [open, zone, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.zoneListName.trim()) {
      setError('Zone name is required');
      return;
    }
    
    if (!formData.ulb_id) {
      setError('Please select a ULB');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
   

      const payload = {
        ulb_id: formData.ulb_id ? Number(formData.ulb_id) : null,
        zoneListName: formData.zoneListName,
        zoneCode: formData.zoneCode,
      };
      
      console.log("Sending payload:", payload);

      if (isEditMode && zone) {
        await updateZoneData(zone.id, payload);
        toast({
          title: "Success",
          description: "Zone updated successfully",
          variant: "success",
        });
      } else {
        await createZoneData(payload);
        toast({
          title: "Success",
          description: "Zone created successfully",
          variant: "success",
        });
      }

      onSuccess();
      onOpenChange(false);
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
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
            <DialogTitle className="text-[20px] font-bold  text-left leading-tight">
            {isEditMode ? 'Edit Zone' : 'Add New Zone'}
            </DialogTitle>
            <DialogDescription className="text-[16px] text-gray-600 dark:text-gray-400 text-left max-w-sm leading-relaxed">
            {isEditMode
              ? 'Update the zone details below.'
              : 'Fill in the details to create new zone.'}</DialogDescription>
          </div>
        </DialogHeader>


        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* ULB Selector */}
            <div className="space-y-2">
              <Label htmlFor="ulb_id" className="text-md font-medium  pl-1 text-left block">
                Select ULB
              </Label>
              <div className="relative">
                <select
                  id="ulb_id"
                  name="ulb_id"
                  value={formData.ulb_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, ulb_id: Number(e.target.value) }))}
                  disabled={isLoading || isLoadingUlbs}
                  className={`w-full bg-background h-14 rounded-md border text-start font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                    error ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
                  } pl-4 pr-10 py-2`}
                >
                  <option value="">Select ULB</option>
                  {ulbs.map((ulb) => (
                    <option key={ulb.id} value={ulb.id}>
                      {ulb.name}
                    </option>
                  ))}
                </select>
                {error && !formData.ulb_id && (
                  <p className="text-red-500 text-sm mt-1">Please select a ULB</p>
                )}
              </div>
            </div>

            {/*  Names Input */}
            <div className="space-y-2">
              <Label htmlFor="zoneListName" className="text-md font-medium  pl-1 text-left block">
               Name
              </Label>
              <div className="relative">
                <Input
                  id="zoneListName"
                  name="zoneListName"
                  value={formData.zoneListName}
                  onChange={handleChange}
                  placeholder="Enter zone name"
                  disabled={isLoading}
                  className={`w-full bg-background placeholder:text-gray-400 h-14 rounded-md border text-start font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                    error && !formData.zoneListName.trim() ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
                  }`}
                />
                {error && !formData.zoneListName.trim() && (
                  <p className="text-red-500 text-sm mt-1">Zone name is required</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zoneCode" className="text-md font-medium  pl-1 text-left block">
              Zone Code
              </Label>
              <div className="relative">
                <Input
                  id="zoneCode"
                  name="zoneCode"
                  value={formData.zoneCode}
                  onChange={handleChange}
                  placeholder="Enter zone code"
                  disabled={isLoading}
                  className={`w-full bg-background placeholder:text-gray-400 h-14 rounded-md border text-start font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                    error && !formData.zoneCode.trim() ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
                  }`}
                />
                {error && !formData.zoneCode.trim() && (
                  <p className="text-red-500 text-sm mt-1">Zone code is required</p>
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
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

