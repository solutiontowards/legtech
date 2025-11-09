import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listServices } from "../../../api/services";
import { getAllServices, updateService } from "../../../api/admin";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PlusCircle, FileText, Edit } from "lucide-react";

const AdminServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await getAllServices();
      setServices(data?.services || []); // backend sends { ok, services }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch services.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (serviceId, currentStatus) => {
    try {
      await updateService(serviceId, { isActive: !currentStatus });
      toast.success("Service status updated successfully!");
      // Refresh the list to show the new status
      setServices(services.map(s => s._id === serviceId ? {...s, isActive: !currentStatus} : s));
    } catch (err) {
      toast.error("Failed to update status.");
      console.error(err);
    }
  };

  const filteredServices = services.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleServices = filteredServices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const exportToExcel = () => {
    const cleanData = services.map(({ __v, slug, ...rest }) => ({
      ...rest,
      createdAt: new Date(rest.createdAt).toLocaleString(),
      updatedAt: new Date(rest.updatedAt).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Services");
    XLSX.writeFile(wb, "Services.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Manage Services", 14, 15);

    const tableData = services.map((s, i) => [
      startIndex + i + 1,
      s.name,
      s.description.substring(0, 40) + "...",
      s.isActive ? "Active" : "Inactive",
      new Date(s.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [["#", "Name", "Description", "Status", "Created On"]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 9 },
    });

    doc.save("Services.pdf");
  };

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-3 sm:mb-0">
          <FileText className="text-blue-600" /> Manage Services
        </h1>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by name or description..."
            className="px-3 py-2 border rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button
            onClick={exportToExcel}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Export PDF
          </button>
          <button
            onClick={() => navigate("/st-admin/add-service")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition text-sm"
          >
            <PlusCircle size={18} />
            Add Service
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  Loading services...
                </td>
              </tr>
            ) : visibleServices.length > 0 ? (
              visibleServices.map((s, index) => (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{startIndex + index + 1}</td>
                  <td className="px-4 py-3">
                    <img src={s.image} alt={s.name} className="h-12 w-12 rounded-md object-cover" />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-sm truncate">{s.description}</td>
                  <td className="px-4 py-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={s.isActive}
                        onChange={() => handleToggleStatus(s._id, s.isActive)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/st-admin/edit-service/${s.slug}`)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500 font-medium">
                  No services found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

export default AdminServices;
