import { apiClient } from "@/lib/apiClient";
import { apiDecrypt } from "@/lib/cryptography"
import { apiEncrypt } from "@/lib/cryptography"


const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

export const menuMaster = async () => {
    const response = await apiClient.get(`${API_BASE}/api/panel/master/employee/getMenuWithEmployee-id`);

    return response    
};