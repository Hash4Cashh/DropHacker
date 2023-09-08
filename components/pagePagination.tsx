import React from "react";

interface IProps {
    page: number;
    setPage: (newValue: any) => any;
    totalPages: number;
}
export default function PagePagination({page, setPage, totalPages}: IProps) {
  return (
    <div className="flex flex-inline gap-4 items-center">
      <button
        // className="inline-flex items-center px-4 py-2 mr-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        className={`btn btn-regular sm flex flex-inline items-center ${page == 0 ? "disabled": ""}`}
        disabled={page == 0}
        onClick={() => setPage((oldValue: number) => oldValue - 1)}
      >
        <svg
          aria-hidden="true"
          className="w-5 h-5 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
        Previous
      </button>
      <div className="text-xl">
        { page + 1 } <span style={{opacity: .3}}>/ {totalPages}</span>
      </div>
      <button
        className={`btn btn-regular sm flex flex-inline items-center ${page + 1 == totalPages ? "disabled": ""}`}
        onClick={() => setPage((oldValue: number) => oldValue + 1)}
        disabled={page + 1 == totalPages}
      >
        Next
        <svg
          aria-hidden="true"
          className="w-5 h-5 ml-2"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
    </div>
  );
}
