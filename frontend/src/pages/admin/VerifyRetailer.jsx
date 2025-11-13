import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getPendingRetailers } from "../../api/admin";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, FileSpreadsheet, FileText, ChevronLeft, ChevronRight } from "lucide-react";

const VerifyRetailer = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Load pending retailers
  async function load() {
    try {
      setLoading(true);
      const { data } = await getPendingRetailers(); // Fetch only pending KYC retailers
      setList(data?.pending || []);
    } catch (err) {
      toast.error("Failed to load retailers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Search filter
  const filtered = list.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.mobile?.includes(search)
  );

  const getKycStatus = (retailer) => {
    if (retailer.kycDetails?.status === 'pending') return <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Pending</span>;
    if (retailer.kycDetails?.status === 'rejected') return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Rejected</span>;
    return <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">Not Submitted</span>;
  };

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visible = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Export to Excel (exclude sensitive fields)
  const exportToExcel = () => {
    const cleanData = filtered.map(
      ({ passwordHash, __v, walletId, ...rest }) => ({
        ...rest,
        createdAt: new Date(rest.createdAt).toLocaleString(),
      })
    );
    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pending Retailers");
    XLSX.writeFile(wb, "PendingRetailers.xlsx");
  };

  // Export to PDF (exclude sensitive fields)
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Pending Retailers", 14, 15);

    const tableData = filtered.map((r, i) => [
      i + 1,
      r.name || "-",
      r.email || "-",
      r.mobile || "-",
      new Date(r.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [["#", "Name", "Email", "Mobile", "Registered On"]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 10 },
    });

    doc.save("PendingRetailers.pdf");
  };

  return (
    <div className="w-full p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Pending KYC Verifications
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search retailers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center justify-center gap-2 flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              <FileSpreadsheet size={16} />
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center justify-center gap-2 flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
            >
              <FileText size={16} />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 font-semibold">#</th>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Contact</th>
              <th className="px-5 py-3 font-semibold">Registered On</th>
              <th className="px-5 py-3 font-semibold text-center">KYC Status</th>
              <th className="px-5 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" />
                    Loading retailers...
                  </div>
                </td>
              </tr>
            ) : visible.length > 0 ? (
              visible.map((r, index) => (
                <tr
                  key={r._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-4">{startIndex + index + 1}</td>
                  <td className="px-5 py-4 font-medium text-gray-800">{r.name || "-"}</td>
                  <td className="px-5 py-4 text-gray-600">
                    <div>{r.email || "-"}</div>
                    <div className="text-xs">{r.mobile}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-center">{getKycStatus(r)}</td>
                  <td className="px-5 py-4 text-center space-x-2">
                    {r.kycDetails && (
                      <button onClick={() => navigate(`/st-admin/kyc-verification/${r.kycDetails._id}`)} className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-xs font-semibold">
                        Review KYC
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-10 text-gray-500 font-medium"
                >
                  No pending KYC verifications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-3">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 text-sm font-semibold transition-colors"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-sm text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 text-sm font-semibold transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyRetailer;
