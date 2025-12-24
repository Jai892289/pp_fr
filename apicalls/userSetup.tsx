import { apiClient } from "@/lib/apiClient";
import { apiDecrypt, apiEncrypt } from "@/lib/cryptography";
import type {
  EncryptedEmployeeListApiResponse,
  EmployeeListApiResponse,
  UserListResponse,
  Employee,
  EmployeeFormData
} from "@/types/employee";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

export const getAllEmployees = async (page = 1, limit = 10): Promise<EmployeeListApiResponse> => {
    try {
      // First get encrypted payload
      const response = await apiClient.get<EncryptedEmployeeListApiResponse>(
        `${API_BASE}/api/panel/master/employee`,
        { params: { page, limit } }
      );
  
      // Decrypt & cast to correct type
      const decryptedData = (await apiDecrypt(response.data.data)) as UserListResponse;
      console.log("decryptedData", decryptedData)
  
      return {
        message: response.data.message,
        data: decryptedData,
      };
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  };


interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const createEmployeeApi = async (formData: FormData): Promise<ApiResponse> => {
  try {
    console.log("Form data panel:", formData);
    
    const response = await apiClient.post<ApiResponse>(
      `${API_BASE}/api/panel/master/employee`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create employee',
      data: error.response?.data
    };
  }
};

export const getEmployeeByIdApi = async (id: number) => {
    try {
        const encryptedData = apiEncrypt({ id });

    
        const response = await apiClient.get<EncryptedEmployeeListApiResponse>(
            `${API_BASE}/api/panel/master/employee/by-id?iv=${encryptedData.iv}&ed=${encryptedData.encryptedData}`
        );

        
        
        if (response?.data?.data) {
            if (response.data.data.encryptedData && response.data.data.iv) {
                return apiDecrypt({
                    encryptedData: response.data.data.encryptedData,
                    iv: response.data.data.iv
                });
            }
            return response.data.data;
        }
        
        throw new Error('Invalid response format from server');
    } catch (error) {
        console.error('Error in getEmployeeByIdApi:', error);
        throw error;
    }
};


export const updateEmployeeApi = async (userId: string, formData: FormData): Promise<ApiResponse> => {
  console.log("Form data panel:",userId, formData);
  try {
    // Append userId to the FormData if needed
    formData.append('userId', userId);
    
    const response = await apiClient.put(
      `${API_BASE}/api/panel/master/employee`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error updating employee:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update employee',
      data: error.response?.data
    };
  }
};

// export const updateEmployeeApi = async (userId: number, formData: any) => {
//   try {
//     const encryptedData = apiEncrypt({ userId, ...formData });
//     const response = await apiClient.put(`${API_BASE}/api/panel/master/employee`, {
//       iv: encryptedData.iv,
//       ed: encryptedData.encryptedData
//     });
    
//     if (response?.data?.data) {
//       const decryptedData = apiDecrypt(response.data.data);
//       return {
//         ...response,
//         data: decryptedData
//       };
//     }
    
//     return response;
//   } catch (error: any) {
//     console.error('Error updating employee:', error);
//     throw error;
//   }
// };

// Toggle Module Type Status
export const toggleEmployeeApi = async (id: number) => {
    const encryptedData = apiEncrypt({ id });
    console.log("encryptedData", encryptedData)
    const response = await apiClient.put(`${API_BASE}/api/panel/master/employee/toggle`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    console.log("response", response)
    return response;
};




/*----------------------------------------------------------------------------------------
--------------------------------Actions API-----------------------------------------------
----------------------------------------------------------------------------------------*/

// Manage ULBs assigned to employee

export const connectEmployeeULBs = async (user_id: number, ulb_id: number[]) => {
  try {
    const encryptedData = apiEncrypt({ user_id, ulb_id });
    const response = await apiClient.put(`${API_BASE}/api/panel/master/employee/connect-ulb`, {
      iv: encryptedData.iv,
      ed: encryptedData.encryptedData
    });
    return response;
  } catch (error) {
    console.error("Error connecting employee ULBs:", error);
    throw error;
  }
};


// Disconnect ULBs assigned to employee
// [{{base_url}}/api/panel/master/employee/disconnect-ulb]

export const disconnectEmployeeULBs = async (user_id: number, ulb_id: number[]) => {
  try {
    const encryptedData = apiEncrypt({ user_id, ulb_id });
    const response = await apiClient.put(`${API_BASE}/api/panel/master/employee/disconnect-ulb`, {
      iv: encryptedData.iv,
      ed: encryptedData.encryptedData
    });
    return response;
  } catch (error) {
    console.error("Error disconnecting employee ULBs:", error);
    throw error;
  }
};



// Manage wards assigned to employee

export const connectEmployeeWards = async (userId: number, wardIds: number[]) => {
  try {
    const encryptedData = apiEncrypt({ userId, wardIds });
    const response = await apiClient.put(`${API_BASE}/api/panel/master/employee/map-wards`, {
      iv: encryptedData.iv,
      ed: encryptedData.encryptedData
    });
    return response;
  } catch (error) {
    console.error("Error connecting employee wards:", error);
    throw error;
  }
};

export const disconnectEmployeeWards = async (userId: number, id: number[]) => {
  try {
    const encryptedData = apiEncrypt({ userId, id });
    const response = await apiClient.put(`${API_BASE}/api/panel/master/employee/remove-ward`, {
      iv: encryptedData.iv,
      ed: encryptedData.encryptedData
    });
    return response;
  } catch (error) {
    console.error("Error disconnecting employee wards:", error);
    throw error;
  }
};


// Manage roles assigned to employee
export const connectEmployeeRoles = async (user_id: number, roles: number[]) => {
  try {
    const encryptedData = apiEncrypt({ user_id, roles });
    const response = await apiClient.put(`${API_BASE}/api/panel/master/employee/connect-role`, {
      iv: encryptedData.iv,
      ed: encryptedData.encryptedData
    });
    return response;
  } catch (error) {
    console.error("Error connecting employee roles:", error);
    throw error;
  }
};

export const disconnectEmployeeRoles = async (user_id: number, role: number[]) => {
  try {
    const encryptedData = apiEncrypt({ user_id, role });
    const response = await apiClient.put(`${API_BASE}/api/panel/master/employee/disconnect-role`, {
      iv: encryptedData.iv,
      ed: encryptedData.encryptedData
    });
    return response;
  } catch (error) {
    console.error("Error disconnecting employee roles:", error);
    throw error;
  }
};


// connect permission
//{{base_url}}/api/panel/master/employee/map-permission
export const connectEmployeePermission = async (userId: number, permissionId: number[]) => {
  try {
    const encryptedData = apiEncrypt({ userId, permissionId });
    const response = await apiClient.put(`${API_BASE}/api/panel/master/employee/map-permission`, {
      iv: encryptedData.iv,
      ed: encryptedData.encryptedData
    });
    return response;
  } catch (error) {
    console.error("Error connecting employee permission:", error);
    throw error;
  }
};


// disconnect permission
//{{base_url}}/api/panel/master/employee/remove-permission
export const disconnectEmployeePermission = async (userId: number, id: number[]) => {
  try {
    const encryptedData = apiEncrypt({ userId, id });
    const response = await apiClient.put(`${API_BASE}/api/panel/master/employee/remove-permission`, {
      iv: encryptedData.iv,
      ed: encryptedData.encryptedData
    });
    return response;
  } catch (error) {
    console.error("Error disconnecting employee permission:", error);
    throw error;
  }
};
