import { AgencyApiResponse } from '@/types/api';
import { getAllAgency as getAllAgencyJS } from '@/apicalls/panelSetup';

/**
 * TypeScript wrapper for getAllAgency function to ensure proper typing
 */
export const getAllAgency = async (page: number = 1, limit: number = 10): Promise<AgencyApiResponse> => {
  try {
    const response = await getAllAgencyJS(page, limit);
    
    // Type assertion to ensure the response matches our expected structure
    const typedResponse: AgencyApiResponse = {
      data: {
        data: response.data?.data || [],
        pagination: response.data?.pagination || 0,
        totalPages: response.data?.totalPages || 0,
        page: response.data?.page || page,
        limit: response.data?.limit || limit
      }
    };
    
    return typedResponse;
  } catch (error) {
    console.error('Error in getAllAgency wrapper:', error);
    
    // Return fallback structure with proper typing
    return {
      data: {
        data: [],
        pagination: 0,
        totalPages: 0,
        page: page,
        limit: limit
      }
    };
  }
};
