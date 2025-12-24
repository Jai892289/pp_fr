import { Menu, TreeMenuItem } from '@/types/menu';

export class MenuTreeManager {
  /**
   * Build hierarchical tree structure from flat menu array
   */
  static buildMenuTree(menus: Menu[]): TreeMenuItem[] {
    // Create a map for quick lookup
    const menuMap = new Map<number, TreeMenuItem>();
    const rootMenus: TreeMenuItem[] = [];

    // First pass: create TreeMenuItem objects and map them
    menus.forEach(menu => {
      const treeItem: TreeMenuItem = {
        ...menu,
        children: [],
        level: 0,
        isExpanded: true // Default to expanded
      };
      menuMap.set(menu.id, treeItem);
    });

    // Second pass: build parent-child relationships and sort by order
    menus
      .sort((a, b) => a.order - b.order) // Sort by order first
      .forEach(menu => {
        const treeItem = menuMap.get(menu.id);
        if (!treeItem) return;

        const parentId = menu.parentId ?? menu.menuParentId;
        
        if (parentId === null || parentId === undefined) {
          // Root level menu
          treeItem.level = 0;
          rootMenus.push(treeItem);
        } else {
          // Child menu
          const parent = menuMap.get(parentId);
          if (parent) {
            treeItem.level = parent.level + 1;
            parent.children.push(treeItem);
          } else {
            // Parent not found, treat as root
            treeItem.level = 0;
            rootMenus.push(treeItem);
          }
        }
      });

    // Sort children by order
    const sortChildren = (items: TreeMenuItem[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach(item => {
        if (item.children.length > 0) {
          sortChildren(item.children);
        }
      });
    };

    sortChildren(rootMenus);
    return rootMenus;
  }

  /**
   * Flatten tree structure for display with proper indentation
   */
  static flattenTreeForDisplay(treeMenus: TreeMenuItem[]): TreeMenuItem[] {
    const flattened: TreeMenuItem[] = [];

    const traverse = (items: TreeMenuItem[], level: number = 0) => {
      items.forEach(item => {
        const flatItem = { ...item, level };
        flattened.push(flatItem);

        if (item.isExpanded && item.children.length > 0) {
          traverse(item.children, level + 1);
        }
      });
    };

    traverse(treeMenus);
    return flattened;
  }

 

  /**
   * Toggle expansion state of a menu item
   */
  static toggleExpansion(
    treeMenus: TreeMenuItem[],
    menuId: number
  ): TreeMenuItem[] {
    const toggle = (items: TreeMenuItem[]): TreeMenuItem[] => {
      return items.map(item => {
        if (item.id === menuId) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children.length > 0) {
          return { ...item, children: toggle(item.children) };
        }
        return item;
      });
    };

    return toggle(treeMenus);
  }

  /**
   * Find the maximum order value for a given parent
   */
  static getMaxOrderForParent(menus: Menu[], parentId: number | null): number {
    const siblings = menus.filter(menu => 
      (menu.parentId ?? menu.menuParentId) === parentId
    );
    
    return siblings.length > 0 
      ? Math.max(...siblings.map(menu => menu.order)) + 1 
      : 0;
  }

  /**
   * Validate menu hierarchy (prevent circular references)
   */
  static validateHierarchy(menus: Menu[], menuId: number, newParentId: number | null): boolean {
    if (newParentId === null) return true;
    if (menuId === newParentId) return false;

    // Check if newParentId is a descendant of menuId
    const findInChildren = (parentId: number, targetId: number): boolean => {
      const children = menus.filter(menu => 
        (menu.parentId ?? menu.menuParentId) === parentId
      );

      for (const child of children) {
        if (child.id === targetId) return true;
        if (findInChildren(child.id, targetId)) return true;
      }
      return false;
    };

    return !findInChildren(menuId, newParentId);
  }

  /**
   * Get breadcrumb path for a menu
   */
  static getBreadcrumb(menus: Menu[], menuId: number): string[] {
    const breadcrumb: string[] = [];
    
    const findPath = (id: number): void => {
      const menu = menus.find(m => m.id === id);
      if (!menu) return;

      const parentId = menu.parentId ?? menu.menuParentId;
      if (parentId !== null && parentId !== undefined) {
        findPath(parentId);
      }
      
      breadcrumb.push(menu.label || menu.menuLabel || 'Untitled');
    };

    findPath(menuId);
    return breadcrumb;
  }
}