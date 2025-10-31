import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getPendingRetailers, verifyRetailer } from "../../api/admin";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const VerifyRetailer = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;

  // Load pending retailers
  async function load() {
    try {
      setLoading(true);
      const { data } = await getPendingRetailers();
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

  // Verify retailer with confirmation
  async function handleVerify(id, name) {
    const result = await Swal.fire({
      title: `Verify ${name || "this retailer"}?`,
      text: "Are you sure you want to verify this retailer?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Verify",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
    });

    if (result.isConfirmed) {
      try {
        await verifyRetailer(id, true);
        toast.success("Retailer verified successfully!");
        load();
      } catch (err) {
        toast.error("Verification failed!");
      }
    }
  }

  // Search filter
  const filtered = list.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.mobile?.includes(search)
  );

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visible = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Export to Excel (exclude sensitive fields)
  const exportToExcel = () => {
    const cleanData = list.map(
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

    const tableData = list.map((r, i) => [
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
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3 sm:mb-0">
          Pending Retailers
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
          <button
            onClick={exportToExcel}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Registered On</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  Loading retailers...
                </td>
              </tr>
            ) : visible.length > 0 ? (
              visible.map((r, index) => (
                <tr
                  key={r._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">{startIndex + index + 1}</td>
                  <td className="px-4 py-3">{r.name || "-"}</td>
                  <td className="px-4 py-3">{r.email || "-"}</td>
                  <td className="px-4 py-3">{r.mobile}</td>
                  <td className="px-4 py-3">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleVerify(r._id, r.name)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Verify
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  No pending retailers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Prev
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyRetailer;
