import axios from "axios"


const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

export const getProperty = async (pid: string) => {
    return await axios.get(`${API_BASE}/api/property/${pid}`)
}