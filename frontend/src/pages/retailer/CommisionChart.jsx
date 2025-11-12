import React, { useState, useEffect, useMemo } from "react";
import { getCommissionChart } from "../../api/retailer";
import toast from "react-hot-toast";
import { Loader2, Search, FileDown, Inbox, BarChart3 } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CommisionChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: response } = await getCommissionChart();
        if (response.ok) {
          setData(response.commissionData || []);
        }
      } catch (error) {
        toast.error("Failed to fetch commission data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
        item.subServiceName?.toLowerCase().includes(search.toLowerCase()) ||
        item.optionName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = (type) => {
    if (filteredData.length === 0) {
      toast.error("No data to export");
      return;
    }
    const exportData = filteredData.map((item) => ({
      "Service": item.serviceName,
      "Sub-Service": item.subServiceName,
      "Option": item.optionName,
      "Customer Price": `₹${(item.customerPrice || 0).toFixed(2)}`,
      "Retailer Price": `₹${(item.retailerPrice || 0).toFixed(2)}`,
      "Commission": `₹${((item.customerPrice || 0) - (item.retailerPrice || 0)).toFixed(2)}`,
    }));

    if (type === "excel") {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Commission Chart");
      XLSX.writeFile(wb, "CommissionChart.xlsx");
    } else if (type === "pdf") {
      const doc = new jsPDF();
      doc.text("Retailer Commission Chart", 14, 15);
      autoTable(doc, {
        head: [Object.keys(exportData[0])],
        body: exportData.map((row) => Object.values(row)),
        startY: 20,
      });
      doc.save("CommissionChart.pdf");
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-blue-600" />
          Commission Chart
        </h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleExport("excel")} className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition text-sm font-semibold">
            <FileDown size={16} /> Excel
          </button>
          <button onClick={() => handleExport("pdf")} className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition text-sm font-semibold">
            <FileDown size={16} /> PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {["Service", "Sub-Service", "Option", "Customer Price", "Retailer Price", "Commission"].map((col) => (
                  <th key={col} className="p-4 font-semibold whitespace-nowrap tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="text-center p-10"><Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" /><p className="mt-2 text-gray-500">Loading data...</p></td></tr>
              ) : currentData.length > 0 ? (
                currentData.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-gray-800 font-medium">{item.serviceName}</td>
                    <td className="p-4 text-gray-600">{item.subServiceName}</td>
                    <td className="p-4 text-gray-600 font-semibold">{item.optionName}</td>
                    <td className="p-4 text-gray-800">₹{(item.customerPrice || 0).toFixed(2)}</td>
                    <td className="p-4 text-gray-800">₹{(item.retailerPrice || 0).toFixed(2)}</td>
                    <td className="p-4 text-green-600 font-bold">₹{((item.customerPrice || 0) - (item.retailerPrice || 0)).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center p-10"><Inbox className="w-12 h-12 text-gray-400 mx-auto" /><p className="mt-3 font-semibold text-gray-700">No Data Found</p><p className="text-sm text-gray-500">There is no commission data available to display.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-center items-center gap-3">
            <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1} className="px-3 py-1.5 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 text-sm font-semibold">Prev</button>
            <span className="text-sm text-gray-600 font-medium">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages} className="px-3 py-1.5 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 text-sm font-semibold">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommisionChart