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
import { createModuleTypeData, updateModuleTypeData, getUlbMasterData } from '@/apicalls/panelSetup';
import { ModuleDialogProps } from '@/types/modulepanel';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';

export function ModuleDialog({ open, onOpenChange, module, onSuccess }: ModuleDialogProps) {
  const [formData, setFormData] = useState({
    moduleName: '', 
    ulb_id: '',
  });
  
  // Set default ULB ID if needed
  useEffect(() => {
    if (ulbs.length > 0 && !formData.ulb_id) {
      setFormData(prev => ({
        ...prev,
        ulb_id: ulbs[0].id.toString() 
      }));
    }
  }, []);

  const [ulbs, setUlbs] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUlbs, setIsLoadingUlbs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  

  const isEditMode = !!module;

  useEffect(() => {
    const fetchUlbs = async () => {
      try {
        setIsLoadingUlbs(true);
        const response = await getUlbMasterData();
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
      if (module) {
        setFormData({
          moduleName: module.name,
          ulb_id: module.ulb_id?.toString() || '',
        });
      } else {
        setFormData({
          moduleName: '',
          ulb_id: '',
        });
      }
      setError(null);
    }
  }, [open, module, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.moduleName.trim()) {
      setError('Module name is required');
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
        moduleName: formData.moduleName
      };
      
      console.log("Sending payload:", payload);

      if (isEditMode && module) {
        await updateModuleTypeData(module.id, payload);
        toast({
          title: "Success",
          description: "Module updated successfully",
          variant: "success",
        });
      } else {
        await createModuleTypeData(payload);
        toast({
          title: "Success",
          description: "Module created successfully",
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
            {isEditMode ? 'Edit Permission' : 'Add New Permission'}
            </DialogTitle>
            <DialogDescription className="text-[16px] text-gray-600 dark:text-gray-400 text-left max-w-sm leading-relaxed">
            {isEditMode
              ? 'Update the permission details below.'
              : 'Fill in the details to create new permissions.'}</DialogDescription>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, ulb_id: e.target.value }))}
                  disabled={isLoading || isLoadingUlbs}
                  className={`w-full bg-background h-14 rounded-md border text-start font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                    error && !formData.ulb_id ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
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
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </div>
            </div>

            {/* Permission Names Input */}
            <div className="space-y-2">
              <Label htmlFor="permission_names" className="text-md font-medium  pl-1 text-left block">
                Module Name
              </Label>
              <div className="relative">
                <Input
                  id="moduleName"
                  name="moduleName"
                  value={formData.moduleName}
                  onChange={handleChange}
                  placeholder="Enter module name"
                  disabled={isLoading}
                  className={`w-full bg-background placeholder:text-gray-400 h-14 rounded-md border text-start font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                    error && !formData.moduleName ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
                  }`}
                />
                {error && !formData.moduleName && (
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
                'Update Permission'
              ) : (
                'Create Permission'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


