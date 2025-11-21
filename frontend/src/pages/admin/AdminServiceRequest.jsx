import React, { useEffect, useState, useMemo } from "react";
import { adminListSubmissions, getAllServices } from "../../api/admin";
import { listServices } from "../../api/services";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Eye, FileDown, FilterX, Search, Filter, Loader2, Inbox, Globe } from "lucide-react";
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
    const exportData = filteredSubmissions.map((s, index) => ({
      "Serial No": (currentPage - 1) * itemsPerPage + index + 1,
      "Customer Name": s.retailerId?.name || "N/A",
      "Retailer Mobile": s.retailerId?.mobile || "N/A",
      "Service": s.serviceId?.name || "N/A",
      "Sub-Service": s.optionId?.subServiceId?.name || "N/A",
      "Option": s.optionId?.name || "N/A",
      "Mode": "Web",
      "Amount": `₹${s.amount?.toFixed(2) || "0.00"}`,
      "Payment Method": s.paymentMethod || "N/A",
      "Status": s.status || "N/A",
      "Payment Status": s.paymentStatus || "N/A",
      "Sub-Status": s.adminRemarks || "-",
      "Application No": "N/A",
      "PDF Status": "No",
      "Apply Date & Time": new Date(s.createdAt).toLocaleString(),
      "Month": new Date(s.createdAt).toLocaleString("default", {
        month: "long",
      }),
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
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
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
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <select
            name="serviceId"
            value={stagedFilters.serviceId}
            onChange={handleFilterChange}
            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
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
            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
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
            className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm px-4 py-2"
          >
            <Filter size={16} /> Apply
          </button>
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold text-sm px-4 py-2"
          >
            <FilterX size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 flex justify-between items-center flex-wrap gap-3 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-800 text-base">
            Your Submissions ({filteredSubmissions.length})
        </h3>
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search submissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-auto" style={{ maxHeight: '60vh' }}>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-50">
              <tr>
                {[
                  "Serial No",
                  "Action",
                  "Customer Name",
                  "Retailer Mobile",
                  "Service",
                  "Sub-Service",
                  "Option",
                  "Mode",
                  "Amount",
                  "Payment Method",
                  "Status",
                  "Payment Status",
                  "Sub-Status",
                  "Application No",
                  "PDF Status",
                  "Apply Date & Time",
                  "Month",
                ].map((col) => (
                  <th key={col} className="p-4 font-semibold whitespace-nowrap tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="17" className="text-center p-10">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500">Loading submissions...</p>
                  </td>
                </tr>
              ) : currentData.length > 0 ? (
                currentData.map((sub, index) => (
                  <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                  <td className="p-4 text-center">
                    <Link
                      to={`/st-admin/view-submission/${sub._id}`}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 inline-block transition-colors" title="View Details"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    {sub.retailerId?.name || "N/A"}
                  </td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">{sub.retailerId?.mobile || "N/A"}</td>
                  <td className="p-4 text-gray-800 whitespace-nowrap">{sub.serviceId?.name}</td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    {sub.optionId?.subServiceId?.name}
                  </td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">{sub.optionId?.name}</td>
                  <td className="p-4 text-gray-700 whitespace-nowrap">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-md bg-white/40 text-gray-800 border border-gray-200 shadow-sm">
                      <Globe size={12} className="opacity-80" />
                      Web
                    </span>
                  </td>
                  <td className="p-4 text-gray-800 font-bold whitespace-nowrap">
                    ₹{sub.amount?.toFixed(2) || "0.00"}
                  </td>
                  <td className="p-4 text-gray-600 whitespace-nowrap capitalize">
                    {sub.paymentMethod || "N/A"}
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${sub.status === "Submitted" ? "bg-blue-100 text-blue-700" : sub.status === "Completed" ? "bg-green-100 text-green-700" : sub.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`} >
                      {sub.status}
                    </span>
                  </td>
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
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    {sub.adminRemarks || "-"}
                  </td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">N/A</td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">No</td>
                  <td className="p-4 text-gray-500 whitespace-nowrap">
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-500 whitespace-nowrap">
                    {new Date(sub.createdAt).toLocaleString("default", { month: "long", })}
                  </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="17" className="text-center p-10">
                    <Inbox className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="mt-3 font-semibold text-gray-700">No Submissions Found</p>
                    <p className="text-sm text-gray-500">
                      Try adjusting your filters or search term.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 text-sm font-semibold"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 text-sm font-semibold"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminServiceRequest;
