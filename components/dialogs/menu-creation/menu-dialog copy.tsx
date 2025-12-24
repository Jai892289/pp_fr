"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
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
import { createMenuData, updateMenuData, getAllMenu, getUlbMasterData, getAllPermissions } from '@/apicalls/panelSetup';
import { Loader2, Search, Check, ChevronDown, X, ChevronUp } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { MenuDialogProps, Menu } from '@/types/menu';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MenuDialog({ open, onOpenChange, menu, onSuccess }: MenuDialogProps) {
  const [formData, setFormData] = useState({
    label: '',
    path: '',
    parentId: null as number | null,
    permissionName: [] as string[],
    ulb_id: ''
  });
  const [ulbs, setUlbs] = useState<Array<{ id: number; name: string }>>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [permissions, setPermissions] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isLoadingMenuData, setIsLoadingMenuData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParentQuery, setSearchParentQuery] = useState('');
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isParentMenuOpen, setIsParentMenuOpen] = useState(false);
  const [popoverDirection, setPopoverDirection] = useState<'top' | 'bottom'>('bottom');
  const permissionsButtonRef = useRef<HTMLButtonElement>(null);
  const parentMenuButtonRef = useRef<HTMLButtonElement>(null);
  const permissionsListRef = useRef<HTMLDivElement>(null);
  const parentMenuListRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast(); 

  const isEditMode = !!menu;

  // Filter permissions based on search query
  const filteredPermissions = useMemo(() => {
    if (!searchQuery) return permissions;
    return permissions.filter(permission =>
      permission.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [permissions, searchQuery]);

  // Filter parent menus based on search query
  const filteredParentMenus = useMemo(() => {
    if (!searchParentQuery) return menus.filter(m => m.id !== menu?.id); // Exclude current menu in edit mode
    return menus.filter(menu =>
      (menu.menuLabel || menu.label).toLowerCase().includes(searchParentQuery.toLowerCase()) &&
      menu.id !== (isEditMode ? menu.id : -1) // Exclude current menu in edit mode
    );
  }, [menus, searchParentQuery, isEditMode, menu]);

  // Check if all permissions are selected
  const allSelected = useMemo(() => {
    return filteredPermissions.length > 0 &&
      filteredPermissions.every(p => formData.permissionName.includes(p.name));
  }, [filteredPermissions, formData.permissionName]);

  // Check if some permissions are selected
  const someSelected = useMemo(() => {
    return filteredPermissions.some(p => formData.permissionName.includes(p.name)) && !allSelected;
  }, [filteredPermissions, formData.permissionName, allSelected]);

  // Calculate popover position
  useEffect(() => {
    const calculatePosition = (buttonRef: React.RefObject<HTMLButtonElement | null>, listRef: React.RefObject<HTMLDivElement | null>) => {
      if (buttonRef.current && listRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const listHeight = 260; // Approximate height of the list
        const spaceBelow = window.innerHeight - buttonRect.bottom;

        if (spaceBelow < listHeight && buttonRect.top > listHeight) {
          setPopoverDirection('top');
        } else {
          setPopoverDirection('bottom');
        }
      }
    };

    if (isPermissionsOpen) {
      calculatePosition(permissionsButtonRef, permissionsListRef);
    }

    if (isParentMenuOpen) {
      calculatePosition(parentMenuButtonRef, parentMenuListRef);
    }
  }, [isPermissionsOpen, isParentMenuOpen]);

  // Toggle select all permissions
  const toggleSelectAll = () => {
    if (allSelected) {
      // Deselect all filtered permissions
      const newSelection = formData.permissionName.filter(
        name => !filteredPermissions.some(p => p.name === name)
      );
      setFormData(prev => ({ ...prev, permissionName: newSelection }));
    } else {
      // Select all filtered permissions
      const filteredPermissionNames = filteredPermissions.map(p => p.name);
      const newSelection = [...new Set([...formData.permissionName, ...filteredPermissionNames])];
      setFormData(prev => ({ ...prev, permissionName: newSelection }));
    }
  };

  // Toggle individual permission selection
  const togglePermission = (permissionName: string) => {
    setFormData(prev => {
      if (prev.permissionName.includes(permissionName)) {
        return {
          ...prev,
          permissionName: prev.permissionName.filter(name => name !== permissionName)
        };
      } else {
        return {
          ...prev,
          permissionName: [...prev.permissionName, permissionName]
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
    setIsParentMenuOpen(false); // Close other dropdown
  };

  // Toggle parent menu dropdown
  const toggleParentMenuDropdown = () => {
    if (!isParentMenuOpen) {
      // When opening, calculate position
      const buttonRect = parentMenuButtonRef.current?.getBoundingClientRect();
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
    setIsParentMenuOpen(!isParentMenuOpen);
    setIsPermissionsOpen(false); // Close other dropdown
  };

  // Select parent menu
  const selectParentMenu = (parentId: number | null) => {
    setFormData(prev => ({ ...prev, parentId }));
    setIsParentMenuOpen(false);
  };

// Fetch menu and permission data
useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoadingMenus(true);
      setIsLoadingPermissions(true);

      // Fetch ULBs
      const ulbResponse = await getUlbMasterData();
      if (ulbResponse?.data) {
        setUlbs(ulbResponse.data || []);
      }

         // Fetch all menus for parent selection
         const menuResponse = await getAllMenu();
         if (menuResponse?.data?.data) {
           setMenus(menuResponse.data.data.data || []);
         }

      // Fetch permissions - check the actual response structure
      const permissionResponse = await getAllPermissions();
      if (permissionResponse?.data?.data) {
        // The response shows permissions are in data.permission array
        // Check if permissions are in data.data or data.permission
        const permissionsData = permissionResponse.data.permission || 
                               permissionResponse.data.data || [];
        setPermissions(permissionsData);
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
      setIsLoadingMenus(false);
      setIsLoadingPermissions(false);
    }
  };

  if (open) {
    fetchData();
    setSearchQuery('');
    setSearchParentQuery('');
    setIsPermissionsOpen(false);
    setIsParentMenuOpen(false);
    setPopoverDirection('bottom');
  }
}, [open, toast]);

// Set form data when in edit mode
useEffect(() => {
  if (isEditMode && menu && open) {
    setIsLoadingMenuData(true);
    try {
      // Extract permission names from the permissions array
      const permissionNames = menu.permissions 
        ? menu.permissions.map(p => p.name) 
        : [];
        
      
      setFormData({
        label: menu.menuLabel || menu.label || '',
        path: menu.menuPath || menu.path || '',
        parentId: menu.menuParentId !== undefined ? menu.menuParentId : menu.parentId || null,
        permissionName: permissionNames, // Use the extracted permission names
        ulb_id: menu.ulb_id?.toString() || ''
      });
    } catch (error) {
      console.error('Error setting menu data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menu details',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMenuData(false);
    }
  } else if (open) {
    // Reset form for new menu
    setFormData({
      label: '',
      path: '',
      parentId: null,
      permissionName: [],
      ulb_id: ''
    });
  }
}, [isEditMode, menu, open, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label.trim()) {
      setError('Menu label is required');
      return;
    }

    if (!formData.path.trim()) {
      setError('Menu path is required');
      return;
    }

    if (!formData.ulb_id) {
      setError('ULB is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const menuData = {
        label: formData.label.trim(),
        path: formData.path.trim(),
        parentId: formData.parentId,
        recstatus: 1,
        ulb_id: Number(formData.ulb_id),
        permissionName: formData.permissionName
      };

      if (isEditMode && menu) {
        await updateMenuData(menu.id, 
          {
            menuLabel: formData.label.trim(),
            menuPath: formData.path.trim(),
            menuPermission: formData.permissionName,
            menuParentId: formData.parentId,
            ulb_id: Number(formData.ulb_id),
          }
        );
        toast({
          title: "Success",
          description: "Menu updated successfully",
          variant: "success",
        });
      } else {
        await createMenuData(menuData);
        toast({
          title: "Success",
          description: "Menu created successfully",
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

  // Get parent menu label for display
  const getParentMenuLabel = () => {
    if (formData.parentId === null) return "None (Top Level Menu)";
    const parentMenu = menus.find(m => m.id === formData.parentId);
    return parentMenu ? (parentMenu.menuLabel || parentMenu.label) : "Select parent menu";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl mx-auto rounded-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <DialogHeader className="text-center space-y-6 pb-2 mb-6">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
              {isEditMode ? 'Edit Menu' : 'Create New Menu'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-center">
              {isEditMode
                ? 'Update the menu details and permissions'
                : 'Define a new menu with specific permissions'}
            </DialogDescription>
          </div>
        </DialogHeader>


        <form onSubmit={handleSubmit} className="space-y-6">
          {isLoadingMenuData && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">Loading menu details...</span>
            </div>
          )}

          {!isLoadingMenuData && (
            <>
              <div className="space-y-4">
              <div className='grid grid-cols-1 md:grid-cols-2 justify-center items-center gap-x-12 gap-y-2'>
                {/* Menu Label Input */}
                <div className="space-y-2">
                  <Label htmlFor="label" className="text-sm font-medium text-gray-700">
                    Menu Label
                  </Label>
                  <div className="relative">
                    <Input
                      id="label"
                      name="label"
                      value={formData.label}
                      onChange={handleChange}
                      placeholder="Enter menu label"
                      disabled={isLoading}
                      className={`w-full p-3 bg-gray-50 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error && !formData.label ? "border-red-300 bg-red-50" : "border-gray-300"
                        }`}
                    />
                    {error && !formData.label && (
                      <p className="text-sm text-red-500 mt-1">Menu label is required</p>
                    )}
                  </div>
                </div>

                {/* Menu Path Input */}
                <div className="space-y-2">
                  <Label htmlFor="path" className="text-sm font-medium text-gray-700">
                    Menu Path
                  </Label>
                  <div className="relative">
                    <Input
                      id="path"
                      name="path"
                      value={formData.path}
                      onChange={handleChange}
                      placeholder="Enter menu path (e.g., /property)"
                      disabled={isLoading}
                      className={`w-full p-3 bg-gray-50 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error && !formData.path ? "border-red-300 bg-red-50" : "border-gray-300"
                        }`}
                    />
                    {error && !formData.path && (
                      <p className="text-sm text-red-500 mt-1">Menu path is required</p>
                    )}
                  </div>
                </div>

                {/* ULB Input */}
                <div className="space-y-2">
                  <Label htmlFor="ulb_id" className="text-sm font-medium text-gray-700">
                    ULB ID
                  </Label>
                  <div className="relative">
                    <select
                      id="ulb_id"
                      name="ulb_id"
                      value={formData.ulb_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, ulb_id: e.target.value }))}
                      disabled={isLoading}
                      className={`w-full p-3 bg-gray-50 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error && !formData.ulb_id ? "border-red-300 bg-red-50" : "border-gray-300"
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

                {/* Parent Menu Selector */}
                <div className="space-y-2">
                  <Label htmlFor="parentId" className="text-sm font-medium text-gray-700">
                    Parent Menu
                  </Label>

                  <div className="relative">
                    <button
                      ref={parentMenuButtonRef}
                      type="button"
                      onClick={toggleParentMenuDropdown}
                      className={`w-full p-3 bg-gray-50 rounded-lg border text-sm text-left flex items-center justify-between transition-all duration-200 ${error && formData.parentId === undefined
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                        } ${isParentMenuOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                    >
                      <span className="truncate">
                        {getParentMenuLabel()}
                      </span>
                      {popoverDirection === 'bottom' ? (
                        <ChevronDown className={`h-4 w-4 transition-transform ${isParentMenuOpen ? "rotate-180" : ""}`} />
                      ) : (
                        <ChevronUp className={`h-4 w-4 transition-transform ${isParentMenuOpen ? "rotate-180" : ""}`} />
                      )}
                    </button>

                    {isParentMenuOpen && (
                      <div
                        ref={parentMenuListRef}
                        className={`absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg ${popoverDirection === 'top'
                            ? 'bottom-full mb-1'
                            : 'top-full mt-1'
                          }`}
                      >
                        {/* Search input */}
                        <div className="p-2 border-b">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              placeholder="Search menus..."
                              value={searchParentQuery}
                              onChange={(e) => setSearchParentQuery(e.target.value)}
                              className="pl-9 bg-gray-50 border-0 focus-visible:ring-1"
                              autoFocus
                            />
                          </div>
                        </div>

                        {/* None option */}
                        <div
                          className="flex items-center p-2 border-b cursor-pointer hover:bg-gray-50"
                          onClick={() => selectParentMenu(null)}
                        >
                          <div className={`flex items-center justify-center h-4 w-4 rounded border mr-2 ${formData.parentId === null ? "bg-blue-600 border-blue-600" : "border-gray-300"
                            }`}>
                            {formData.parentId === null && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium">None (Top Level Menu)</span>
                        </div>

                        {/* Menus list */}
                        <ScrollArea className="h-60">
                          {filteredParentMenus.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                              {searchParentQuery ? "No menus found" : "No menus available"}
                            </div>
                          ) : (
                            <div className="p-1">
                              {filteredParentMenus.map((menuItem) => (
                                <div
                                  key={menuItem.id}
                                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-50"
                                  onClick={() => selectParentMenu(menuItem.id)}
                                >
                                  <div className={`flex items-center justify-center h-4 w-4 rounded border mr-2 ${formData.parentId === menuItem.id
                                      ? "bg-blue-600 border-blue-600"
                                      : "border-gray-300"
                                    }`}>
                                    {formData.parentId === menuItem.id && (
                                      <Check className="h-3 w-3 text-white" />
                                    )}
                                  </div>
                                  <span className="text-sm">{menuItem.menuLabel || menuItem.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </div>

                {/* Permissions Multi-Select */}
                <div className="space-y-2 col-span-full py-4">
                  <Label htmlFor="permissions" className="text-sm font-medium text-gray-700">
                    Permissions
                    <span className="text-xs text-gray-500 ml-1">
                      ({formData.permissionName.length} selected)
                    </span>
                  </Label>

                  <div className="relative">
                    <button
                      ref={permissionsButtonRef}
                      type="button"
                      onClick={togglePermissionsDropdown}
                      className={`w-full p-3 bg-gray-50 rounded-lg border text-sm text-left flex items-center justify-between transition-all duration-200 ${error && formData.permissionName.length === 0
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                        } ${isPermissionsOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                    >
                      <span className="truncate">
                        {formData.permissionName.length === 0
                          ? "Select permissions..."
                          : `${formData.permissionName.length} permissions selected`}
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
                        className={`absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg ${popoverDirection === 'top'
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
                          <div className={`flex items-center justify-center h-4 w-4 rounded border mr-2 ${allSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
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
                                  <div className={`flex items-center justify-center h-4 w-4 rounded border mr-2 ${formData.permissionName.includes(permission.name)
                                      ? "bg-blue-600 border-blue-600"
                                      : "border-gray-300"
                                    }`}>
                                    {formData.permissionName.includes(permission.name) && (
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

                    {error && formData.permissionName.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">Please select at least one permission</p>
                    )}
                  </div>

                  {/* Selected permissions badges */}
                  {formData.permissionName.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.permissionName.slice(0, 5).map((permission) => (
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
                      {formData.permissionName.length > 5 && (
                        <Badge variant="outline" className="px-2 py-1 text-xs">
                          +{formData.permissionName.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              </div>

              {/* {error && typeof error === 'string' && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )} */}

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
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
                    'Update Menu'
                  ) : (
                    'Create Menu'
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