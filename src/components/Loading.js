import React from "react";
import { ThreeDot } from "react-loading-indicators";

const Loading = ({ text = "Memuat data...", color = "#ffa726" }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <ThreeDot color={color} size="medium" />
      <p className="mt-3 text-sm text-orange-400">{text}</p>
    </div>
  );
};


export default Loading;
