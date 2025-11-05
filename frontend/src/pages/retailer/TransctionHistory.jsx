import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { getTransactions } from "../../api/wallet";

const TransctionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 10;

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
        if (meta.reason === "service purchase") return `Payment for ${meta.optionId?.name || 'a service'}`;
        if (meta.type === "wallet_credit") return `Wallet credit via ${meta.source}`;
        // Check for manual admin credit reason
        if (meta.reason) return `Manual Credit: ${meta.reason}`;
        return "General Transaction";
    };

    const filteredTransactions = transactions.filter((t) => {
        const description = getTransactionDescription(t.meta).toLowerCase();
        const searchTerm = search.toLowerCase();
        return description.includes(searchTerm) || t.type.toLowerCase().includes(searchTerm) || t._id.includes(searchTerm);
    });

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const visibleTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    const exportToExcel = () => {
        const dataToExport = transactions.map((t) => ({
            "Transaction ID": t._id,
            Date: new Date(t.createdAt).toLocaleString(),
            Description: getTransactionDescription(t.meta),
            Type: t.type,
            Amount: `₹${t.amount.toFixed(2)}`,
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
            startIndex + i + 1,
            new Date(t.createdAt).toLocaleString(),
            getTransactionDescription(t.meta),
            t.type.charAt(0).toUpperCase() + t.type.slice(1),
            `₹${t.amount.toFixed(2)}`,
        ]);
        autoTable(doc, {
            head: [["#", "Date", "Description", "Type", "Amount"]],
            body: tableData,
            startY: 25,
            styles: { fontSize: 10 },
        });
        doc.save("TransactionHistory.pdf");
    };

    return (
        <div className="w-full p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3 sm:mb-0">Transaction History</h2>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="px-3 py-2 border rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    <button onClick={exportToExcel} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Export Excel</button>
                    <button onClick={exportToPDF} className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Export PDF</button>
                </div>
            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-700 text-white">
                        <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3 text-center">Type</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-6 text-gray-500">Loading transactions...</td></tr>
                        ) : visibleTransactions.length > 0 ? (
                            visibleTransactions.map((t, index) => (
                                <tr key={t._id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{startIndex + index + 1}</td>
                                    <td className="px-4 py-3 text-gray-600">{new Date(t.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{getTransactionDescription(t.meta)}</td>
                                    <td className="px-4 py-3 text-center">
                                        {t.type === "credit" ? (
                                            <span className="flex items-center justify-center gap-1 text-green-600"><ArrowDownCircle size={16} /> Credit</span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-1 text-red-600"><ArrowUpCircle size={16} /> Debit</span>
                                        )}
                                    </td>
                                    <td className={`px-4 py-3 text-right font-bold ${t.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                                        {t.type === "credit" ? "+" : "-"}₹{t.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center py-6 text-gray-500 font-medium">No transactions found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

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

export default TransctionHistory