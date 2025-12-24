import { apiClient } from "@/lib/apiClient";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

export const getUserCharge = async () => {
    const response = await apiClient.get(`${API_BASE}/api/citizen/user-charge`);
    return response
};

export const createGrievance = async (data: any) => {
    const response = await apiClient.post(`${API_BASE}/api/citizen/grievance`, data);
    return response
};

export const createOdc = async (data: any) => {
    const response = await apiClient.post(`${API_BASE}/api/citizen/odc`, data);
    return response
};

export const getVehicleTypes = async () => {
    const response = await apiClient.get(`${API_BASE}/api/citizen/vehicle-type`);
    return response
};

// export const getGrievances = async () => {
//     const response = await apiClient.post(`${API_BASE}/api/citizen/grievance`);
//     return response
// };

export const getOdc = async (
    page: number,
    limit: number,
    opts?: {
        searchValue?: string | null;
        tagged?: string | null;
    }
): Promise<any> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));

    if (opts?.searchValue) params.append("searchValue", opts.searchValue);
    if (opts?.tagged) params.append("tagged", opts.tagged);

    // Build payload dynamically (skip undefined/null fields)
    const payload: Record<string, any> = { page, limit };
    if (opts?.searchValue) payload.searchValue = opts.searchValue;
    if (opts?.tagged) payload.tagged = opts.tagged;

    const response = await apiClient.get(
        `${API_BASE}/api/citizen/odc`
    );

    try {

        return response.data;
    } catch (error) {
        console.error("Decryption failed:", error);
    }

    // Default fallback response
    return {
        data: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
    };
};

export const getOdcNotForCitizen = async (
    page: number,
    limit: number,
    opts?: {
        searchValue?: string | null;
        tagged?: string | null;
    }
): Promise<any> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));

    if (opts?.searchValue) params.append("searchValue", opts.searchValue);
    if (opts?.tagged) params.append("tagged", opts.tagged);

    // Build payload dynamically (skip undefined/null fields)
    const payload: Record<string, any> = { page, limit };
    if (opts?.searchValue) payload.searchValue = opts.searchValue;
    if (opts?.tagged) payload.tagged = opts.tagged;

    const response = await apiClient.get(
        `${API_BASE}/api/odc`
    );

    try {

        return response.data;
    } catch (error) {
        console.error("Decryption failed:", error);
    }

    // Default fallback response
    return {
        data: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
    };
};

export const getGrievances = async (
    page: number,
    limit: number,
    opts?: {
        searchValue?: string | null;
        tagged?: string | null;
    }
): Promise<any> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));

    if (opts?.searchValue) params.append("searchValue", opts.searchValue);
    if (opts?.tagged) params.append("tagged", opts.tagged);

    // Build payload dynamically (skip undefined/null fields)
    const payload: Record<string, any> = { page, limit };
    if (opts?.searchValue) payload.searchValue = opts.searchValue;
    if (opts?.tagged) payload.tagged = opts.tagged;

    const response = await apiClient.get(
        `${API_BASE}/api/citizen/grievance`
    );

    try {

        return response.data;
    } catch (error) {
        console.error("Decryption failed:", error);
    }

    // Default fallback response
    return {
        data: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
    };
};