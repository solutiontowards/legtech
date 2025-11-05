import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listServices } from "../../../api/services"; // To get all services and their sub-services
import { getAllServices, updateSubService } from "../../../api/admin";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PlusCircle, FileText, Edit, Layers } from "lucide-react";

const AdminSubServices = () => {
  const navigate = useNavigate();
  const [subServices, setSubServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchSubServices();
  }, []);

  const fetchSubServices = async () => {
    try {
      setLoading(true);
      const { data } = await getAllServices(); // This fetches services with populated sub-services
      const allSubServices = data?.services.flatMap(service =>
        service.subServices.map(sub => ({ ...sub, parentServiceName: service.name, parentServiceSlug: service.slug }))
      ) || [];
      setSubServices(allSubServices);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch sub-services.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (subServiceId, currentStatus) => {
    try {
      await updateSubService(subServiceId, { isActive: !currentStatus });
      toast.success("Sub-service status updated successfully!");
      // Refresh the list to show the new status
      setSubServices(subServices.map(s => s._id === subServiceId ? {...s, isActive: !currentStatus} : s));
    } catch (err) {
      toast.error("Failed to update status.");
      console.error(err);
    }
  };

  const filteredSubServices = subServices.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.parentServiceName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleSubServices = filteredSubServices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const exportToExcel = () => {
    const cleanData = subServices.map(({ __v, slug, ...rest }) => ({
      ...rest,
      createdAt: new Date(rest.createdAt).toLocaleString(),
      updatedAt: new Date(rest.updatedAt).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SubServices");
    XLSX.writeFile(wb, "SubServices.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Manage Sub-Services", 14, 15);

    const tableData = subServices.map((s, i) => [
      startIndex + i + 1,
      s.name,
      s.parentServiceName,
      s.description.substring(0, 40) + "...",
      s.isActive ? "Active" : "Inactive",
      new Date(s.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [["#", "Name", "Parent Service", "Description", "Status", "Created On"]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 9 },
    });

    doc.save("SubServices.pdf");
  };

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-3 sm:mb-0">
          <Layers className="text-blue-600" /> Manage Sub-Services
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name, description or parent service..."
            className="px-3 py-2 border rounded-lg w-full sm:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button
            onClick={exportToExcel}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm w-full sm:w-auto"
          >
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm w-full sm:w-auto"
          >
            Export PDF
          </button>
          <button
            onClick={() => navigate("/admin/add-subservice")}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition text-sm w-full sm:w-auto"
          >
            <PlusCircle size={18} />
            Add Sub-Service
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
              <th className="px-4 py-3">Parent Service</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  Loading sub-services...
                </td>
              </tr>
            ) : visibleSubServices.length > 0 ? (
              visibleSubServices.map((s, index) => (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{startIndex + index + 1}</td>
                  <td className="px-4 py-3">
                    <img src={s.image} alt={s.name} className="h-12 w-12 rounded-md object-cover" />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-gray-700">{s.parentServiceName}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{s.description}</td>
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
                      onClick={() => navigate(`/admin/edit-subservice/${s.parentServiceSlug}/${s.slug}`)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500 font-medium">
                  No sub-services found.
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
  )
}

export default AdminSubServices