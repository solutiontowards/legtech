import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAdmins, updateUser } from "../../api/admin";

const AdminList = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  // Load all admins
  async function load() {
    try {
      setLoading(true);
      const { data } = await getAdmins();
      setList(data?.admins || []);
    } catch (err) {
      toast.error("Failed to load admins");
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
      toast.success("Admin status updated successfully!");
      // Update local state to reflect the change instantly
      setList(list.map(user => user._id === userId ? { ...user, isActive: !currentStatus } : user));
    } catch (err) {
      toast.error("Failed to update status.");
      console.error(err);
    }
  };

  // Search filter
  const filtered = list.filter(
    (admin) =>
      admin.name?.toLowerCase().includes(search.toLowerCase()) ||
      admin.email?.toLowerCase().includes(search.toLowerCase()) ||
      admin.mobile?.includes(search)
  );

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visible = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Export to Excel
  const exportToExcel = () => {
    const cleanData = list.map(
      ({ passwordHash, __v, walletId, ...rest }) => ({
        ...rest,
        isVerified: rest.isVerified ? "Active" : "Inactive",
        createdAt: new Date(rest.createdAt).toLocaleString(),
      })
    );
    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "All Admins");
    XLSX.writeFile(wb, "AllAdmins.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("All Admins", 14, 15);

    const tableData = list.map((admin, i) => [
      startIndex + i + 1,
      admin.name || "-",
      admin.email || "-",
      admin.mobile || "-",
      new Date(admin.createdAt).toLocaleDateString(),
      "Active", // Admins are always active
    ]);

    autoTable(doc, {
      head: [["#", "Name", "Email", "Mobile", "Created On", "Status"]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 10 },
    });

    doc.save("AllAdmins.pdf");
  };

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3 sm:mb-0">
          All Admins
        </h2>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by name, email or mobile"
            className="px-3 py-2 border rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button onClick={exportToExcel} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Export Excel
          </button>
          <button onClick={exportToPDF} className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Created On</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Activity</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-6 text-gray-500">Loading admins...</td></tr>
            ) : visible.length > 0 ? (
              visible.map((admin, index) => (
                <tr key={admin._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{admin.name || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{admin.email || "-"}</td>
                  <td className="px-4 py-3">{admin.mobile}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(admin.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${admin.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {admin.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={admin.isActive} onChange={() => handleToggleStatus(admin._id, admin.isActive)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="text-center py-6 text-gray-500 font-medium">No admins found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300">Prev</button>
          <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300">Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminList;