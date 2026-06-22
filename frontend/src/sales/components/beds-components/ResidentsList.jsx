// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, LogOut } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";
import { UseCSVDownload } from "../UseCSVDownload";

function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-IN", { month: "short" });
    return `${day} ${month} ${d.getFullYear()}`;
}

function residentStatus(checkOut) {
    if (!checkOut) return "Active";
    return new Date(checkOut) <= new Date() ? "Checked Out" : "Active";
}

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

export default function ResidentsList() {
    const navigate = useNavigate();
    const downloadCSV = UseCSVDownload();

    const [allResidents, setAllResidents] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [propertyFilter, setPropertyFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [kycFilter, setKycFilter] = useState("All");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Checkout modal state
    const [checkoutModal, setCheckoutModal] = useState(null); // { resident }
    const [checkoutDate, setCheckoutDate] = useState("");
    const [checkoutReason, setCheckoutReason] = useState("");
    const [checkoutSaving, setCheckoutSaving] = useState(false);

    const fetchResidents = async () => {
        setLoadingData(true);
        try {
            const response = await axios.get("/sales/get-all-residents/");
            setAllResidents(response?.data?.residents || []);
        } catch (err) {
            console.log(err.message || "Error fetching data");
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => { fetchResidents(); }, []);

    const properties = useMemo(
        () => ["All", ...new Set(allResidents.map((r) => r.propertyName).filter(Boolean))],
        [allResidents]
    );

    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return allResidents.filter((r) => {
            if (propertyFilter !== "All" && r.propertyName !== propertyFilter) return false;
            if (statusFilter !== "All" && residentStatus(r.checkOut) !== statusFilter) return false;
            if (kycFilter !== "All" && (r.kycApprovalStatus || "Pending") !== kycFilter) return false;
            if (term) {
                return [r.residentsName, r.phoneNumber, r.email, r.propertyName, r.roomNo, r.bedLabel]
                    .some((f) => f && String(f).toLowerCase().includes(term));
            }
            return true;
        });
    }, [allResidents, searchTerm, propertyFilter, statusFilter, kycFilter]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setCurrentPage(1);
    };

    // ResidentDetails expects { state: { bedData } } where bedData has resident_data nested inside
    const goToDetails = (r) =>
        navigate(`/sales/sales-resident-details/${r.id}`, {
            state: {
                fromResidents: true,
                bedData: {
                    id: r.bed_data_instance_id,
                    propertyName: r.propertyName,
                    roomNo: r.roomNo,
                    bedLabel: r.bedLabel,
                    resident_data: r,
                },
            },
        });

    const openCheckout = (e, r) => {
        e.stopPropagation();
        setCheckoutModal({ resident: r });
        setCheckoutDate(todayISO());
        setCheckoutReason("");
    };

    const closeCheckout = () => {
        setCheckoutModal(null);
        setCheckoutDate("");
        setCheckoutReason("");
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        if (!checkoutReason.trim()) {
            toast.error("Please enter a reason for check-out.");
            return;
        }
        const r = checkoutModal.resident;
        setCheckoutSaving(true);
        try {
            const formData = new FormData();
            formData.append("bedId", r.bed_data_instance_id);
            formData.append("checkOut", checkoutDate);
            formData.append("checkoutReason", checkoutReason.trim());
            // carry through required fields so validation passes
            formData.append("checkIn", r.checkIn || "");

            const response = await axios.put(
                `/sales/resident-data-update/${r.id}/`,
                formData,
                {
                    headers: {
                        "X-CSRFToken": Cookies.get("csrftoken"),
                    },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                toast.success("Resident checked out successfully.");
                closeCheckout();
                fetchResidents();
            } else {
                toast.error(response.data.message || "Check-out failed.");
            }
        } catch (err) {
            toast.error("Error processing check-out. Please try again.");
        } finally {
            setCheckoutSaving(false);
        }
    };

    const exportData = filteredData.map((r) => ({
        "Property": r.propertyName || "-",
        "Room No": r.roomNo || "-",
        "Bed": r.bedLabel || "-",
        "Resident Name": r.residentsName || "-",
        "Phone": r.phoneNumber || "-",
        "Email": r.email || "-",
        "Check-in": formatDate(r.checkIn),
        "Check-out": formatDate(r.checkOut),
        "Status": residentStatus(r.checkOut),
        "KYC Status": r.kycApprovalStatus || "Pending",
        "Checkout Reason": r.checkoutReason || "-",
    }));

    const selectClass = "px-2 py-1.5 border border-gray-300 rounded text-xs text-black bg-white";

    return (
        <DashPage>
            <div className="page-header">
                <h1>Residents</h1>
                <input
                    type="text"
                    placeholder="Search name, phone, email, property…"
                    value={searchTerm}
                    onChange={handleFilterChange(setSearchTerm)}
                    className="form-input w-56 text-xs"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
                <button
                    className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B] transition-colors"
                    onClick={() => navigate("/sales/sales-resident-form/new")}
                    type="button"
                >
                    Add Resident
                </button>
                <button
                    className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B] transition-colors"
                    onClick={() => downloadCSV(exportData, "residents.csv")}
                    type="button"
                >
                    Export Data
                </button>

                <select value={propertyFilter} onChange={handleFilterChange(setPropertyFilter)} className={selectClass}>
                    {properties.map((p) => (
                        <option key={p} value={p}>
                            {p === "All" ? `All Properties (${allResidents.length})` : p}
                        </option>
                    ))}
                </select>

                <select value={statusFilter} onChange={handleFilterChange(setStatusFilter)} className={selectClass}>
                    {["All", "Active", "Checked Out"].map((s) => (
                        <option key={s} value={s}>
                            {s === "All" ? "All Statuses" : `${s} (${allResidents.filter((r) => residentStatus(r.checkOut) === s).length})`}
                        </option>
                    ))}
                </select>

                <select value={kycFilter} onChange={handleFilterChange(setKycFilter)} className={selectClass}>
                    {["All", "Pending", "Approved", "Rejected"].map((k) => (
                        <option key={k} value={k}>
                            {k === "All" ? "All KYC" : `KYC ${k}`}
                        </option>
                    ))}
                </select>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {["No.", "Property", "Room", "Bed", "Resident Name", "Phone", "Check-in", "Check-out", "Status", "KYC", "View", "Edit", "Check Out"].map((h) => (
                                    <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingData ? (
                                <tr><td colSpan="13" className="px-3 py-4 text-center text-xs text-gray-400">Loading…</td></tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((r, i) => {
                                    const status = residentStatus(r.checkOut);
                                    return (
                                        <tr key={r.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => goToDetails(r)}>
                                            <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                            <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[160px] truncate">{r.propertyName || "-"}</td>
                                            <td className="px-3 py-1.5 text-xs text-gray-800">{r.roomNo || "-"}</td>
                                            <td className="px-3 py-1.5 text-xs text-gray-800">{r.bedLabel || "-"}</td>
                                            <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[160px] truncate">{r.residentsName || "-"}</td>
                                            <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{r.phoneNumber || "-"}</td>
                                            <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{formatDate(r.checkIn)}</td>
                                            <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{formatDate(r.checkOut)}</td>
                                            <td className="px-3 py-1.5 text-xs text-gray-800">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-1.5 text-xs text-gray-800">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    r.kycApprovalStatus === "Approved" ? "bg-green-100 text-green-700"
                                                    : r.kycApprovalStatus === "Rejected" ? "bg-red-100 text-red-600"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                    {r.kycApprovalStatus || "Pending"}
                                                </span>
                                            </td>
                                            <td className="px-3 py-1.5 text-xs text-gray-800" onClick={(e) => e.stopPropagation()}>
                                                <Eye size={14} className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors" onClick={() => goToDetails(r)} />
                                            </td>
                                            <td className="px-3 py-1.5 text-xs text-gray-800" onClick={(e) => e.stopPropagation()}>
                                                <Pencil size={14} className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors" onClick={() => goToDetails(r)} />
                                            </td>
                                            <td className="px-3 py-1.5 text-xs text-gray-800" onClick={(e) => e.stopPropagation()}>
                                                {status === "Active" ? (
                                                    <LogOut
                                                        size={14}
                                                        className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                                        onClick={(e) => openCheckout(e, r)}
                                                    />
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="13" className="px-3 py-4 text-center text-xs text-gray-400">No residents found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            {/* Checkout Modal */}
            {checkoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
                        <h2 className="text-sm font-semibold text-gray-800 mb-1">Check Out Resident</h2>
                        <p className="text-xs text-gray-500 mb-4">{checkoutModal.resident.residentsName}</p>
                        <form onSubmit={handleCheckoutSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Check-out Date</label>
                                <input
                                    type="date"
                                    value={checkoutDate}
                                    onChange={(e) => setCheckoutDate(e.target.value)}
                                    required
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Reason <span className="text-red-500">*</span></label>
                                <textarea
                                    value={checkoutReason}
                                    onChange={(e) => setCheckoutReason(e.target.value)}
                                    placeholder="Enter reason for check-out…"
                                    rows={3}
                                    required
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={closeCheckout}
                                    className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={checkoutSaving}
                                    className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer disabled:opacity-60"
                                >
                                    {checkoutSaving ? "Saving…" : "Confirm Check Out"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashPage>
    );
}
