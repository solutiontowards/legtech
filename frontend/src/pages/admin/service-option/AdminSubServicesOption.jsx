import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listServices } from "../../../api/services";
import { getAllServices, updateOption } from "../../../api/admin";
import toast from "react-hot-toast";
import { PlusCircle, Edit, Layers } from "lucide-react";

const AdminServicesOption = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchOptions() {
      setLoading(true);
      try {
        const { data } = await getAllServices();
        const allOptions = data?.services.flatMap(service =>
          service.subServices.flatMap(sub =>
            sub.options.map(opt => ({
              ...opt,
              parentSubServiceName: sub.name,
              parentServiceName: service.name,
              parentServiceSlug: service.slug,
              parentSubServiceSlug: sub.slug,
            }))
          )
        ) || [];
        setOptions(allOptions);
      } catch (error) {
        toast.error("Failed to fetch options.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, []);

  const handleToggleStatus = async (optionId, currentStatus) => {
    try {
      await updateOption(optionId, { isActive: !currentStatus });
      toast.success("Option status updated!");
      setOptions(options.map(o => o._id === optionId ? { ...o, isActive: !currentStatus } : o));
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const filteredOptions = options.filter(
    (o) =>
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.parentSubServiceName?.toLowerCase().includes(search.toLowerCase()) ||
      o.parentServiceName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-3 sm:mb-0"><Layers className="text-blue-600" /> Manage Options</h1>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Search options..." className="px-3 py-2 border rounded-lg w-full sm:w-64 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button onClick={() => navigate("/st-admin/add-subservice-option")} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition text-sm">
            <PlusCircle size={18} /> Add Option
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">Option Name</th>
              <th className="px-4 py-3">Customer Price</th>
              <th className="px-4 py-3">Retailer Price</th>
              <th className="px-4 py-3">Parent Sub-Service</th>
              <th className="px-4 py-3">Parent Service</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-6">Loading...</td></tr>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <tr key={opt._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-3">
                    <img src={opt.image} alt={opt.name} className="h-10 w-10 rounded-md object-cover" />
                    {opt.name}
                  </td>
                  <td className="px-4 py-3">₹{(opt.customerPrice || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 font-semibold">₹{(opt.retailerPrice || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">{opt.parentSubServiceName}</td>
                  <td className="px-4 py-3">{opt.parentServiceName}</td>
                  <td className="px-4 py-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={opt.isActive} onChange={() => handleToggleStatus(opt._id, opt.isActive)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => navigate(`/st-admin/edit-subservice-option/${opt.parentServiceSlug}/${opt.parentSubServiceSlug}/${opt.slug}`)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full">
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="text-center py-6 font-medium">No options found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminServicesOption