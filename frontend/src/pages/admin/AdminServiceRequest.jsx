import React, { useEffect, useState } from "react";
import { adminListSubmissions } from "../../api/admin";
import { listServices } from "../../api/services";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Eye, FileDown, FilterX, Search, Filter } from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminServiceRequest = () => {
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [search, setSearch] = useState("");
  const [services, setServices] = useState([]);
  const [stagedFilters, setStagedFilters] = useState({ serviceId: '', subServiceId: '', optionId: '' });
  const [activeFilters, setActiveFilters] = useState({ serviceId: '', subServiceId: '', optionId: '' });
  const [subServiceOptions, setSubServiceOptions] = useState([]);
  const [optionOptions, setOptionOptions] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Data Loading
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [subsData, servicesData] = await Promise.all([
          adminListSubmissions(),
          listServices()
        ]);
        setAllSubmissions(subsData.data?.subs || []);
        setServices(servicesData.data?.services || []);
      } catch (err) {
        toast.error("Failed to load data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const filteredSubmissions = React.useMemo(() => {
      let result = allSubmissions;
      // Text search
      if (search) {
        result = result.filter(s =>
          s.retailerId?.name.toLowerCase().includes(search.toLowerCase()) ||
          s.data?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          s.data?.email?.toLowerCase().includes(search.toLowerCase())
        );
      }
      // Dropdown filters
      if (activeFilters.serviceId) result = result.filter(s => s.serviceId?._id === activeFilters.serviceId);
      if (activeFilters.subServiceId) result = result.filter(s => s.optionId?.subServiceId?._id === activeFilters.subServiceId);
      if (activeFilters.optionId) result = result.filter(s => s.optionId?._id === activeFilters.optionId);
      
      return result;
  }, [search, activeFilters, allSubmissions]);

  // Handle filter dropdown changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setStagedFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      if (name === 'serviceId') {
        newFilters.subServiceId = '';
        newFilters.optionId = '';
        const selectedService = services.find(s => s._id === value);
        setSubServiceOptions(selectedService?.subServices || []);
        setOptionOptions([]);
      }
      if (name === 'subServiceId') {
        newFilters.optionId = '';
        const selectedSubService = subServiceOptions.find(ss => ss._id === value);
        setOptionOptions(selectedSubService?.options || []);
      }
      return newFilters;
    });
  };

  const applyFilters = () => {
    setActiveFilters(stagedFilters);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setStagedFilters({ serviceId: '', subServiceId: '', optionId: '' });
    setActiveFilters({ serviceId: '', subServiceId: '', optionId: '' });
    setCurrentPage(1);
  };

  // Export Logic
  const handleExport = (type) => {
    if (filteredSubmissions.length === 0) {
      toast.error("No data to export.");
      return;
    }

    const dataToExport = filteredSubmissions.map(s => {
      const baseData = {
        'Retailer': s.retailerId?.name || 'N/A',
        'Service': s.serviceId?.name || 'N/A',
        'Sub-Service': s.optionId?.subServiceId?.name || 'N/A',
        'Option': s.optionId?.name || 'N/A',
        'Amount': `₹${s.amount?.toFixed(2) || '0.00'}`,
        'Payment Method': s.paymentMethod || 'N/A',
        'Payment Status': s.paymentStatus || 'N/A',
        'Status': s.status || 'N/A',
        'Date': new Date(s.createdAt).toLocaleDateString(),
        'Admin Remarks': s.adminRemarks || '',
      };
      return baseData;
    });


    if (type === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
      XLSX.writeFile(workbook, "Submissions_Export.xlsx");
    } else if (type === 'pdf') {
      const doc = new jsPDF({ orientation: 'portrait' });
      autoTable(doc, {
        head: [Object.keys(dataToExport[0])],
        body: dataToExport.map(row => Object.values(row)),
      });
      doc.save('Submissions_Export.pdf');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const currentSubmissions = filteredSubmissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-6 w-full bg-gray-50 flex flex-col h-full">
      <div className="flex-shrink-0 flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Service Requests</h2>
        <div className="flex gap-3">
          <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 text-sm font-semibold">
            <FileDown size={16} /> Export Excel
          </button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm font-semibold">
            <FileDown size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex-shrink-0 p-4 bg-white rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <select name="serviceId" value={stagedFilters.serviceId} onChange={handleFilterChange} className="p-2 border bg-gray-50 rounded-lg text-sm w-full focus:ring-2 focus:ring-green-500 focus:border-green-500">
            <option value="">All Services</option>
            {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select name="subServiceId" value={stagedFilters.subServiceId} onChange={handleFilterChange} className="p-2 border bg-gray-50 rounded-lg text-sm w-full focus:ring-2 focus:ring-green-500 focus:border-green-500" disabled={!stagedFilters.serviceId}>
            <option value="">All Sub-Services</option>
            {subServiceOptions.map(ss => <option key={ss._id} value={ss._id}>{ss.name}</option>)}
          </select>
          <select name="optionId" value={stagedFilters.optionId} onChange={handleFilterChange} className="p-2 border bg-gray-50 rounded-lg text-sm w-full focus:ring-2 focus:ring-green-500 focus:border-green-500" disabled={!stagedFilters.subServiceId}>
            <option value="">All Options</option>
            {optionOptions.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
          </select>
          <div className="flex gap-2 lg:col-span-2">
            <button onClick={applyFilters} className="w-full flex items-center justify-center gap-2 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">
              <Filter size={16} /> Apply Filters
            </button>
            <button onClick={resetFilters} title="Reset Filters" className="flex-shrink-0 flex items-center justify-center p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300">
              <FilterX size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-grow bg-white shadow-sm rounded-xl overflow-hidden flex flex-col">
        <div className="flex-shrink-0 p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">All Submissions ({filteredSubmissions.length})</h3>
            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by retailer, name, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 pl-10 border rounded-lg w-full md:w-72 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
            </div>
        </div>
        <div className="flex-grow overflow-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs sticky top-0">
            <tr>
              <th className="p-4 font-semibold">Retailer</th>
              <th className="p-4 font-semibold">Service</th>
              <th className="p-4 font-semibold">Sub-Service</th>
              <th className="p-4 font-semibold">Option</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 font-semibold">Payment Method</th>
              <th className="p-4 font-semibold">Payment Status</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold max-w-xs">Admin Remarks</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="11" className="text-center p-6 text-gray-500">Loading...</td></tr>
            ) : currentSubmissions.length > 0 ? (
              currentSubmissions.map((sub) => (
                <tr key={sub._id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{sub.retailerId?.name || 'N/A'}</td>
                  <td className="p-4 text-gray-600">{sub.serviceId?.name || 'N/A'}</td>
                  <td className="p-4 text-gray-600">{sub.optionId?.subServiceId?.name || 'N/A'}</td>
                  <td className="p-4 text-gray-600">{sub.optionId?.name || 'N/A'}</td>
                  <td className="p-4 text-gray-600">₹{sub.amount?.toFixed(2)}</td>
                  <td className="p-4 text-gray-600">{sub.paymentMethod}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sub.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {sub.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        sub.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        sub.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                        sub.status === 'completed' ? 'bg-green-100 text-green-800' :
                        sub.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 truncate max-w-xs" title={sub.adminRemarks}>{sub.adminRemarks || '-'}</td>
                  <td className="p-4 text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    <Link to={`/admin/view-submission/${sub._id}`} className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 inline-block">
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="11" className="text-center p-6 text-gray-500 font-medium">No submissions found for the selected criteria.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
       {totalPages > 1 && (
        <div className="flex-shrink-0 flex justify-center items-center pt-4 gap-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-50 text-sm">Prev</button>
          <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-50 text-sm">Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminServiceRequest;
