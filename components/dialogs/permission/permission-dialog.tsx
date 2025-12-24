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
import { createPermission, updatePermission, getUlbMasterData } from '@/apicalls/panelSetup';
import { PermissionDialogProps } from '@/types/permission';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';

export function PermissionDialog({ open, onOpenChange, permission, onSuccess }: PermissionDialogProps) {
  const [formData, setFormData] = useState({
    permission_names: '', // comma-separated input
    ulb_id: '',
  });
  
  // Set default ULB ID if needed
  useEffect(() => {
    if (ulbs.length > 0 && !formData.ulb_id) {
      setFormData(prev => ({
        ...prev,
        ulb_id: ulbs[0].id.toString() // Set first ULB as default
      }));
    }
  }, []);

  const [ulbs, setUlbs] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUlbs, setIsLoadingUlbs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  

  const isEditMode = !!permission;

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
      if (permission) {
        setFormData({
          permission_names: Array.isArray(permission.name)
            ? permission.name.join(', ')
            : permission.name || '',
          ulb_id: permission.ulb_id?.toString() || '',
        });
      } else {
        setFormData({
          permission_names: '',
          ulb_id: '',
        });
      }
      setError(null);
    }
  }, [open, permission, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.permission_names.trim()) {
      setError('Permission names are required');
      return;
    }
    
    if (!formData.ulb_id) {
      setError('Please select a ULB');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const namesArray = formData.permission_names
        .split(',')
        .map(name => name.trim())
        .filter(Boolean);

      const payload = {
        ulb_id: formData.ulb_id ? Number(formData.ulb_id) : null,
        permission_names: namesArray
      };
      
      console.log("Sending payload:", payload);

      if (isEditMode && permission) {
        await updatePermission(permission.id, payload);
        toast({
          title: "Success",
          description: "Permissions updated successfully",
          variant: "success",
        });
      } else {
        await createPermission(payload);
        toast({
          title: "Success",
          description: "Permissions created successfully",
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
            <DialogDescription className="text-[16px] text-gray-600 dark:text-gray-400 text-left  max-w-sm leading-relaxed">
            {isEditMode
              ? 'Update the permission details below.'
              : 'Fill in the details to create new permissions.'}</DialogDescription>
          </div>
        </DialogHeader>


        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* ULB Selector */}
            <div className="space-y-2">
              <Label htmlFor="ulb_id" className="text-md font-medium text-black dark:text-white pl-1 text-left block">
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
              </div>
            </div>

            {/* Permission Names Input */}
            <div className="space-y-2">
              <Label htmlFor="permission_names" className="text-md font-medium text-black dark:text-white pl-1 text-left block">
                Permission Names
              </Label>
              <div className="relative">
                <Input
                  id="permission_names"
                  name="permission_names"
                  value={formData.permission_names}
                  onChange={handleChange}
                  placeholder="Enter comma separated permissions"
                  disabled={isLoading}
                  className={`w-full bg-background placeholder:text-gray-400 h-14 rounded-md border text-start font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                    error ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
                  }`}
                />
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

export default PermissionDialog;

