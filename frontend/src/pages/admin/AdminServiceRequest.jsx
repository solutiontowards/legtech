import React, { useEffect, useState, useMemo } from "react";
import { adminListSubmissions, getAllServices } from "../../api/admin";
import { listServices } from "../../api/services";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Eye, FileDown, FilterX, Search, Filter } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminServiceRequest = () => {
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");

  // Filters
  const [stagedFilters, setStagedFilters] = useState({
    serviceId: "",
    subServiceId: "",
    optionId: "",
  });
  const [activeFilters, setActiveFilters] = useState({
    serviceId: "",
    subServiceId: "",
    optionId: "",
  });

  const [subServiceOptions, setSubServiceOptions] = useState([]);
  const [optionOptions, setOptionOptions] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [subsRes, servicesRes] = await Promise.all([
          adminListSubmissions(),
          getAllServices(),
        ]);
        setAllSubmissions(subsRes.data?.subs || []);
        setServices(servicesRes.data?.services || []);
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter Logic
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setStagedFilters((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "serviceId") {
        updated.subServiceId = "";
        updated.optionId = "";
        const selected = services.find((s) => s._id === value);
        setSubServiceOptions(selected?.subServices || []);
        setOptionOptions([]);
      }
      if (name === "subServiceId") {
        updated.optionId = "";
        const selected = subServiceOptions.find((s) => s._id === value);
        setOptionOptions(selected?.options || []);
      }
      return updated;
    });
  };

  const applyFilters = () => {
    setActiveFilters(stagedFilters);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setStagedFilters({ serviceId: "", subServiceId: "", optionId: "" });
    setActiveFilters({ serviceId: "", subServiceId: "", optionId: "" });
    setSubServiceOptions([]);
    setOptionOptions([]);
  };

  // Filtered Data
  const filteredSubmissions = useMemo(() => {
    let filtered = [...allSubmissions];
    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.retailerId?.name
            ?.toLowerCase()
            ?.includes(search.toLowerCase()) ||
          s.data?.fullName?.toLowerCase()?.includes(search.toLowerCase()) ||
          s.data?.email?.toLowerCase()?.includes(search.toLowerCase())
      );
    }
    if (activeFilters.serviceId)
      filtered = filtered.filter(
        (s) => s.serviceId?._id === activeFilters.serviceId
      );
    if (activeFilters.subServiceId)
      filtered = filtered.filter(
        (s) => s.optionId?.subServiceId?._id === activeFilters.subServiceId
      );
    if (activeFilters.optionId)
      filtered = filtered.filter((s) => s.optionId?._id === activeFilters.optionId);
    return filtered;
  }, [search, activeFilters, allSubmissions]);

  // Export Logic
  const handleExport = (type) => {
    if (filteredSubmissions.length === 0) {
      toast.error("No data to export");
      return;
    }
    const exportData = filteredSubmissions.map((s) => ({
      Retailer: s.retailerId?.name || "N/A",
      Service: s.serviceId?.name || "N/A",
      "Sub-Service": s.optionId?.subServiceId?.name || "N/A",
      Option: s.optionId?.name || "N/A",
      Amount: `₹${s.amount?.toFixed(2) || "0.00"}`,
      "Payment Method": s.paymentMethod || "N/A",
      "Payment Status": s.paymentStatus || "N/A",
      Status: s.status || "N/A",
      Date: new Date(s.createdAt).toLocaleDateString(),
      "Admin Remarks": s.adminRemarks || "-",
    }));

    if (type === "excel") {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Submissions");
      XLSX.writeFile(wb, "Submissions.xlsx");
    } else if (type === "pdf") {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [Object.keys(exportData[0])],
        body: exportData.map((r) => Object.values(r)),
      });
      doc.save("Submissions.pdf");
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const currentData = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Service Requests
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport("excel")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition text-sm font-semibold"
          >
            <FileDown size={16} /> Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition text-sm font-semibold"
          >
            <FileDown size={16} /> PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <select
            name="serviceId"
            value={stagedFilters.serviceId}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Services</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            name="subServiceId"
            value={stagedFilters.subServiceId}
            onChange={handleFilterChange}
            disabled={!stagedFilters.serviceId}
            className="p-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            <option value="">All Sub-Services</option>
            {subServiceOptions.map((ss) => (
              <option key={ss._id} value={ss._id}>
                {ss.name}
              </option>
            ))}
          </select>
          <select
            name="optionId"
            value={stagedFilters.optionId}
            onChange={handleFilterChange}
            disabled={!stagedFilters.subServiceId}
            className="p-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            <option value="">All Options</option>
            {optionOptions.map((o) => (
              <option key={o._id} value={o._id}>
                {o.name}
              </option>
            ))}
          </select>
          <button
            onClick={applyFilters}
            className="flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm px-3 py-2"
          >
            <Filter size={16} /> Apply
          </button>
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm px-3 py-2"
          >
            <FilterX size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm mb-4 p-3 flex justify-between items-center flex-wrap gap-3 border border-gray-100">
        <h3 className="font-semibold text-gray-700 text-sm md:text-base">
          Total Submissions:{" "}
          <span className="text-green-700 font-bold">
            {filteredSubmissions.length}
          </span>
        </h3>
        <div className="relative w-full md:w-72">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by retailer, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              {[
                "Action",

                "Retailer",
                "Service",
                "Sub-Service",
                "Option",
                "Amount",
                "Payment Method",
                "Payment Status",
                "Status",
                "Admin Remarks",
                "Date",
              ].map((col) => (
                <th key={col} className="p-4 font-semibold whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="11" className="text-center p-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((sub) => (
                <tr
                  key={sub._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 text-center">
                    <Link
                      to={`/st-admin/view-submission/${sub._id}`}
                      className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 inline-block"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                  <td className="p-4 font-medium text-gray-800">
                    {sub.retailerId?.name || "N/A"}
                  </td>
                  <td className="p-4 text-gray-600">{sub.serviceId?.name}</td>
                  <td className="p-4 text-gray-600">
                    {sub.optionId?.subServiceId?.name}
                  </td>
                  <td className="p-4 text-gray-600">{sub.optionId?.name}</td>
                  <td className="p-4 text-gray-700 font-semibold">
                    ₹{sub.amount?.toFixed(2)}
                  </td>
                  <td className="p-4 text-gray-600">{sub.paymentMethod}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${sub.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : sub.paymentStatus === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {sub.paymentStatus || "N/A"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${sub.status === "Applied"
                        ? "bg-blue-100 text-blue-700"
                        : sub.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : sub.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td
                    className="p-4 text-gray-600 truncate max-w-xs"
                    title={sub.adminRemarks}
                  >
                    {sub.adminRemarks || "-"}
                  </td>
                  <td className="p-4 text-gray-500 whitespace-nowrap">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="11"
                  className="text-center p-6 text-gray-500 font-medium"
                >
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-50 text-sm"
          >
            Prev
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminServiceRequest;
