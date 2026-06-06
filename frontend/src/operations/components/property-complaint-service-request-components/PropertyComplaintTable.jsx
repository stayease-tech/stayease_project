// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Wrench, ChevronRight, Search } from "lucide-react";
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

const PAGE_SIZE = 10;

const STATUS_BADGE = {
    Open:        "bg-blue-50 text-blue-700 border-blue-200",
    "Follow Up": "bg-amber-50 text-amber-700 border-amber-200",
    Closed:      "bg-green-50 text-green-700 border-green-200",
};

const URGENCY_BADGE = {
    low:       "bg-green-50 text-green-700",
    medium:    "bg-amber-50 text-amber-700",
    high:      "bg-orange-50 text-orange-700",
    emergency: "bg-red-50 text-red-700",
};

const STATUS_TABS = ["All", "Open", "Follow Up", "Closed"];

export default function PropertyComplaintTable() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        axios.get("/operations/get-propertycomplaint-data/")
            .then((res) => { if (res.data.complaints_array) setComplaints(res.data.complaints_array); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = complaints.filter((c) => {
        const matchStatus = statusFilter === "All" || c.status === statusFilter;
        const q = search.toLowerCase();
        const matchSearch = !q || [c.residentsName, c.ticket_number, c.category_type, c.roomNo, c.phoneNumber]
            .some((v) => String(v || "").toLowerCase().includes(q));
        return matchStatus && matchSearch;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleFilterChange = (s) => { setStatusFilter(s); setCurrentPage(1); };
    const handleSearch = (e) => { setSearch(e.target.value); setCurrentPage(1); };

    return (
        <DashPage>
            <div className="page-header">
                <div>
                    <h1>Complaints</h1>
                    <p>Property complaints and service requests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex gap-2">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleFilterChange(tab)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                statusFilter === tab
                                    ? "bg-[#D4A017] text-white border-[#D4A017]"
                                    : "bg-white text-gray-600 border-gray-300 hover:border-[#D4A017] hover:text-[#D4A017]"
                            }`}
                        >
                            {tab}
                            {tab !== "All" && (
                                <span className="ml-1.5 text-xs opacity-70">
                                    ({complaints.filter((c) => c.status === tab).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, ticket, category..."
                        value={search}
                        onChange={handleSearch}
                        className="form-input pl-8 py-2 text-sm w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-center"><div className="spinner"></div></div>
            ) : filtered.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center py-12 text-gray-500">
                        <Wrench size={40} className="mx-auto mb-3 text-gray-300" />
                        <p>No complaints found.</p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="divide-y divide-gray-100">
                        {paged.map((c) => (
                            <div
                                key={c.id}
                                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => navigate(`/operations/operations-propertycomplaint-data/${c.id}`, { state: { data: c } })}
                            >
                                <div className="flex-1 min-w-0 grid grid-cols-12 gap-2 items-center">
                                    {/* Ticket + name */}
                                    <div className="col-span-4">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-semibold text-gray-900 truncate">{c.residentsName || "—"}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-mono">{c.ticket_number || "No ticket"}</p>
                                    </div>

                                    {/* Room + phone */}
                                    <div className="col-span-3">
                                        <p className="text-sm text-gray-700">Room {c.roomNo || "—"}</p>
                                        <p className="text-xs text-gray-400">{c.phoneNumber || "—"}</p>
                                    </div>

                                    {/* Category */}
                                    <div className="col-span-3">
                                        <p className="text-sm text-gray-700 truncate">{c.category_type || "—"}</p>
                                        {c.resident_urgency && (
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${URGENCY_BADGE[c.resident_urgency?.toLowerCase()] || "bg-gray-50 text-gray-500"}`}>
                                                {c.resident_urgency}
                                            </span>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2 flex justify-end">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[c.status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                                            {c.status || "Open"}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                    <div className="px-5 py-3 border-t border-gray-100">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                </div>
            )}
        </DashPage>
    );
}
