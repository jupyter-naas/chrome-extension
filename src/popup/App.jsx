import React from "react";
// import Header from "./components/Header";
// import Extension from "./pages/Extension";
// import Search from "./pages/Search";
// import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [page, setPage] = React.useState("dashboard");

  // React.useEffect(() => {
  //   chrome.storage.local.get(["page"], (result) => {
  //     if (result.page) {
  //       setPage(result.page);
  //     }
  //   });
  // }, []);

  return (
    <main className="flex flex-col h-screen">
      {/* <Header page={page} setPage={setPage} /> */}

      {/* pages */}
      <div className={`relative flex flex-col flex-1 `}>
        {/* {page === "search" && <Search />}
        {page === "extension" && <Extension />}
        {page === "chat" && <Chat />} */}
        {page === "dashboard" && <Dashboard />}
      </div>
    </main>
  );
}
