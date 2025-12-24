import axios from "axios"


const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}`;

export const downloadApp = async (onDownloadProgress:any) => {
    return await axios.get(`${API_BASE}/api/download/survey-app`, {
        responseType: 'blob',
        onDownloadProgress
    })
}