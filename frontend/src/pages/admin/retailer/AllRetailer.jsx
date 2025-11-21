import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRetailers, updateUser } from "../../../api/admin";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Eye, Search, FileDown, Loader2, Inbox, ChevronLeft, ChevronRight } from "lucide-react";

const AllRetailer = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Load all retailers
  async function load() {
    try {
      setLoading(true);
      const { data } = await getRetailers();
      setList(data?.retailers || []);
    } catch (err) {
      toast.error("Failed to load retailers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Handle user active/inactive status toggle
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await updateUser({ userId, isActive: !currentStatus });
      toast.success("Retailer status updated successfully!");
      // Update local state to reflect the change instantly
      setList(list.map(user => user._id === userId ? { ...user, isActive: !currentStatus } : user));
    } catch (err) {
      toast.error("Failed to update status.");
      console.error(err);
    }
  };
  // Search filter
  const filtered = list.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.mobile?.includes(search) ||
      r.kycDetails?.outletName?.toLowerCase().includes(search.toLowerCase()) ||
      r.kycDetails?.state?.toLowerCase().includes(search.toLowerCase()) ||
      r.kycDetails?.district?.toLowerCase().includes(search.toLowerCase()) ||
      r.kycDetails?.pinCode?.includes(search)
  );

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visible = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Export to Excel
  const exportToExcel = () => {
    const cleanData = filtered.map((r, index) => ({
      "Serial No": startIndex + index + 1,
      "User ID": r.mobile,
      "Name": r.name,
      "Balance": `₹${r.walletId?.balance?.toFixed(2) || '0.00'}`,
      "User Type": r.role,
      "KYC Status": r.isKycVerified ? "Verified" : "Pending",
      "Mobile Number": r.mobile,
      "Email ID": r.email,
      "Outlet Name": r.kycDetails?.outletName || 'N/A',
      "State": r.kycDetails?.state || 'N/A',
      "District": r.kycDetails?.district || 'N/A',
      "Post Office": r.kycDetails?.postOffice || 'N/A',
      "Address": r.kycDetails?.address || 'N/A',
      "PIN Code": r.kycDetails?.pinCode || 'N/A',
      "Plus Code": r.kycDetails?.plusCode || 'N/A',
      "Registered On": new Date(r.createdAt).toLocaleString(),
      "Activity Status": r.isActive ? "Active" : "Inactive",
    }));
    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "All Retailers");
    XLSX.writeFile(wb, "AllRetailers.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("All Retailers", 14, 15);

    const tableData = filtered.map((r, i) => [
      startIndex + i + 1,
      r.mobile,
      r.name,
      `₹${r.walletId?.balance?.toFixed(2) || '0.00'}`,
      r.role,
      r.isKycVerified ? "Verified" : "Pending",
      r.kycDetails?.outletName || 'N/A',
      r.kycDetails?.state || 'N/A',
    ]);

    autoTable(doc, {
      head: [["#", "User ID", "Name", "Balance", "User Type", "KYC Status", "Outlet", "State"]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
    });

    doc.save("AllRetailers.pdf");
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Active Retailers
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search retailers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center gap-2 flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            <FileDown size={16} /> Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center justify-center gap-2 flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
          >
            <FileDown size={16} /> PDF
          </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              {[
                "Sr. No", "Actions", "User ID", "Name", "Balance", "User Type", "KYC Status", "Mobile", "Email",
                "Outlet Name", "State", "District", "Post Office", "Address", "PIN Code", "Plus Code",
                "Registered On", "Activity"
              ].map(col => <th key={col} className="px-5 py-3 font-semibold whitespace-nowrap">{col}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="18" className="text-center py-10 text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" /> Loading retailers...
                  </div>
                </td>
              </tr>
            ) : visible.length > 0 ? (
              visible.map((r, index) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">{startIndex + index + 1}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => navigate(`/st-admin/retailer/kyc-details/${r._id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                      title="View KYC Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap font-medium text-gray-800">{r.mobile}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{r.name || "-"}</td>
                  <td className="px-5 py-4 whitespace-nowrap font-semibold">₹{r.walletId?.balance?.toFixed(2) || '0.00'}</td>
                  <td className="px-5 py-4 whitespace-nowrap capitalize">{r.role}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${r.isKycVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {r.isKycVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">{r.mobile}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{r.email || "-"}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{r.kycDetails?.outletName || 'N/A'}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{r.kycDetails?.state || 'N/A'}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{r.kycDetails?.district || 'N/A'}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{r.kycDetails?.postOffice || 'N/A'}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{r.kycDetails?.address || 'N/A'}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{r.kycDetails?.pinCode || 'N/A'}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{r.kycDetails?.plusCode || 'N/A'}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={r.isActive} onChange={() => handleToggleStatus(r._id, r.isActive)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="18" className="text-center py-16 text-gray-500">
                  <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No Retailers Found</h3>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-3">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 text-sm font-semibold transition-colors">
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-sm text-gray-700 font-medium">Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 text-sm font-semibold transition-colors">
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AllRetailer;
