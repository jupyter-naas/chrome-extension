import React from "react";
import Loader from "../components/Loader";

export default function Search() {
  const [iframeLoaded, setIframeLoaded] = React.useState(false);
  return (
    <>
      <iframe
        onLoad={() => setIframeLoaded(true)}
        src="https://naas.ai/search"
        className="flex-1 border-none"
      ></iframe>
      {!iframeLoaded && <Loader />}
    </>
  );
}
