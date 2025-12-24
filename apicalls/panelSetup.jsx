
import axios from "axios";
import { apiClient } from "@/lib/apiClient";
import { apiDecrypt } from "@/lib/cryptography"
import { apiEncrypt } from "@/lib/cryptography"


const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;


/*
------------------------------------------------------------------------------------------
*******************************ULB Type*******************************
------------------------------------------------------------------------------------------*/

// GET ULB Type

export const getUlbTypeData = async (page = 1, limit = 10) => {
    const response = await apiClient.get(`${API_BASE}/api/panel/master/ulbType`, {
        params: { page, limit }
    });
    if (response?.data?.data) {
        return {
            data: {
                data: apiDecrypt(response.data.data)
            }
        }
    }
    return response.data
};

// Create ULB Type
export const createUlbType = async (ulbTypeName) => {
    const response = await apiClient.post(`${API_BASE}/api/panel/master/ulbType`, {
        ulbTypeName
    });
    return response;
};

// Update ULB Type
export const updateUlbType = async (ulbTypeId, ulbTypeName) => {
    const encryptedData = apiEncrypt({ ulbTypeId, ulbTypeName });
    console.log("encryptedData", encryptedData)
    const response = await apiClient.put(`${API_BASE}/api/panel/master/ulbType`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    
    // Decrypt the response if it contains encrypted data
    if (response?.data?.data) {
        return {
            ...response,
            data: apiDecrypt(response.data.data)
        }
    }
    console.log("response", response)
    return response;
};

// Toggle ULB Type Status
export const toggleUlbType = async (id) => {
    const encryptedData = apiEncrypt({ id });
    console.log("encryptedData", encryptedData)
    const response = await apiClient.put(`${API_BASE}/api/panel/master/ulbType/toggle`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    return response;
};






/*------------------------------------------------------------------------------------------
*******************************Role*******************************
------------------------------------------------------------------------------------------*/
export const getAllRoleApi = async (page = 1, limit = 10) => {
    try {
        const response = await apiClient.get(`${API_BASE}/api/panel/master/role`, { 
            params: { page, limit } 
        });
        
        if (response?.data?.data) {
            const decryptedData = apiDecrypt(response.data.data);
            return {
                data: Array.isArray(decryptedData?.data) ? decryptedData.data : [],
                pagination: decryptedData?.pagination || 0,
                page: decryptedData?.page || page,
                limit: decryptedData?.limit || limit,
                totalPages: decryptedData?.totalPages || 1
            };
        }
        
        throw new Error('Invalid response format from server');
    } catch (error) {
        console.error('Error in getAllModuleType:', error);
        return {
            data: [],
            pagination: 0,
            page,
            limit,
            totalPages: 1
        };
    }
};

export const createRoleApi = async (roleData) => {
    const response = await apiClient.post(`${API_BASE}/api/panel/master/role`, {
        ...roleData
    });
    
    if (response?.data?.data?.encryptedData && response?.data?.data?.iv) {
        return apiDecrypt({
            encryptedData: response.data.data.encryptedData,
            iv: response.data.data.iv
        });
    }
    return response?.data || {};
};

// export const getRoleByIdApi = async (id, roleData) => {
//     const encryptedData = apiEncrypt({ id, ...roleData });
//     const response = await apiClient.get(`${API_BASE}/api/panel/master/role/by-id?iv=${encryptedData.iv}&ed=${encryptedData.ed}`);
    
//     if (response?.data?.data?.encryptedData && response?.data?.data?.iv) {
//         return apiDecrypt({
//             encryptedData: response.data.data.encryptedData,
//             iv: response.data.data.iv
//         });
//     }
//     return response?.data || {};
// };

export const getRoleByIdApi = async (id) => {
    try {
        const encryptedData = apiEncrypt({ id });

    
        const response = await apiClient.get(
            `${API_BASE}/api/panel/master/role/by-id?iv=${encryptedData.iv}&ed=${encryptedData.encryptedData}`
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
        console.error('Error in getRoleByIdApi:', error);
        throw error;
    }
};



export const updateRoleApi = async (id, roleData) => {
    console.log("roleData", roleData, id)
    const encryptedData = apiEncrypt({ id, ...roleData });
    console.log("encryptedData", encryptedData)

    const response = await apiClient.put(`${API_BASE}/api/panel/master/role`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    
    if (response?.data?.data?.encryptedData && response?.data?.data?.iv) {
        return apiDecrypt({
            encryptedData: response.data.data.encryptedData,
            iv: response.data.data.iv
        });
    }
    return response?.data || {};
};

// Toggle Module Type Status
export const toggleRoleApi = async (id) => {
    const encryptedData = apiEncrypt({ id });
    console.log("encryptedData", encryptedData)
    const response = await apiClient.put(`${API_BASE}/api/panel/master/role/toggle`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    return response;
};




/*------------------------------------------------------------------------------------------
*******************************Menu Master*******************************
------------------------------------------------------------------------------------------*/

export const getAllMenu = async (page = 1, limit = 10) => {
    const response = await apiClient.get(`${API_BASE}/api/panel/master/menu`, { params: { page, limit } });
    if (response?.data?.data) {
        return {
            data: {
                data: apiDecrypt(response.data.data)
            }
        }
    }
    return response.data;
};



export const createMenuData = async (menuData) => {
    const response = await apiClient.post(`${API_BASE}/api/panel/master/menu`, menuData);
    return response;
};


export const getMenuByIdApi = async (id) => {
    try {
        const encryptedData = apiEncrypt({ id });

    
        const response = await apiClient.get(
            `${API_BASE}/api/panel/master/menu/by-id?iv=${encryptedData.iv}&ed=${encryptedData.encryptedData}`
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
        console.error('Error in get MenuByIdApi:', error);
        throw error;
    }
};

    

export const updateMenuData = async (id, menuData) => {
    console.log("menuData", menuData)
    const encryptedData = apiEncrypt({ 
        id, 
        ...menuData 
    });

    console.log("encryptedDataUpdate", encryptedData)

    const response = await apiClient.put(`${API_BASE}/api/panel/master/menu`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    
    // Decrypt the response if it contains encrypted data
    if (response?.data?.data?.encryptedData && response?.data?.data?.iv) {
        return {
            ...response,
            data: apiDecrypt({
                encryptedData: response.data.data.encryptedData,
                iv: response.data.data.iv
            })
        }
    }
    console.log("responseUpdate", response)
    return response;
};

// Toggle Menu Status
export const toggleMenu = async (id) => {
    const encryptedData = apiEncrypt({ id });
    console.log("encryptedData", encryptedData)
    const response = await apiClient.put(`${API_BASE}/api/panel/master/menu/toggle`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    return response;
};


/*
------------------------------------------------------------------------------------------
*******************************ULB Master*******************************
------------------------------------------------------------------------------------------*/

// GET ULB Master
export const getUlbMasterData = async (page = 1, limit = 10) => {
    const response = await apiClient.get(`${API_BASE}/api/panel/master/ulb`, {
      params: { page, limit },
    });
  
    if (response?.data?.data) {
      const decrypted = apiDecrypt(response.data.data);
  
      return {
        data: decrypted.data,        // <- directly the array
        pagination: decrypted.pagination, // <- directly pagination
      };
    }
  
    return {
      data: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
    };
  };
  





// Create ULB Master
export const createUlbMaster = async (formData) => {
  const response = await apiClient.post(
    `${API_BASE}/api/panel/master/ulb`,
    formData
  );
  return response.data; // return only data for easier handling
};

// Update ULB Master
export const updateUlbMaster = async (id, formData) => {
    const payload = { id: id, ...formData };
    console.log('Payload',payload);
  //   const encryptedData = apiEncrypt({ id: numericId, formData });
  const encryptedData = apiEncrypt(payload);
  const response = await apiClient.put(`${API_BASE}/api/panel/master/ulb`, {
    iv: encryptedData.iv,
    ed: encryptedData.encryptedData,
  });
  return response;
};

// Toggle ULB Master Status
export const toggleUlbMaster = async (id) => {
  // Ensure id is passed as an integer
  const numericId = parseInt(id, 10);

  const encryptedData = apiEncrypt({ id:numericId });
  console.log(encryptedData.encryptedData);

  const response = await apiClient.put(
    `${API_BASE}/api/panel/master/ulb/toggle`,
    {
      iv: encryptedData.iv,
      ed: encryptedData.encryptedData,
    }
  );
  return response;
};




/*
------------------------------------------------------------------------------------------
*******************************Bank List*******************************
------------------------------------------------------------------------------------------*/

export const createBankList = async (bankName) => {
  console.log(bankName)
  const response = await apiClient.post(
    `${API_BASE}/api/panel/master/bank`,
    bankName
  );
  return response; // return only data for easier handling
};

export const getBankData = async (page = 1, limit = 10) => {
  const response = await apiClient.get(`${API_BASE}/api/panel/master/bank`, {
    params: { page, limit },
  });
  if (response?.data?.data) {
    return {
      data: {
        data: apiDecrypt(response.data.data),
      },
    };
  }
//   console.log("response", response);
  return response;
};

export const updateBankName = async (id, bankName) => {
  console.log(id,bankName);
  const encryptedData = apiEncrypt({ id, bankName });
  const response = await apiClient.put(`${API_BASE}/api/panel/master/bank`, {
    iv: encryptedData.iv,
    ed: encryptedData.encryptedData,
  });

  // Decrypt the response if it contains encrypted data
  if (response?.data?.data) {
    return {
      ...response,
      data: apiDecrypt(response.data.data),
    };
  }
//   console.log("response", response);
  return response;
};

export const removeBank = async (id) => {

  const numericId = parseInt(id, 10);

  const encryptedData = apiEncrypt({ id:numericId });

  const response = await apiClient.put(
    `${API_BASE}/api/panel/master/bank/toggle`,
    {
      iv: encryptedData.iv,
      ed: encryptedData.encryptedData,
    }
  );
  return response;
};




/*------------------------------------------------------------------------------------------
*******************************Agency Menu*******************************
------------------------------------------------------------------------------------------*/

// {
//     "message": "Data decrypted successfully",
//     "data": {
//         "data": [
//             {
//                 "id": 1,
//                 "name": "Ranchi 11",
//                 "ulb_id": 3,
//                 "created_at": "2025-09-04T09:48:56.138Z",
//                 "recstatus": 0
//             }
//         ],
//         "pagination": 1,
//         "page": 1,
//         "limit": 10,
//         "totalPages": 1
//     }
// }

/**
 * @typedef {Object} AgencyListResponse
 * @property {Array} data - Array of agency objects
 * @property {number} pagination - Total number of items
 * @property {number} totalPages - Total number of pages
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 */

/**
 * @typedef {Object} AgencyApiResponse
 * @property {AgencyListResponse} data - The response data
 */

/**
 * Get all agencies with pagination
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Items per page
 * @returns {Promise<AgencyApiResponse>} - Promise resolving to agency data
 */
export const getAllAgency = async (page = 1, limit = 10) => {
    try {
        const response = await apiClient.get(`${API_BASE}/api/panel/master/agency`, {
            params: { page, limit }
        });
        
        if (response?.data?.data) {
            const decryptedData = apiDecrypt(response.data.data);
            // Ensure the decrypted data has the expected structure
            const typedData = decryptedData || {
                data: [],
                pagination: 0,
                totalPages: 0,
                page: 1,
                limit: 10
            };
            
            return {
                data: typedData
            };
        }
        
        // Fallback structure if no encrypted data
        return {
            data: {
                data: [],
                pagination: 0,
                totalPages: 0,
                page: 1,
                limit: 10
            }
        };
    } catch (error) {
        console.error("Error in getAllAgency:", error);
        // Return consistent structure even on error
        return {
            data: {
                data: [],
                pagination: 0,
                totalPages: 0,
                page: 1,
                limit: 10
            }
        };
    }
};

// Create Agency
export const createAgency = async (agencyData) => {
    const response = await apiClient.post(`${API_BASE}/api/panel/master/agency`, {
        ...agencyData
    });
    return response;
};

// Get ULB List
export const getUlbList = async () => {
    const response = await apiClient.get(`${API_BASE}/api/panel/master/ulbList`);
    return response;
};

// Update Agency
export const updateAgency = async (id, agencyData) => {
    const encryptedData = apiEncrypt({ id, ...agencyData });
    console.log("encryptedData", encryptedData)
    const response = await apiClient.put(`${API_BASE}/api/panel/master/agency`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    
    // Decrypt the response if it contains encrypted data
    if (response?.data?.data) {
        return {
            ...response,
            data: apiDecrypt(response.data.data)
        }
    }
    console.log("response", response)
    return response;
};

// Toggle Agency Status
export const toggleAgency = async (id) => {
    const encryptedData = apiEncrypt({ id });
    console.log("encryptedData", encryptedData)
    const response = await apiClient.put(`${API_BASE}/api/panel/master/agency/toggle`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    return response;
};




/*------------------------------------------------------------------------------------------
*******************************Module Type*******************************
------------------------------------------------------------------------------------------*/
export const getAllModuleType = async (page = 1, limit = 10) => {
    try {
        const response = await apiClient.get(`${API_BASE}/api/panel/master/module`, { 
            params: { page, limit } 
        });
        
        if (response?.data?.data) {
            const decryptedData = apiDecrypt(response.data.data);
            return {
                data: Array.isArray(decryptedData?.data) ? decryptedData.data : [],
                pagination: decryptedData?.pagination || 0,
                page: decryptedData?.page || page,
                limit: decryptedData?.limit || limit,
                totalPages: decryptedData?.totalPages || 1
            };
        }
        
        throw new Error('Invalid response format from server');
    } catch (error) {
        console.error('Error in getAllModuleType:', error);
        return {
            data: [],
            pagination: 0,
            page,
            limit,
            totalPages: 1
        };
    }
};

export const createModuleTypeData = async (moduleName) => {
    // const encryptedData = apiEncrypt({ moduleName });
    const response = await apiClient.post(`${API_BASE}/api/panel/master/module`, {
        ...moduleName
    });
    
    if (response?.data?.data?.encryptedData && response?.data?.data?.iv) {
        return apiDecrypt({
            encryptedData: response.data.data.encryptedData,
            iv: response.data.data.iv
        });
    }
    return response?.data || {};
};

export const updateModuleTypeData = async (id, moduleName) => {
    const encryptedData = apiEncrypt({ id, ...moduleName });

    const response = await apiClient.put(`${API_BASE}/api/panel/master/module`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    
    if (response?.data?.data?.encryptedData && response?.data?.data?.iv) {
        return apiDecrypt({
            encryptedData: response.data.data.encryptedData,
            iv: response.data.data.iv
        });
    }
    return response?.data || {};
};

// Toggle Module Type Status
export const toggleModuleType = async (id) => {
    const encryptedData = apiEncrypt({ id });
    console.log("encryptedData", encryptedData)
    const response = await apiClient.put(`${API_BASE}/api/panel/master/module/toggle`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    return response;
};


/*------------------------------------------------------------------------------------------
*******************************Zone List*******************************
------------------------------------------------------------------------------------------*/

export const getAllZones = async (page = 1, limit = 10) => {
    try {
        const response = await apiClient.get(`${API_BASE}/api/panel/master/zoneList`, { 
            params: { page, limit } 
        });
        
        if (response?.data?.data) {
            const decryptedData = apiDecrypt(response.data.data);
            return {
                data: Array.isArray(decryptedData?.data) ? decryptedData.data : [],
                pagination: decryptedData?.pagination || 0,
                page: decryptedData?.page || page,
                limit: decryptedData?.limit || limit,
                totalPages: decryptedData?.totalPages || 1
            };
        }
        
        throw new Error('Invalid response format from server');
    } catch (error) {
        console.error('Error in getAllZones:', error);
        return {
            data: [],
            pagination: 0,
            page,
            limit,
            totalPages: 1
        };
    }
};

export const createZoneData = async (zoneData) => {
    const response = await apiClient.post(`${API_BASE}/api/panel/master/zoneList`, {
        ...zoneData
    });
    
    if (response?.data?.data?.encryptedData && response?.data?.data?.iv) {
        return apiDecrypt({
            encryptedData: response.data.data.encryptedData,
            iv: response.data.data.iv
        });
    }
    return response?.data || {};
};

export const updateZoneData = async (id, zoneData) => {
    const encryptedData = apiEncrypt({ id, ...zoneData });
    const response = await apiClient.put(`${API_BASE}/api/panel/master/zoneList`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    
    if (response?.data?.data?.encryptedData && response?.data?.data?.iv) {
        return apiDecrypt({
            encryptedData: response.data.data.encryptedData,
            iv: response.data.data.iv
        });
    }
    return response?.data || {};
};

// Toggle Zone Status
export const toggleZone = async (id) => {
    const encryptedData = apiEncrypt({ id });
    const response = await apiClient.put(`${API_BASE}/api/panel/master/zoneList/toggle`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    return response?.data || {};
};



/*------------------------------------------------------------------------------------------
*******************************Ward List*******************************
------------------------------------------------------------------------------------------*/

/**
 * Get all wards with pagination
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Items per page
 * @returns {Promise<WardListResponse>} - Promise resolving to ward data
 */
export const getAllWards = async (page = 1, limit = 10) => {
    try {
        const response = await apiClient.get(`${API_BASE}/api/panel/master/wardList?page=${page}&limit=${limit}`);
        
        if (response?.data?.data?.encryptedData && response?.data?.data?.iv) {
            const decryptedData = await apiDecrypt({
                encryptedData: response.data.data.encryptedData,
                iv: response.data.data.iv
            });
            return {
                data: decryptedData.data || [],
                pagination: decryptedData.pagination || 1,
                page: decryptedData.page || 1,
                limit: decryptedData.limit || 10,
                totalPages: decryptedData.totalPages || 1
            };
        }
        
        return {
            data: [],
            pagination: 1,
            page: 1,
            limit: 10,
            totalPages: 1
        };
    } catch (error) {
        console.error('Error fetching wards:', error);
        return {
            data: [],
            pagination: 1,
            page: 1,
            limit: 10,
            totalPages: 1
        };
    }
};

/**
 * Create a new ward
 * @param {CreateWardData} wardData - Ward data to create
 * @returns {Promise<Object>} - Created ward data
 */
export const createWardData = async (wardData) => {
    try {
        const response = await apiClient.post(`${API_BASE}/api/panel/master/wardList`, {
            zoneCircleId: wardData.zoneCircleId,
            wardNo: wardData.wardNo,
            wardName: wardData.wardName,
            wardCode: wardData.wardCode,
            wardArea: wardData.wardArea
        });
        
        if (response?.data?.data?.encryptedData && response?.data?.data?.iv) {
            return apiDecrypt({
                encryptedData: response.data.data.encryptedData,
                iv: response.data.data.iv
            });
        }
        return response?.data || {};
    } catch (error) {
        console.error('Error creating ward:', error);
        throw error;
    }
};

/**
 * Get a ward by ID
 * @param {number} id - Ward ID
 * @returns {Promise<Ward>} - Ward data
 */


export const getWardById = async (id) => {
    try {
        const encryptedData = apiEncrypt({ id });

    
        const response = await apiClient.get(
            `${API_BASE}/api/panel/master/wardList/by-id?iv=${encryptedData.iv}&ed=${encryptedData.encryptedData}`
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
        console.error('Error in getRoleByIdApi:', error);
        throw error;
    }
};


/**
 * Update an existing ward
 * @param {number} id - Ward ID
 * @param {CreateWardData} wardData - Updated ward data
 * @returns {Promise<Object>} - Updated ward data
 */


export const updateWardData = async (id, wardData) => {
    console.log("wardData", wardData, id)
    const encryptedData = apiEncrypt({ id, ...wardData });
    console.log("encryptedData", encryptedData)

    const response = await apiClient.put(`${API_BASE}/api/panel/master/wardList`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    
    if (response?.data?.data?.encryptedData && response?.data?.data?.iv) {
        return apiDecrypt({
            encryptedData: response.data.data.encryptedData,
            iv: response.data.data.iv
        });
    }
    return response?.data || {};
};

/**
 * Toggle ward status (active/inactive)
 * @param {number} id - Ward ID
 * @returns {Promise<Object>} - Response data
 */
export const toggleWard = async (id) => {
    const encryptedData = apiEncrypt({ id });
    try {
        const response = await apiClient.put(`${API_BASE}/api/panel/master/wardList/toggle`, {
            iv: encryptedData.iv,
            ed: encryptedData.encryptedData
        });
        return response?.data || {};
    } catch (error) {
        console.error('Error toggling ward status:', error);
        throw error;
    }
};



/**
 * Get list of zone circles for dropdown
 * @returns {Promise<Array<{id: number, name: string}>>} - List of zone circles
 */
export const getZoneCircles = async () => {
    try {
        const response = await apiClient.get(`${API_BASE}/api/panel/master/zoneCircleList`);
        
        if (response?.data?.data?.encryptedData && response?.data?.data?.iv) {
            const decryptedData = await apiDecrypt({
                encryptedData: response.data.data.encryptedData,
                iv: response.data.data.iv
            });
            return decryptedData.data?.map(zone => ({
                id: zone.id,
                name: zone.name
            })) || [];
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching zone circles:', error);
        return [];
    }
};

/*------------------------------------------------------------------------------------------
*******************************Permission Master*******************************
------------------------------------------------------------------------------------------*/

// Get all permissions with pagination
// @param {number} [page=1] - Page number
// @param {number} [limit=10] - Items per page
// @returns {Promise<PermissionApiResponse>} - Promise resolving to permission data
export const getAllPermissions = async (page = 1, limit = 10) => {
    try {
        const response = await apiClient.get(`${API_BASE}/api/panel/master/permission`, {
            params: { page, limit }
        });
       
        if (response.data && response.data.data) {
            // Decrypt the data if needed
            const decryptedData = await apiDecrypt(response.data.data);
            return {
                ...response.data,
                data: decryptedData
            };
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching permissions:', error);
        throw error;
    }
};

// Create new permissions
// @param {Object} permissionData - Permission data to create
// @param {number} permissionData.ulb_id - ULB ID
// @param {string[]} permissionData.permission_names - Array of permission names
// @returns {Promise<Object>} - Created permission data
export const createPermission = async (permissionData) => {
    const payload = {
      ulb_id: permissionData.ulb_id,
      permission_names: permissionData.permission_names
    };
    
    console.log("Sending payload to /api/panel/master/permission:", payload);
    
    const response = await apiClient.post(`${API_BASE}/api/panel/master/permission`, payload);
    
    if (response?.data?.data?.encryptedData && response?.data?.data?.iv) {
      return apiDecrypt({
        encryptedData: response.data.data.encryptedData,
        iv: response.data.data.iv,
      });
    }
    return response?.data || {};
  };



  //get permission by ID
  //{{base_url}}/api/panel/master/permission/by-id?iv=0fb921a3cff917ce74a10f81eed5d79b&ed=7578d75a41a9297290fc1c15ead63bc8

  export const getPermissionById = async (id) => {
    const encryptedData = apiEncrypt({ id });
    try {
      const response = await apiClient.get(`${API_BASE}/api/panel/master/permission/by-id`, {
        params: { iv: encryptedData.iv, ed: encryptedData.encryptedData }
      });
      return response?.data || {};
    } catch (error) {
      console.error('Error fetching permission by ID:', error);
      throw error;
    }
  };


// Update existing permissions
// @param {number} id - Permission ID
// @param {Object} permissionData - Updated permission data
// @param {number} permissionData.ulb_id - ULB ID
// @param {string[]} permissionData.permission_names - Array of permission names
// @returns {Promise<Object>} - Updated permission data
export const updatePermission = async (id, permissionData) => {
    console.log("Updating permission with ID:", id, "Data:", permissionData);
    
    const payload = {
      id,
      ulb_id: permissionData.ulb_id,
      permission_names: permissionData.permission_names,
    };
  
    const encryptedData = apiEncrypt(payload);
  
    const response = await apiClient.put(`${API_BASE}/api/panel/master/permission`, {
      iv: encryptedData.iv,
      ed: encryptedData.encryptedData,
    });
  
  
    if (response?.data?.data?.encryptedData && response?.data?.data?.iv) {
      return apiDecrypt({
        encryptedData: response.data.data.encryptedData,
        iv: response.data.data.iv,
      });
    }
  
    return response?.data || {};
  };
  

// Toggle permission status (active/inactive)
// @param {number} id - Permission ID
// @returns {Promise<Object>} - Response data

export const togglePermission = async (id) => {
    const encryptedData = apiEncrypt({ id });
    const response = await apiClient.put(`${API_BASE}/api/panel/master/permission/toggle`, {
        iv: encryptedData.iv,
        ed: encryptedData.encryptedData
    });
    return response;
};


/*------------------------------------------------------------------------------------------
*******************************Others*******************************
------------------------------------------------------------------------------------------*/

// ... rest of the code remains the same ...

export const getPanelMenuData = async () => {
    return await axios.get(`${API_BASE}/ulbtypeList`);
};





export const getSidebarMenu = async () => {
    return await axios.get(`${API_BASE}/sidebarMenu`);
};

export const getMenuOptions = async () => {
    return await axios.get(`${API_BASE}/menuOptions`);
};

export const getMenuById = async (id) => {
    return await axios.get(`${API_BASE}/menuList/${id}`);
};

export const createMenu = async (menuData) => {
    return await axios.post(`${API_BASE}/menuList`, menuData);
};

export const updateMenu = async (id, menuData) => {
    return await axios.put(`${API_BASE}/menuList/${id}`, menuData);
};

export const deleteMenu = async (id) => {
    return await axios.delete(`${API_BASE}/menuList/${id}`);
};