// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import residentApi from "../residentApi";
import {
    CreditCard, ShieldCheck, MessageSquare,
    Calendar, IndianRupee, FileText, User
} from "lucide-react";
import { DashPage } from "../../shared/Dashboard";

/**
 * StatCard — displays a single dashboard metric with an icon, value, and label.
 *
 * @param {object} props
 * @param {React.ElementType} props.icon - Lucide icon component to render.
 * @param {string} props.label - Descriptive label shown below the value.
 * @param {string|number} props.value - The metric value to display.
 * @param {string} props.color - Hex/CSS colour used for the icon background tint.
 * @param {Function} [props.onClick] - Optional click handler; adds pointer cursor when provided.
 * @returns {React.ReactElement}
 */
function StatCard({ icon: Icon, label, value, color, onClick }) {
    return (
        <div className={`stat-card ${onClick ? "cursor-pointer" : ""}`} onClick={onClick}>
            <div className="stat-icon" style={{ background: color + "20", color }}>
                <Icon size={22} />
            </div>
            <div className="stat-value">{value ?? "—"}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

function ActionTile({ icon: Icon, label, onClick, color = "#D4A017" }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-[#D4A017] hover:shadow-sm transition-all group"
        >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "18" }}>
                <Icon size={19} style={{ color }} />
            </div>
            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 text-center leading-tight">{label}</span>
        </button>
    );
}

/**
 * residentDashboard — main overview page for the resident portal.
 * Fetches dashboard data on mount and conditionally shows KYC/lease banners,
 * financial stat cards, property details, and quick-action shortcuts.
 *
 * @param {object} props
 * @param {boolean} props.isExpanded - Whether the sidebar is in expanded state.
 * @param {Function} props.setIsExpanded - Setter to toggle sidebar expanded state.
 * @returns {React.ReactElement}
 */
export default function residentDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        residentApi.get("/dashboard/")
            .then((res) => {
                if (res.data.success) {
                    setData(res.data);
                    // Keep localStorage in sync so Sidebar reflects current status
                    try {
                        const stored = JSON.parse(localStorage.getItem("residentData") || "{}");
                        stored.kycApprovalStatus = res.data.kycApprovalStatus;
                        stored.leaseCompleted = res.data.leaseCompleted;
                        localStorage.setItem("residentData", JSON.stringify(stored));
                    } catch { /* ignore */ }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const kycPending = data?.kycApprovalStatus !== "Approved";
    const leaseCompleted = data?.leaseCompleted === true;
    const fullyOnboarded = !kycPending && leaseCompleted;

    return (
        <DashPage>
                <div className="page-header">
                    <div>
                        <h1>Welcome, {data?.residentsName || "Resident"}</h1>
                        <p>{data?.propertyName ? `${data.propertyName} — Room ${data.roomNo}` : "Your resident portal"}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-center"><div className="spinner"></div></div>
                ) : (
                    <>
                        {/* KYC Banner */}
                        {kycPending && (
                            <div
                                className="mb-6 p-4 rounded-xl border cursor-pointer transition-colors"
                                style={{
                                    background: data?.kycApprovalStatus === "Rejected" ? "#FEF2F2" : "#FFFBEB",
                                    borderColor: data?.kycApprovalStatus === "Rejected" ? "#FCA5A5" : "#FCD34D",
                                }}
                                onClick={() => navigate("/resident/kyc")}
                            >
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={24} className={data?.kycApprovalStatus === "Rejected" ? "text-red-500" : "text-amber-500"} />
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {data?.kycApprovalStatus === "Rejected"
                                                ? "KYC Rejected — Please re-upload your documents"
                                                : "KYC Pending — Complete your verification"}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-0.5">
                                            Complete your KYC verification to proceed with the lease agreement.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Lease Pending Banner — shown after KYC is approved but lease not yet completed */}
                        {!kycPending && !leaseCompleted && (
                            <div
                                className="mb-6 p-4 rounded-xl border cursor-pointer transition-colors bg-blue-50 border-blue-200"
                                onClick={() => navigate("/resident/profile")}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText size={24} className="text-blue-500" />
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            Lease Agreement Pending
                                        </p>
                                        <p className="text-sm text-gray-600 mt-0.5">
                                            Your KYC is verified. Your lease agreement will be shared with you shortly.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {fullyOnboarded && (
                            <div className="stats-grid">
                                <StatCard icon={IndianRupee} label="Total Due" value={data?.totalDue > 0 ? `₹${data.totalDue.toLocaleString('en-IN')}` : "₹0"} color="#EF4444" onClick={() => navigate("/resident/payments")} />
                                <StatCard icon={Calendar} label="Next Due Date" value={data?.nextDueDate || "—"} color="#F59E0B" />
                                <StatCard icon={CreditCard} label="Pending Invoices" value={data?.pendingRentCount ?? 0} color="#D4A017" onClick={() => navigate("/resident/payments")} />
                                <StatCard icon={MessageSquare} label="Open Requests" value={data?.openComplaints ?? 0} color="#3B82F6" onClick={() => navigate("/resident/complaints")} />
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="card mt-6">
                            <div className="card-header"><h3>Quick Actions</h3></div>
                            <div className="card-body">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <ActionTile icon={User} label="My Profile" onClick={() => navigate("/resident/profile")} />
                                    {kycPending && (
                                        <ActionTile icon={ShieldCheck} label="KYC Status" onClick={() => navigate("/resident/kyc")} color="#F59E0B" />
                                    )}
                                    {fullyOnboarded && (
                                        <ActionTile icon={MessageSquare} label="Maintenance" onClick={() => navigate("/resident/complaints")} color="#3B82F6" />
                                    )}
                                    {fullyOnboarded && (
                                        <ActionTile icon={CreditCard} label="Payments" onClick={() => navigate("/resident/payments")} color="#10B981" />
                                    )}
                                    {!leaseCompleted && (
                                        <ActionTile icon={FileText} label="Lease" onClick={() => navigate("/resident/profile")} color="#6366F1" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
        </DashPage>
    );
}
