import React from "react";
import Loader from "../components/Loader";

export default function Dashboard() {
  const [iframeLoaded, setIframeLoaded] = React.useState(false);
  return (
    <>
      <iframe
        onLoad={() => setIframeLoaded(true)}
        src="https://naas.ai/"
        className="flex-1 border-none"
      ></iframe>
      {!iframeLoaded && <Loader />}
    </>
  );
}
