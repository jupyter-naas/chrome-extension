import React from "react";

export default function Header(props) {
  const [currentPage, setCurrentPage] = React.useState("search");
  const handlePageChange = (page) => {
    setCurrentPage(page);
    props.setPage(page);
    chrome.storage.local.set({ page });
  };

  React.useEffect(() => {
    setCurrentPage(props.page);
  }, [props.page]);
  return (
    <header className="border-b border-black">
      <nav className="flex items-center gap-2 px-2">
        {/* <span>Page:</span> */}
        <select
          onChange={(e) => handlePageChange(e.target.value)}
          className="py-2 text-center outline-none cursor-pointer bg-secondary bg-opacity-90"
          value={currentPage}
        >
          <option value="search">Naas Search</option>
          <option value="chat">Naas Chat</option>
          <option value="dashboard">Naas Dashboard</option>
          <option value="extension">Extension</option>
        </select>
      </nav>
    </header>
  );
}
