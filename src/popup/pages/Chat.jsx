import React from "react";
import Loader from "../components/Loader";

export default function Chat() {
  const [iframeLoaded, setIframeLoaded] = React.useState(false);
  return (
    <>
      <iframe
        onLoad={() => setIframeLoaded(true)}
        src="https://naas.ai/chat"
        className="flex-1 border-none"
      ></iframe>
      {!iframeLoaded && <Loader />}
    </>
  );
}
