import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../../shared/Navbar";
import { ShieldCheck, Check, X, Eye, ChevronDown } from "lucide-react";
import { useDropdowns } from "../../../shared/DropdownContext";

export default function KycManagement({ isExpanded, setIsExpanded }) {
    const { getOptions } = useDropdowns();
    const TABS = getOptions('kyc_approval_statuses');
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("Pending");
    const [selectedResident, setSelectedResident] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [processing, setProcessing] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "" });

    const Sidebar = useSidebar();

    const fetchResidents = (status) => {
        setLoading(true);
        setSelectedResident(null);
        axios.get(`/operations/kyc-pending/?status=${status}`)
            .then((res) => { if (res.data.success) setResidents(res.data.residents); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchResidents(filter); }, [filter]);

    const handleApprove = async (residentId) => {
        setProcessing(true);
        try {
            const res = await axios.post(`/operations/kyc-approve/${residentId}/`);
            if (res.data.success) {
                setMsg({ text: res.data.message, type: "success" });
                fetchResidents(filter);
            }
        } catch {
            setMsg({ text: "Failed to approve.", type: "error" });
        }
        setProcessing(false);
    };

    const handleReject = async (residentId) => {
        if (!rejectReason.trim()) {
            setMsg({ text: "Please provide a rejection reason.", type: "error" });
            return;
        }
        setProcessing(true);
        try {
            const res = await axios.post(`/operations/kyc-reject/${residentId}/`, { reason: rejectReason });
            if (res.data.success) {
                setMsg({ text: res.data.message, type: "success" });
                fetchResidents(filter);
                setRejectReason("");
            }
        } catch {
            setMsg({ text: "Failed to reject.", type: "error" });
        }
        setProcessing(false);
    };

    const statusBadge = (status) => {
        const colors = {
            Pending: "bg-amber-50 text-amber-700 border-amber-200",
            Approved: "bg-green-50 text-green-700 border-green-200",
            Rejected: "bg-red-50 text-red-700 border-red-200",
        };
        return `px-2 py-0.5 rounded-full text-xs border ${colors[status] || ""}`;
    };

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            {Sidebar && <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />}
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
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

                {msg.text && (
                    <div className={`mb-4 p-3 rounded-lg text-sm border ${msg.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                        {msg.text}
                    </div>
                )}

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
                    <div className="space-y-3">
                        {residents.map((t) => (
                            <div key={t.id} className="card">
                                <div
                                    className="card-body cursor-pointer"
                                    onClick={() => setSelectedResident(selectedResident?.id === t.id ? null : t)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-sm font-semibold text-gray-900">{t.residentsName}</span>
                                                <span className={statusBadge(t.kycApprovalStatus)}>{t.kycApprovalStatus}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">{t.phoneNumber} &bull; {t.email}</p>
                                            <p className="text-xs text-gray-500">{t.propertyName} — Room {t.roomNo}</p>
                                        </div>
                                        <ChevronDown size={18} className={`text-gray-400 transition-transform ${selectedResident?.id === t.id ? "rotate-180" : ""}`} />
                                    </div>
                                </div>

                                {selectedResident?.id === t.id && (
                                    <div className="border-t border-gray-100 p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <DocSection label="Aadhaar" number={t.aadharNumber} frontUrl={t.aadharFrontCopy} backUrl={t.aadharBackCopy} />
                                            <DocSection label="PAN" number={t.panNumber} frontUrl={t.panFrontCopy} backUrl={t.panBackCopy} />
                                            <DocSection label={t.studentEmployeeIdType || "Student/Employee ID"} number={t.studentEmployeeIdNumber} frontUrl={t.studentEmployeeIdCopy} />
                                        </div>

                                        {t.kycRejectionReason && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                                <span className="font-medium">Rejection reason:</span> {t.kycRejectionReason}
                                            </div>
                                        )}

                                        {filter === "Approved" && (
                                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                                                <Check size={16} /> KYC verified and approved.
                                            </div>
                                        )}

                                        {filter === "Pending" && (
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button
                                                    className="btn btn-primary flex items-center gap-2"
                                                    onClick={() => handleApprove(t.id)}
                                                    disabled={processing}
                                                >
                                                    <Check size={16} /> Approve
                                                </button>
                                                <div className="flex gap-2 flex-1">
                                                    <input
                                                        className="form-input flex-1 text-sm"
                                                        placeholder="Rejection reason..."
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                    />
                                                    <button
                                                        className="btn bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
                                                        onClick={() => handleReject(t.id)}
                                                        disabled={processing}
                                                    >
                                                        <X size={16} /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {filter === "Rejected" && (
                                            <button
                                                className="btn btn-primary flex items-center gap-2"
                                                onClick={() => handleApprove(t.id)}
                                                disabled={processing}
                                            >
                                                <Check size={16} /> Re-approve
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function DocSection({ label, number, frontUrl, backUrl }) {
    return (
        <div className="border border-gray-200 rounded-lg p-3">
            <p className="font-semibold text-sm text-gray-800 mb-1">{label}</p>
            <p className="text-xs text-gray-500 mb-2">{number || "Not provided"}</p>
            <div className="flex gap-2 text-xs">
                {frontUrl && <a href={frontUrl} target="_blank" rel="noreferrer" className="text-[#D4A017] hover:underline flex items-center gap-1"><Eye size={12} /> Front</a>}
                {backUrl && <a href={backUrl} target="_blank" rel="noreferrer" className="text-[#D4A017] hover:underline flex items-center gap-1"><Eye size={12} /> Back</a>}
                {!frontUrl && !backUrl && <span className="text-gray-400">No documents</span>}
            </div>
        </div>
    );
}

/** Lazy sidebar loader */
function useSidebar() {
    const [Comp, setComp] = useState(null);
    useEffect(() => {
        import("../Sidebar").then((mod) => setComp(() => mod.default));
    }, []);
    return Comp;
}
