'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
import { createWardData, updateWardData, getWardById, getAllZones } from '@/apicalls/panelSetup';
import { WardDialogProps } from '@/types/wardpanel';
import { Loader2 } from 'lucide-react';

export function WardDialog({ open, onOpenChange, ward, onSuccess }: WardDialogProps) {
  const [formData, setFormData] = useState({
    zoneCircleId: '',
    wardNo: '',
    wardName: '',
    wardCode: '',
    wardArea: ''
  });
  
  const [zones, setZones] = useState<Array<{ id: number; name: string; zonecode: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [isLoadingWard, setIsLoadingWard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const isEditMode = !!ward;

  // Fetch ward data when in edit mode
  useEffect(() => {
    const fetchWardData = async () => {
      if (isEditMode && ward && open) {
        try {
          setIsLoadingWard(true);
          const wardResponse = await getWardById(ward.id);
          console.log("wardResponse", wardResponse);
          if (wardResponse) {
            const wardData = wardResponse;
            setFormData({
              zoneCircleId: wardData.zone_circle_id?.toString() || '',
              wardNo: wardData.ward_no || '',
              wardName: wardData.name || '',
              wardCode: wardData.ward_code || '',
              wardArea: wardData.area || ''
            });
          }
        } catch (error) {
          console.error('Error fetching ward data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load ward details',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingWard(false);
        }
      }
    };

    fetchWardData();
  }, [isEditMode, ward, open, toast]);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        setIsLoadingZones(true);
        const zoneResponse = await getAllZones(1, 100);
        if (zoneResponse?.data) {
          setZones(zoneResponse.data || []);
        }
        
        // Reset form if not in edit mode
        if (!isEditMode) {
          setFormData({
            zoneCircleId: '',
            wardNo: '',
            wardName: '',
            wardCode: '',
            wardArea: ''
          });
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching zones:', error);
        toast({
          title: 'Error',
          description: 'Failed to load zones',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingZones(false);
      }
    };

    if (open) {
      fetchZones();
    }
  }, [open, isEditMode, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.zoneCircleId) {
      setError('Please select a zone');
      return;
    }
    
    if (!formData.wardNo.trim()) {
      setError('Ward number is required');
      return;
    }
    
    if (!formData.wardName.trim()) {
      setError('Ward name is required');
      return;
    }
    
    if (!formData.wardCode.trim()) {
      setError('Ward code is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        zoneCircleId: Number(formData.zoneCircleId),
        wardNo: formData.wardNo,
        wardName: formData.wardName,
        wardCode: formData.wardCode,
        wardArea: formData.wardArea
      };
      
      if (isEditMode && ward) {
        await updateWardData(ward.id, payload);
        toast({
          title: "Success",
          description: "Ward updated successfully",
          variant: "success",
        });
      } else {
        await createWardData(payload);
        toast({
          title: "Success",
          description: "Ward created successfully",
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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg mx-auto rounded-2xl shadow-2xl border-0 bg-background backdrop-blur-sm">
        <DialogHeader className="text-center space-y-6 pb-2 mb-2">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold  text-center">
              {isEditMode ? 'Edit Ward' : 'Create New Ward'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 text-center">
              {isEditMode
                ? 'Update the ward details'
                : 'Define a new ward with specific details'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isLoadingWard && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">Loading ward details...</span>
            </div>
          )}
          
          {!isLoadingWard && (
            <>
              <div className="space-y-4">
                {/* Zone Selector */}
                <div className="space-y-2">
                  <Label htmlFor="zoneCircleId" className="text-sm font-medium  ">
                    Zone/Circle
                  </Label>
                  <div className="relative">
                    <select
                      id="zoneCircleId"
                      name="zoneCircleId"
                      value={formData.zoneCircleId}
                      onChange={handleSelectChange}
                      disabled={isLoading || isLoadingZones}
                      className={`w-full p-3 bg-background rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        error && !formData.zoneCircleId ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Zone/Circle</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} ({zone.zonecode})
                        </option>
                      ))}
                    </select>
                    {error && !formData.zoneCircleId && (
                      <p className="text-sm text-red-500 mt-1">Please select a zone</p>
                    )}
                  </div>
                </div>

                {/* Ward Number Input */}
                <div className="space-y-2">
                  <Label htmlFor="wardNo" className="text-sm font-medium  ">
                    Ward Number
                  </Label>
                  <div className="relative">
                    <Input
                      id="wardNo"
                      name="wardNo"
                      value={formData.wardNo}
                      onChange={handleChange}
                      placeholder="Enter ward number"
                      disabled={isLoading}
                      className={`w-full p-3 bg-gray-50 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        error && !formData.wardNo ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {error && !formData.wardNo && (
                      <p className="text-sm text-red-500 mt-1">Ward number is required</p>
                    )}
                  </div>
                </div>

                {/* Ward Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="wardName" className="text-sm font-medium  ">
                    Ward Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="wardName"
                      name="wardName"
                      value={formData.wardName}
                      onChange={handleChange}
                      placeholder="Enter ward name"
                      disabled={isLoading}
                      className={`w-full p-3 bg-background rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        error && !formData.wardName ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {error && !formData.wardName && (
                      <p className="text-sm text-red-500 mt-1">Ward name is required</p>
                    )}
                  </div>
                </div>

                {/* Ward Code Input */}
                <div className="space-y-2">
                  <Label htmlFor="wardCode" className="text-sm font-medium  ">
                    Ward Code
                  </Label>
                  <div className="relative">
                    <Input
                      id="wardCode"
                      name="wardCode"
                      value={formData.wardCode}
                      onChange={handleChange}
                      placeholder="Enter ward code"
                      disabled={isLoading}
                      className={`w-full p-3 bg-background rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        error && !formData.wardCode ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {error && !formData.wardCode && (
                      <p className="text-sm text-red-500 mt-1">Ward code is required</p>
                    )}
                  </div>
                </div>

                {/* Ward Area Input */}
                <div className="space-y-2">
                  <Label htmlFor="wardArea" className="text-sm font-medium  ">
                    Ward Area (Optional)
                  </Label>
                  <div className="relative">
                    <Input
                      id="wardArea"
                      name="wardArea"
                      value={formData.wardArea}
                      onChange={handleChange}
                      placeholder="Enter ward area"
                      disabled={isLoading}
                      className="w-full p-3 bg-background rounded-lg border border-gray-300 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {error && typeof error === 'string' && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 h-11 rounded-lg border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 h-11 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : isEditMode ? (
                    'Update Ward'
                  ) : (
                    'Create Ward'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}