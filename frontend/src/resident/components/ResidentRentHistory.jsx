// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useState, useEffect } from "react";
import residentApi from "../residentApi";
import Navbar from "../../shared/Navbar";
import ResidentSidebar from "./Sidebar";
import { IndianRupee, ChevronLeft, ChevronRight, Download, CheckCircle2, Calendar, CreditCard, Hash } from "lucide-react";
import { jsPDF } from "jspdf";

/**
 * Generates and triggers a download of a PDF payment receipt for the given record.
 * Uses jsPDF to build a formatted receipt with resident details, payment breakdown,
 * UTR/transaction ID, and a system-generated disclaimer footer.
 *
 * @param {object} record - The paid rent record used to populate the receipt.
 * @param {number} record.id - Rent record ID (used for the receipt number).
 * @param {string} record.month - Month label (e.g. "June 2026").
 * @param {string} [record.residentName] - Resident's full name.
 * @param {string} [record.rent] - Base rent amount.
 * @param {string} [record.delayCharges] - Late payment charges, if any.
 */
function generateInvoicePdf(record) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Receipt", pageWidth / 2, 22, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Receipt #${record.id}`, pageWidth / 2, 32, { align: "center" });

    doc.setTextColor(55, 65, 81);

    let y = 55;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Resident Details", 20, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const addRow = (label, value) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(value || "—", 80, y);
        y += 7;
    };

    addRow("Name:", record.residentName || "—");
    addRow("Phone:", record.phoneNumber || "—");
    addRow("Property:", record.propertyName || "—");
    addRow("Room / Bed:", `${record.roomNo || "—"} / ${record.bedLabel || "—"}`);

    y += 4;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Details", 20, y);
    y += 8;
    doc.setFontSize(10);

    addRow("Month:", record.month || "—");
    addRow("Rent:", `₹${record.rent || "0"}`);
    addRow("Delay Charges:", record.delayCharges ? `₹${record.delayCharges}` : "₹0");

    const total = (parseFloat(record.rent || 0) + parseFloat(record.delayCharges || 0)).toFixed(2);
    y += 2;
    doc.setFillColor(243, 244, 246);
    doc.rect(20, y - 5, pageWidth - 40, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Total Paid:", 25, y + 1);
    doc.text(`₹${total}`, pageWidth - 25, y + 1, { align: "right" });
    y += 16;

    doc.setFontSize(10);
    addRow("Payment Method:", record.transferType || "—");
    addRow("UTR / Txn ID:", record.utrNumber || "—");
    addRow("Payment Date:", record.transferredDate || "—");

    y += 12;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, y, pageWidth - 20, y);
    y += 8;
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("This is a system-generated receipt and does not require a signature.", pageWidth / 2, y, { align: "center" });

    doc.save(`receipt-${record.month || record.id}.pdf`);
}

/**
 * residentRentHistory — paginated list of all paid rent records with receipt download.
 * Fetches paid-only records from the API with server-side pagination and renders
 * each record with payment metadata and a downloadable PDF receipt.
 *
 * @param {object} props
 * @param {boolean} props.isExpanded - Whether the sidebar is in expanded state.
 * @param {Function} props.setIsExpanded - Setter to toggle sidebar expanded state.
 * @returns {React.ReactElement}
 */
export default function residentRentHistory({ isExpanded, setIsExpanded }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [downloading, setDownloading] = useState(null);

    /**
     * Fetches a page of paid rent records from the API and updates component state.
     *
     * @param {number} [page=1] - The 1-based page number to fetch.
     */
    const fetchRecords = (page = 1) => {
        setLoading(true);
        residentApi.get(`/rent-history/?page=${page}&page_size=10&paid_only=true`, { skipGlobalErrorToast: true })
            .then((res) => {
                if (res.data.success) {
                    setRecords(res.data.rentRecords);
                    setCurrentPage(res.data.currentPage);
                    setTotalPages(res.data.totalPages);
                    setTotalRecords(res.data.totalRecords);
                }
            })
            .catch((err) => { console.error(err); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchRecords(1); }, []);

    /**
     * Fetches full invoice data for the given record and triggers a PDF receipt download.
     * Prevents event bubbling so row click handlers are not triggered.
     *
     * @param {object} record - The rent record whose receipt should be downloaded.
     * @param {number} record.id - Rent record ID used to fetch invoice details.
     * @param {React.SyntheticEvent} e - The originating click event.
     */
    const handleDownload = async (record, e) => {
        e.stopPropagation();
        setDownloading(record.id);
        try {
            const res = await residentApi.get(`/invoices/${record.id}/`);
            if (res.data.success) generateInvoicePdf(res.data.invoice);
        } catch (err) {
            console.error("Failed to download invoice", err);
        }
        setDownloading(null);
    };

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <ResidentSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
                <div className="page-header">
                    <div>
                        <h1>Rent History</h1>
                        <p>View your payment records and download receipts</p>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-center"><div className="spinner"></div></div>
                ) : totalRecords === 0 ? (
                    <div className="card">
                        <div className="card-body text-center py-16">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <IndianRupee size={28} className="text-gray-300" />
                            </div>
                            <p className="font-medium text-gray-700 mb-1">No payment records yet</p>
                            <p className="text-sm text-gray-400">Your payment history will appear here once you make a payment.</p>
                        </div>
                    </div>
                ) : (
                    <div className="card">
                        <div className="card-header flex items-center justify-between">
                            <h3>Payment Records</h3>
                            <span className="text-xs text-gray-400 font-normal">{totalRecords} {totalRecords === 1 ? "record" : "records"}</span>
                        </div>
                        <div className="card-body p-0">
                            <div className="divide-y divide-gray-100">
                                {records.map((r) => {
                                    const total = (parseFloat(r.rent || 0) + parseFloat(r.delayCharges || 0)).toFixed(2);
                                    const hasDelay = r.delayCharges && parseFloat(r.delayCharges) > 0;
                                    return (
                                        <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                                            {/* Icon */}
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 size={20} className="text-green-500" />
                                            </div>

                                            {/* Month + date */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-sm font-semibold text-gray-900">{r.month}</span>
                                                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">Paid</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                                                    {r.transferredDate && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={11} />
                                                            {r.transferredDate}
                                                        </span>
                                                    )}
                                                    {r.transferType && (
                                                        <span className="flex items-center gap-1">
                                                            <CreditCard size={11} />
                                                            {r.transferType}
                                                        </span>
                                                    )}
                                                    {r.utrNumber && (
                                                        <span className="flex items-center gap-1">
                                                            <Hash size={11} />
                                                            {r.utrNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Amount breakdown */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-semibold text-gray-900">₹{total}</p>
                                                {hasDelay ? (
                                                    <p className="text-xs text-gray-400">₹{r.rent} + ₹{r.delayCharges} delay</p>
                                                ) : (
                                                    <p className="text-xs text-gray-400">Rent only</p>
                                                )}
                                            </div>

                                            {/* Download */}
                                            <button
                                                onClick={(e) => handleDownload(r, e)}
                                                disabled={downloading === r.id}
                                                title="Download receipt"
                                                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50"
                                            >
                                                <Download size={13} />
                                                {downloading === r.id ? "..." : "Receipt"}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-400">
                                        Page {currentPage} of {totalPages} &middot; {totalRecords} records
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => fetchRecords(currentPage - 1)}
                                            disabled={currentPage <= 1}
                                            className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft size={15} />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => fetchRecords(page)}
                                                className={`w-8 h-8 rounded-md text-xs border transition-colors ${
                                                    page === currentPage
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => fetchRecords(currentPage + 1)}
                                            disabled={currentPage >= totalPages}
                                            className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight size={15} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
