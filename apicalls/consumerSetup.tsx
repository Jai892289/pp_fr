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
  data: any[]; // or replace `any[]` with your actual DTO type
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getConsumerDataList = async (
  page: number,
  limit: number,
  opts?: {
    searchValue?: string | null;
    tagged?: string | null;
  }
): Promise<ConsumerDataResponse> => {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));

  if (opts?.searchValue) params.append("searchValue", opts.searchValue);
  if (opts?.tagged) params.append("tagged", opts.tagged);

  // Build payload dynamically (skip undefined/null fields)
  const payload: Record<string, any> = { page, limit };
  if (opts?.searchValue) payload.searchValue = opts.searchValue;
  if (opts?.tagged) payload.tagged = opts.tagged;

  // const encryptedData = apiEncrypt(payload);

  const response = await apiClient.get(
    `${API_BASE}/api/consumer/get-consumer-list?${params}`
  );

  try {
    // if (response?.data?.data) {
    //   // 🔒 Explicitly typecast decrypted output
    //   const decrypted = apiDecrypt(response.data.data) as {
    //     data?: any[];
    //     pagination?: ConsumerDataResponse["pagination"];
    //   };

    //   return {
    //     data: decrypted.data ?? [],
    //     pagination: decrypted.pagination ??
    //       response.data.pagination ?? {
    //         total: 0,
    //         page,
    //         limit,
    //         totalPages: 0,
    //       },
    //   };
    // }

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
