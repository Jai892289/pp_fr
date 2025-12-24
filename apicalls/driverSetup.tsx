import { apiClient } from "@/lib/apiClient";
import { apiDecrypt, decrypt } from "@/lib/cryptography";
import { apiEncrypt } from "@/lib/cryptography";
import axios from "axios";
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

interface ConsumerDataResponse {
  data: any[]; // or replace any[] with your actual DTO type
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// export const getDriversDataList = async (
//   page: number,
//   limit: number,
//   opts?: {
//     date_from?: string | null;
//     date_upto?: string | null;
//     searchValue?: string | null;
//     today?: string | null; // ✅ added
//   }
// ) => {
//   const params = new URLSearchParams();
//   params.append("page", String(page));
//   params.append("limit", String(limit));
//   params.append("today", opts?.today ?? "true"); // ✅ use passed value or default true

//   if (opts?.date_from) params.append("date_from", opts.date_from);
//   if (opts?.date_upto) params.append("date_upto", opts.date_upto);
//   if (opts?.searchValue) params.append("searchValue", String(opts.searchValue));

//   const payload: Record<string, any> = { page, limit };
//   if (opts?.today) payload.today = opts.today;
//   if (opts?.date_from) payload.today = opts.date_from;
//   if (opts?.date_upto) payload.today = opts.date_upto;
//   if (opts?.searchValue) payload.today = opts.searchValue;

//   const encryptedData = apiEncrypt(payload);
//   const response = await apiClient.get(
//     `${API_BASE}/api/driver/get-waste-collection-list?iv=${encryptedData.iv}&encryptedData=${encryptedData.encryptedData}`
//   );

//   if (response?.data?.data) {
//     // 🔒 Explicitly typecast decrypted output
//     const decrypted = apiDecrypt(response.data.data) as {
//       data?: any[];
//       pagination?: ConsumerDataResponse["pagination"];
//     };

//     return {
//       data: decrypted.data ?? [],
//       pagination: decrypted.pagination ??
//         response.data.pagination ?? {
//           total: 0,
//           page,
//           limit,
//           totalPages: 0,
//         },
//     };
//   }

//   if (response?.data?.data) {
//     return {
//       data: response.data.data,
//       pagination: response.data.pagination,
//     };
//   }

//   return {
//     data: [],
//     pagination: { total: 0, page: 1, limit, totalPages: 0 },
//   };
// };

// export const getDriversDetails = async (id: number) => {
//   const response = await apiClient.get(
//     `${API_BASE}/api/driver/get-waste-collection-details/${id}`
//   );

//   console.log("response ", response.data);

//   return response.data;
// };


export const getDriversDataList = async (
  page: number,
  limit: number,
  opts?: {
    date_from?: string | null;
    date_upto?: string | null;
    searchValue?: string | null;
    today?: string | null;
  }
) => {
  const params = new URLSearchParams();

  params.append("page", String(page));
  params.append("limit", String(limit));
  params.append("today", opts?.today ?? "true");

  if (opts?.date_from) params.append("date_from", opts.date_from);
  if (opts?.date_upto) params.append("date_upto", opts.date_upto);
  if (opts?.searchValue) params.append("searchValue", opts.searchValue);

  try {
    const response = await apiClient.get(
      `${API_BASE}/api/driver/get-waste-collection-list?${params.toString()}`
    );

    const result = response?.data?.data;

    if (result?.data) {
      return {
        data: result.data, // ✅ actual driver list array
        pagination: result.pagination, // ✅ pagination info
        message: response.data?.message ?? "Success",
      };
    }

    // ✅ fallback if no data found
    return {
      data: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
      message: response?.data?.message ?? "No Data Found",
    };
  } catch (error: any) {
    console.error("Error fetching drivers data:", error);
    return {
      data: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
      message: "Error fetching data",
    };
  }
};


export const getDriversDetails = async (id: number) => {
  // const encryptedData = apiEncrypt({ id });
  const response = await apiClient.post(
    `${API_BASE}/api/driver/get-waste-collection-details`,
    {
     id: id
    }
  );

  return response.data
};
