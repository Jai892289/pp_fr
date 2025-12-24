import { apiClient } from "@/lib/apiClient";
import { apiDecrypt, decrypt } from "@/lib/cryptography";
import { apiEncrypt } from "@/lib/cryptography";
import axios from "axios";
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const getChartData = async () => {
  const response = await apiClient.get(
    `${API_BASE}/api/dashboard/get-chart-data`
  );

  console.log("response ", response.data);

  // if (response?.data) {
  //   return {
  //     data: {
  //       data: apiDecrypt(response?.data?.data),
  //     },
  //   };
  // } else {
  //   return response?.data;
  // }
  return response?.data;
};

export const getMapData = async ({
  id,
  role,
  date,
}: {
  id?: number;
  role?: string;
  date?: string;
}) => {
  const response = await apiClient.get(
    `${API_BASE}/api/dashboard/get-map-data`,
    {
      params: {
        id,
        role: role?.toLowerCase(), // ✅ normalize
        date,
      },
    }
  );

  console.log("Map API raw response:", response.data); // 🧠 Add this log

  // Adjust based on actual backend structure
  return response?.data?.data; // ✅ this should match your backend key
};

export const getUserListByRole = async (role: string) => {
  const response = await apiClient.get(
    `${API_BASE}/api/dashboard/get-user-list/${role}`
  );

  console.log("response ", response.data.data);

  // const decrypted = apiDecrypt(response.data);

  return response?.data?.data;
};
