import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAdmins, updateUser } from "../../api/admin";
import { Download, FileSpreadsheet, FileText, Search, Loader2 } from "lucide-react";

const AdminList = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  async function load() {
    try {
      setLoading(true);
      const { data } = await getAdmins();
      setList(data?.admins || []);
    } catch {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await updateUser({ userId, isActive: !currentStatus });
      setList((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isActive: !currentStatus } : user
        )
      );
      toast.success("Admin status updated successfully!");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const filtered = list.filter(
    (admin) =>
      admin.name?.toLowerCase().includes(search.toLowerCase()) ||
      admin.email?.toLowerCase().includes(search.toLowerCase()) ||
      admin.mobile?.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visible = filtered.slice(startIndex, startIndex + itemsPerPage);

  const exportToExcel = () => {
    const cleanData = list.map(({ passwordHash, __v, walletId, ...rest }) => ({
      ...rest,
      isVerified: rest.isVerified ? "Active" : "Inactive",
      createdAt: new Date(rest.createdAt).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Admins");
    XLSX.writeFile(wb, "Admins.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Admin List", 14, 15);
    const tableData = list.map((admin, i) => [
      i + 1,
      admin.name || "-",
      admin.email || "-",
      admin.mobile || "-",
      new Date(admin.createdAt).toLocaleDateString(),
      admin.isActive ? "Active" : "Inactive",
    ]);

    autoTable(doc, {
      head: [["#", "Name", "Email", "Mobile", "Created On", "Status"]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 10 },
    });
    doc.save("Admins.pdf");
  };

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Admin Management</h2>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search admin..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
              className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              <FileSpreadsheet size={16} />
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
            >
              <FileText size={16} />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto bg-white shadow-sm border border-gray-200 rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Toggle</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" />
                    Loading admins...
                  </div>
                </td>
              </tr>
            ) : visible.length > 0 ? (
              visible.map((admin, index) => (
                <tr
                  key={admin._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {admin.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{admin.email || "-"}</td>
                  <td className="px-4 py-3">{admin.mobile}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        admin.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {admin.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={admin.isActive}
                        onChange={() =>
                          handleToggleStatus(admin._id, admin.isActive)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="py-10 text-center text-gray-500 font-medium"
                >
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-3 flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-200 transition text-sm"
          >
            Prev
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-200 transition text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminList;
