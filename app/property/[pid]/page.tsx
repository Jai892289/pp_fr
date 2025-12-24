"use client";

import { getProperty } from "@/apicalls/property";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin } from 'lucide-react';
import { encrypt } from "@/lib/hashEncrypt";

export default function Property() {
  const [property, setProperty] = useState<any>({})
  const params = useParams();
  const pid = params.pid
  const router = useRouter();

  useEffect(() => {
    if (pid) {
      const getPropertyData = async () => {
        const response = await getProperty(String(pid))
        setProperty(response.data?.data)
        router.push(`/citizen-login?mobile=${encrypt(response.data?.data?.mobile)}`);
      }
      getPropertyData()
    }
  }, [pid])

  if (!property) return <p>Loading...</p>;

  return null
}
