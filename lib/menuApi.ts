import { MenuApiResponse } from '@/types/api';
import { getAllMenu as getAllMenuJS } from '@/apicalls/panelSetup';

/**
 * TypeScript wrapper for getAllMenu function to ensure proper typing
 */
export const getAllMenu = async (page: number = 1, limit: number = 10): Promise<MenuApiResponse> => {
  try {
    const response = await getAllMenuJS(page, limit);
    
    // Type assertion to ensure the response matches our expected structure
    const decryptedData = response.data || {};
    const typedResponse: MenuApiResponse = {
      data: {
        data: decryptedData.data || [],
        pagination: {
          totalCount: decryptedData.pagination || 0,
          totalPages: decryptedData.totalPages || 0,
          page: decryptedData.page || page,
          limit: decryptedData.limit || limit
        }
      }
    };
    
    return typedResponse;
  } catch (error) {
    console.error('Error in getAllMenu wrapper:', error);
    
    // Return fallback structure with proper typing
    return {
      data: {
        data: [],
        pagination: {
          totalCount: 0,
          totalPages: 0,
          page: page,
          limit: limit
        }
      }
    };
  }
};
