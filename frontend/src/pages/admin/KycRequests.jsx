import React, { useEffect, useState } from "react";
import { getPendingKycRequests } from "../../api/admin";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, ChevronLeft, ChevronRight, Eye, Inbox } from "lucide-react";

const KycRequests = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  async function loadRequests() {
    try {
      setLoading(true);
      const { data } = await getPendingKycRequests();
      setRequests(data?.requests || []);
    } catch (err) {
      toast.error("Failed to load KYC requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const filtered = requests.filter(
    (r) =>
      r.retailerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.retailerId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.retailerId?.mobile?.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visible = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Pending KYC Requests
        </h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by retailer..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 font-semibold">#</th>
              <th className="px-5 py-3 font-semibold">Retailer Name</th>
              <th className="px-5 py-3 font-semibold">Contact</th>
              <th className="px-5 py-3 font-semibold">Submitted On</th>
              <th className="px-5 py-3 font-semibold text-center">KYC Status</th>
              <th className="px-5 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" />
                    Loading Requests...
                  </div>
                </td>
              </tr>
            ) : visible.length > 0 ? (
              visible.map((req, index) => (
                <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">{startIndex + index + 1}</td>
                  <td className="px-5 py-4 font-medium text-gray-800">{req.retailerId?.name || "N/A"}</td>
                  <td className="px-5 py-4 text-gray-600">
                    <div>{req.retailerId?.email || "N/A"}</div>
                    <div className="text-xs">{req.retailerId?.mobile || "N/A"}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 capitalize">{req.status}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => navigate(`/st-admin/kyc-verification/${req._id}`)} className="flex items-center justify-center gap-2 mx-auto px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-xs font-semibold">
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-16 text-gray-500">
                  <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No Pending Requests</h3>
                  <p className="text-sm">All KYC submissions are up to date.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

export default KycRequests;