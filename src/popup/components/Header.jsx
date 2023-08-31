import React from "react";

const NavItem = ({ children, page, currentPage, setPage }) => {
  return (
    <div
      className={`${
        currentPage === page
          ? "text-primary border-primary"
          : "text-[#747677] border-transparent"
      } py-3 cursor-pointer border-b-2 font-bold  transition-colors duration-200 ease-in-out`}
      onClick={() => setPage(page)}
    >
      {children}
    </div>
  );
};

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
    <header className="border-b border-[#747677]">
      <nav className="flex items-center gap-4 px-2">
        <NavItem
          page="search"
          currentPage={currentPage}
          setPage={handlePageChange}
        >
          Search
        </NavItem>
        <NavItem
          page="chat"
          currentPage={currentPage}
          setPage={handlePageChange}
        >
          Chat
        </NavItem>
        <NavItem
          page="dashboard"
          currentPage={currentPage}
          setPage={handlePageChange}
        >
          Dashboard
        </NavItem>
        <NavItem
          page="extension"
          currentPage={currentPage}
          setPage={handlePageChange}
        >
          Extension
        </NavItem>
      </nav>
    </header>
  );
}
