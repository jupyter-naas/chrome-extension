import React from "react";

export default function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-gray-200 rounded-full border-t-black animate-spin"></div>
    </div>
  );
}
