import React from "react";

import Loader from "../components/Loader";
import popup from "../extension/popup.html";

export default function Extension() {
  const [iframeLoaded, setIframeLoaded] = React.useState(false);
  return (
    <>
      <iframe
        onLoad={() => setIframeLoaded(true)}
        src={popup}
        className="flex-1 border-none"
      ></iframe>
      {!iframeLoaded && <Loader />}
    </>
  );
}
