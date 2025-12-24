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
import { createRoleApi, updateRoleApi, getRoleByIdApi, getUlbMasterData, getAllPermissions } from '@/apicalls/panelSetup';
import { RoleDialogProps } from '@/types/role';
import { Loader2, Search, Check, ChevronDown, X, ChevronUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RoleDialog({ open, onOpenChange, role, onSuccess }: RoleDialogProps) {
  const [formData, setFormData] = useState({
    role_name: '', 
    ulb_id: '',
    permission_names: [] as string[]
  });
  
  const [ulbs, setUlbs] = useState<Array<{ id: number; name: string }>>([]);
  const [permissions, setPermissions] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUlbs, setIsLoadingUlbs] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [popoverDirection, setPopoverDirection] = useState<'top' | 'bottom'>('bottom');
  const permissionsButtonRef = useRef<HTMLButtonElement>(null);
  const permissionsListRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const isEditMode = !!role;

  // Filter permissions based on search query
  const filteredPermissions = useMemo(() => {
    if (!searchQuery) return permissions;
    return permissions.filter(permission => 
      permission.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [permissions, searchQuery]);

  // Check if all permissions are selected
  const allSelected = useMemo(() => {
    return filteredPermissions.length > 0 && 
           filteredPermissions.every(p => formData.permission_names.includes(p.name));
  }, [filteredPermissions, formData.permission_names]);

  // Check if some permissions are selected
  const someSelected = useMemo(() => {
    return filteredPermissions.some(p => formData.permission_names.includes(p.name)) && !allSelected;
  }, [filteredPermissions, formData.permission_names, allSelected]);

  // Calculate popover position
  useEffect(() => {
    if (isPermissionsOpen && permissionsButtonRef.current && permissionsListRef.current) {
      const buttonRect = permissionsButtonRef.current.getBoundingClientRect();
      const listHeight = 260; // Approximate height of the permissions list
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      
      if (spaceBelow < listHeight && buttonRect.top > listHeight) {
        setPopoverDirection('top');
      } else {
        setPopoverDirection('bottom');
      }
    }
  }, [isPermissionsOpen]);

  // Toggle select all permissions
  const toggleSelectAll = () => {
    if (allSelected) {
      // Deselect all filtered permissions
      const newSelection = formData.permission_names.filter(
        name => !filteredPermissions.some(p => p.name === name)
      );
      setFormData(prev => ({ ...prev, permission_names: newSelection }));
    } else {
      // Select all filtered permissions
      const filteredPermissionNames = filteredPermissions.map(p => p.name);
      const newSelection = [...new Set([...formData.permission_names, ...filteredPermissionNames])];
      setFormData(prev => ({ ...prev, permission_names: newSelection }));
    }
  };

  // Toggle individual permission selection
  const togglePermission = (permissionName: string) => {
    setFormData(prev => {
      if (prev.permission_names.includes(permissionName)) {
        return {
          ...prev,
          permission_names: prev.permission_names.filter(name => name !== permissionName)
        };
      } else {
        return {
          ...prev,
          permission_names: [...prev.permission_names, permissionName]
        };
      }
    });
  };

  // Toggle permissions dropdown
  const togglePermissionsDropdown = () => {
    if (!isPermissionsOpen) {
      // When opening, calculate position
      const buttonRect = permissionsButtonRef.current?.getBoundingClientRect();
      if (buttonRect) {
        const listHeight = 260; // Approximate height
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        
        if (spaceBelow < listHeight && buttonRect.top > listHeight) {
          setPopoverDirection('top');
        } else {
          setPopoverDirection('bottom');
        }
      }
    }
    setIsPermissionsOpen(!isPermissionsOpen);
  };

  // Fetch role data when in edit mode
  useEffect(() => {
    const fetchRoleData = async () => {
      if (isEditMode && role && open) {
        try {
          setIsLoadingRole(true);
          const roleResponse = await getRoleByIdApi(role.id);
          console.log("roleResponse", roleResponse)
          if (roleResponse) {
            const roleData = roleResponse;
            setFormData({
              role_name: roleData.name || '',
              ulb_id: roleData.ulb_id?.toString() || '',
              permission_names: roleData.permissions?.map((p: any) => p.name) || []
            });
          }
        } catch (error) {
          console.error('Error fetching role data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load role details',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingRole(false);
        }
      }
    };

    fetchRoleData();
  }, [isEditMode, role, open, toast]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingUlbs(true);
        setIsLoadingPermissions(true);
        
        // Fetch ULBs
        const ulbResponse = await getUlbMasterData();
        if (ulbResponse?.data) {
          setUlbs(ulbResponse.data || []);
        }
        
        // Fetch permissions
        const permissionResponse = await getAllPermissions(1, 100);
        if (permissionResponse?.data?.data) {
          setPermissions(permissionResponse.data.data || []);
        }
        
        // Reset form if not in edit mode
        if (!isEditMode) {
          setFormData({
            role_name: '',
            ulb_id: '',
            permission_names: []
          });
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingUlbs(false);
        setIsLoadingPermissions(false);
      }
    };

    if (open) {
      fetchData();
      setSearchQuery('');
      setIsPermissionsOpen(false);
      setPopoverDirection('bottom');
    }
  }, [open, isEditMode, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.role_name.trim()) {
      setError('Role name is required');
      return;
    }
    
    if (!formData.ulb_id) {
      setError('Please select a ULB');
      return;
    }

    if (formData.permission_names.length === 0) {
      setError('Please select at least one permission');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        role_name: formData.role_name,
        ulb_id: Number(formData.ulb_id),
        permission_names: formData.permission_names
      };
      
      if (isEditMode && role) {
        await updateRoleApi(role.id, payload);
        toast({
          title: "Success",
          description: "Role updated successfully",
          variant: "success",
        });
      } else {
        await createRoleApi(payload);
        toast({
          title: "Success",
          description: "Role created successfully",
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
      <DialogContent className="sm:max-w-lg mx-auto rounded-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <DialogHeader className="text-center space-y-6 pb-2 mb-2">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
              {isEditMode ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-center">
              {isEditMode
                ? 'Update the role details and permissions'
                : 'Define a new role with specific permissions'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isLoadingRole && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">Loading role details...</span>
            </div>
          )}
          
          {!isLoadingRole && (
            <>
              <div className="space-y-4">
                {/* ULB Selector */}
                <div className="space-y-2">
                  <Label htmlFor="ulb_id" className="text-sm font-medium text-gray-700">
                    ULB
                  </Label>
                  <div className="relative">
                    <select
                      id="ulb_id"
                      name="ulb_id"
                      value={formData.ulb_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, ulb_id: e.target.value }))}
                      disabled={isLoading || isLoadingUlbs}
                      className={`w-full p-3 bg-gray-50 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        error && !formData.ulb_id ? "border-red-300 bg-red-50" : "border-gray-300"
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
                      <p className="text-sm text-red-500 mt-1">Please select a ULB</p>
                    )}
                  </div>
                </div>

                {/* Role Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="role_name" className="text-sm font-medium text-gray-700">
                    Role Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="role_name"
                      name="role_name"
                      value={formData.role_name}
                      onChange={handleChange}
                      placeholder="Enter role name"
                      disabled={isLoading}
                      className={`w-full p-3 bg-gray-50 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        error && !formData.role_name ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {error && !formData.role_name && (
                      <p className="text-sm text-red-500 mt-1">Role name is required</p>
                    )}
                  </div>
                </div>

                {/* Permissions Multi-Select */}
                <div className="space-y-2">
                  <Label htmlFor="permissions" className="text-sm font-medium text-gray-700">
                    Permissions
                    <span className="text-xs text-gray-500 ml-1">
                      ({formData.permission_names.length} selected)
                    </span>
                  </Label>
                  
                  <div className="relative">
                    <button
                      ref={permissionsButtonRef}
                      type="button"
                      onClick={togglePermissionsDropdown}
                      className={`w-full p-3 bg-gray-50 rounded-lg border text-sm text-left flex items-center justify-between transition-all duration-200 ${
                        error && formData.permission_names.length === 0 
                          ? "border-red-300 bg-red-50" 
                          : "border-gray-300 hover:border-gray-400"
                      } ${isPermissionsOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                    >
                      <span className="truncate">
                        {formData.permission_names.length === 0
                          ? "Select permissions..."
                          : `${formData.permission_names.length} permissions selected`}
                      </span>
                      {popoverDirection === 'bottom' ? (
                        <ChevronDown className={`h-4 w-4 transition-transform ${isPermissionsOpen ? "rotate-180" : ""}`} />
                      ) : (
                        <ChevronUp className={`h-4 w-4 transition-transform ${isPermissionsOpen ? "rotate-180" : ""}`} />
                      )}
                    </button>
                    
                    {isPermissionsOpen && (
                      <div 
                        ref={permissionsListRef}
                        className={`absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg ${
                          popoverDirection === 'top' 
                            ? 'bottom-full mb-1' 
                            : 'top-full mt-1'
                        }`}
                      >
                        {/* Search input */}
                        <div className="p-2 border-b">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              placeholder="Search permissions..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9 bg-gray-50 border-0 focus-visible:ring-1"
                              autoFocus
                            />
                          </div>
                        </div>
                        
                        {/* Select all option */}
                        <div 
                          className="flex items-center p-2 border-b cursor-pointer hover:bg-gray-50"
                          onClick={toggleSelectAll}
                        >
                          <div className={`flex items-center justify-center h-4 w-4 rounded border mr-2 ${
                            allSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                          }`}>
                            {allSelected ? (
                              <Check className="h-3 w-3 text-white" />
                            ) : someSelected ? (
                              <div className="h-2 w-2 bg-blue-600 rounded-sm" />
                            ) : null}
                          </div>
                          <span className="text-sm font-medium">Select All</span>
                        </div>
                        
                        {/* Permissions list */}
                        <ScrollArea className="h-60">
                          {filteredPermissions.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                              {searchQuery ? "No permissions found" : "No permissions available"}
                            </div>
                          ) : (
                            <div className="p-1">
                              {filteredPermissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-50"
                                  onClick={() => togglePermission(permission.name)}
                                >
                                  <div className={`flex items-center justify-center h-4 w-4 rounded border mr-2 ${
                                    formData.permission_names.includes(permission.name) 
                                      ? "bg-blue-600 border-blue-600" 
                                      : "border-gray-300"
                                  }`}>
                                    {formData.permission_names.includes(permission.name) && (
                                      <Check className="h-3 w-3 text-white" />
                                    )}
                                  </div>
                                  <span className="text-sm">{permission.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    )}
                    
                    {error && formData.permission_names.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">Please select at least one permission</p>
                    )}
                  </div>
                  
                  {/* Selected permissions badges */}
                  {formData.permission_names.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.permission_names.slice(0, 5).map((permission) => (
                        <Badge
                          key={permission}
                          variant="secondary"
                          className="px-2 py-1 text-xs flex items-center gap-1"
                        >
                          {permission}
                          <button
                            type="button"
                            onClick={() => togglePermission(permission)}
                            className="rounded-full outline-none focus:ring-1 focus:ring-gray-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {formData.permission_names.length > 5 && (
                        <Badge variant="outline" className="px-2 py-1 text-xs">
                          +{formData.permission_names.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
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
                    'Update Role'
                  ) : (
                    'Create Role'
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