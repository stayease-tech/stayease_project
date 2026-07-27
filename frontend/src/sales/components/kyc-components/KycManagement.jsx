import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

const PAGE_SIZE = 10;

const STATUS_BADGE = {
    Pending:  "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function KycManagement() {
    const navigate = useNavigate();
    const { getOptions } = useDropdowns();
    const TABS = getOptions('kyc_approval_statuses');
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("Pending");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchResidents = (status) => {
        setLoading(true);
        setCurrentPage(1);
        axios.get(`/operations/kyc-pending/?status=${status}`)
            .then((res) => { if (res.data.success) setResidents(res.data.residents); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchResidents(filter); }, [filter]);

    const totalPages = Math.max(1, Math.ceil(residents.length / PAGE_SIZE));
    const paged = residents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <DashPage>
            <div className="page-header">
                <div>
                    <h1>KYC Management</h1>
                    <p>Review and approve resident KYC documents</p>
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-2 mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                            filter === tab
                                ? "bg-[#D4A017] text-white border-[#D4A017]"
                                : "bg-white text-gray-600 border-gray-300 hover:border-[#D4A017] hover:text-[#D4A017]"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-center"><div className="spinner"></div></div>
            ) : residents.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center py-12 text-gray-500">
                        <ShieldCheck size={48} className="mx-auto mb-3 text-gray-300" />
                        <p>No {filter.toLowerCase()} KYC requests.</p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="divide-y divide-gray-100">
                        {paged.map((t) => (
                            <div
                                key={t.id}
                                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => navigate(`/sales/sales-kyc-management/${t.id}`, { state: { resident: t, filter } })}
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">{t.residentsName}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_BADGE[t.kycApprovalStatus] || ""}`}>
                                                {t.kycApprovalStatus}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{t.phoneNumber} &bull; {t.email} &bull; Room {t.roomNo}</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                    <div className="px-5 py-3 border-t border-gray-100">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            )}
        </DashPage>
    );
}
