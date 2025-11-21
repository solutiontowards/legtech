import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowDownCircle, ArrowUpCircle, XCircle, Search, FileDown, Loader2, Inbox } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getTransactions } from "../../api/wallet";

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 10;
    const { user } = useAuth();

    async function loadTransactions() {
        try {
            setLoading(true)
            const { data } = await getTransactions();
            if (data.ok) {
                setTransactions(data.transactions || []);
            }
        } catch (err) {
            toast.error("Failed to load transactions.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTransactions();
    }, []);

    const getTransactionDescription = (meta) => {
        if (typeof meta === "string" && meta.startsWith("WALLET_")) return "Wallet Recharge";
        // Handle new structured meta
        if (meta?.reason?.startsWith("Payment Failed")) return `Failed: ${meta.reason}`;
        if (meta?.reason === "service purchase") return `Payment for ${meta.serviceName || 'Service'}`;
        if (meta?.reason === "Online Service Payment") return `Online Payment for ${meta.serviceName || 'Service'}`;
        if (meta?.reason === "service purchase retry") return `Retry Payment for ${meta.serviceName || 'Submission'}`;
        if (meta?.reason === "Refund for cancelled service") {
            return `Refund for ${meta.serviceName || "Service"} (Cancelled Service)`;
        }
        if (meta?.reason) return `Manual Credit: ${meta.reason}`;
        // Fallback for any other string-based meta
        if (typeof meta === 'string') return meta;
        return "Transaction";
    };

    const filteredTransactions = transactions.filter(
        (t) =>
            getTransactionDescription(t.meta)
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            t.type.toLowerCase().includes(search.toLowerCase()) ||
            t._id.includes(search.toLowerCase()) ||
            user?.name.toLowerCase().includes(search.toLowerCase()) ||
            user?.mobile.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const visibleTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    const exportToExcel = () => {
        const dataToExport = transactions.map((t) => ({
            "Serial No": startIndex + 1,
            "Transaction ID": t._id,
            "Description": getTransactionDescription(t.meta),
            "Type": t.type,
            Amount: `₹${t.amount.toFixed(2)}`,
            "Previous Balance": `₹${(t.previousBalance || 0).toFixed(2)}`,
            "Updated Balance": `₹${(t.updatedBalance || 0).toFixed(2)}`,
            "User ID": user?.mobile || "N/A",
            "User Name": user?.name || "N/A",
            "Date & Time": new Date(t.createdAt).toLocaleString(),
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
        XLSX.writeFile(wb, "TransactionHistory.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Transaction History", 14, 15);
        const tableData = transactions.map((t, i) => [
            startIndex + i + 1, // Serial No
            t._id, // Transaction ID
            getTransactionDescription(t.meta), // Description
            t.type.charAt(0).toUpperCase() + t.type.slice(1), // Type
            `₹${t.amount.toFixed(2)}`, // Amount
            `₹${(t.previousBalance || 0).toFixed(2)}`, // Previous Balance
            `₹${(t.updatedBalance || 0).toFixed(2)}`, // Updated Balance
            user?.mobile || "N/A", // User ID
            user?.name || "N/A", // User Name
            new Date(t.createdAt).toLocaleString(), // Date & Time
        ]);
        autoTable(doc, {
            head: [[
                "Serial No", "Transaction ID", "Description", "Type", "Amount",
                "Previous Balance", "Updated Balance", "User ID", "User Name", "Date & Time",
            ]],
            body: tableData,
            startY: 25,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 160, 133] },
            alternateRowStyles: { fillColor: [240, 240, 240] },
        });
        doc.save("TransactionHistory.pdf");
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Transaction History
                </h2>
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => exportToExcel()} className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition text-sm font-semibold">
                        <FileDown size={16} /> Excel
                    </button>
                    <button onClick={() => exportToPDF()} className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition text-sm font-semibold">
                        <FileDown size={16} /> PDF
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 flex justify-between items-center flex-wrap gap-3 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h3 className="font-semibold text-gray-800 text-base">
                        Your Transactions ({filteredTransactions.length})
                    </h3>
                    <div className="relative w-full sm:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search transactions..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>

                <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 sticky top-0">
                            <tr>
                                {["Serial No", "Transaction ID", "Description", "Type", "Amount", "Previous Balance", "Updated Balance", "User ID", "User Name", "Date & Time"].map((col) => (
                                    <th key={col} className="p-4 font-semibold whitespace-nowrap tracking-wider">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="10" className="text-center p-10"><Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" /><p className="mt-2 text-gray-500">Loading transactions...</p></td></tr>
                            ) : visibleTransactions.length > 0 ? (
                                visibleTransactions.map((t, index) => (
                                    <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{startIndex + index + 1}</td>
                                        <td className="p-4 text-gray-800 font-medium whitespace-nowrap">{t._id}</td>
                                        <td className="p-4 text-gray-700 font-medium whitespace-nowrap">{getTransactionDescription(t.meta)}</td>
                                        <td className="p-4 whitespace-nowrap">
                                            {t.type === "credit" ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700"><ArrowDownCircle size={14} />Credit</span>
                                            ) : t.type === "debit" ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700"><ArrowUpCircle size={14} />Debit</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700"><XCircle size={14} />Failed</span>
                                            )}
                                        </td>
                                        <td className={`p-4 font-bold whitespace-nowrap ${t.type === "credit" ? "text-green-600" : t.type === "debit" ? "text-red-600" : "text-gray-500"}`}>
                                            {t.type === "credit" ? "+" : t.type === "debit" ? "-" : ""}₹{t.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">₹{(t.previousBalance || 0).toFixed(2)}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">₹{(t.updatedBalance || 0).toFixed(2)}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{user?.mobile || "N/A"}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{user?.name || "N/A"}</td>
                                        <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(t.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center p-10">
                                        <Inbox className="w-12 h-12 text-gray-400 mx-auto" />
                                        <p className="mt-3 font-semibold text-gray-700">No Transactions Found</p>
                                        <p className="text-sm text-gray-500">Your transaction history is empty.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="px-3 py-1.5 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 text-sm font-semibold">
                        Prev
                    </button>
                    <span className="text-sm text-gray-600 font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="px-3 py-1.5 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 text-sm font-semibold">
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory