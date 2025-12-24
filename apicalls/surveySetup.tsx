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

interface ConsumerDataResponse {
  data: any[]; // or replace any[] with your actual DTO type
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getSurveyDataList = async (
  page: number,
  limit: number,
  opts?: {
    date_from?: string | null;
    date_upto?: string | null;
    searchValue?: string | null;
    today?: string | null; // optional
  }
) => {
  const params = new URLSearchParams();

  params.append("page", String(page));
  params.append("limit", String(limit));
  params.append("today", opts?.today ?? "true"); // default true

  if (opts?.date_from) params.append("date_from", opts.date_from);
  if (opts?.date_upto) params.append("date_upto", opts.date_upto);
  if (opts?.searchValue) params.append("searchValue", opts.searchValue);

  const response = await apiClient.get(
    `${API_BASE}/api/survey/get-survey-list?${params.toString()}`
  );

  // ✅ Adjust for nested structure
  const result = response?.data?.data;

  if (result?.data) {
    return {
      data: result.data, // survey list array
      pagination: result.pagination, // pagination object
      message: response.data?.message ?? "Success",
    };
  }

  // ✅ Fallback return structure
  return {
    data: [],
    pagination: { total: 0, page: 1, limit, totalPages: 0 },
    message: response?.data?.message ?? "No Data Found",
  };
};


export const getSurveyDetails = async (id: number) => {
  // const encryptedData = apiEncrypt({ id });
  const response = await apiClient.post(
    `${API_BASE}/api/survey/get-survey-details`,
    {
      id: id,
    }
  );

  // if (response.data) {
  //   return {
  //     data: apiDecrypt(response.data.data),
  //   };
  // } else {
  //   return response;
  // }

  return response.data;
};

export const getSurveyDashboardCount = async () => {
  const response = await apiClient.get(
    `${API_BASE}/api/survey/get-survey-dashboard-count`
  );

  return response?.data;
};

// export const getSurveyDashboardCount = async () => {

//   const response = await apiClient.get(
//     `${API_BASE}/api/survey/get-survey-dashboard-count`
//   );

//   console.log("response ", response.data);

//   return response.data;
// };
