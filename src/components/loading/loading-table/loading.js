import React from "react";
import { BounceLoader } from "react-spinners";

const TableLoading = () => {
  return (
    <div className="table-loading-container flex justify-center">
      <BounceLoader color="#9D4B5B" size={60} />
    </div>
  );
};

export default TableLoading;
