"use client";

import { useState } from "react";
import { FaAndroid } from "react-icons/fa";
import { motion } from "framer-motion";
import { downloadApp } from "@/apicalls/download";

export default function Download() {
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setProgress(0);

      const response = await downloadApp((event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        }
      });

      // Extract filename
      const disposition = response.headers["content-disposition"];
      let filename = "panipat-app.apk";
      if (disposition) {
        const match = disposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, "");
        }
      }

      // Download blob
      const blob = new Blob([response.data], {
        type: "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("APK download failed:", error);
      alert("Failed to download");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Normal Download Button */}
      <motion.button
        onClick={handleDownload}
        disabled={downloading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-md 
                    text-white bg-blue-600
                    ${downloading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <FaAndroid className="text-xl" />
        {downloading ? "Downloading..." : "Download App"}
      </motion.button>

      {/* Progress Bar */}
      {downloading && (
        <div className="mt-3 w-48 sm:w-56 md:w-64">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut", duration: 0.2 }}
              className="h-2 bg-blue-600 rounded-full"
            />
          </div>
          <p className="mt-1 text-sm text-center text-gray-700 font-medium">
            {progress}%
          </p>
        </div>
      )}
    </div>
  );
}
