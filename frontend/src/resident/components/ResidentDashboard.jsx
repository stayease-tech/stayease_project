// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import residentApi from "../residentApi";
import Navbar from "../../shared/Navbar";
import ResidentSidebar from "./Sidebar";
import {
    Home, CreditCard, ShieldCheck, MessageSquare,
    BedDouble, Calendar, IndianRupee, FileText
} from "lucide-react";

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
export default function residentDashboard({ isExpanded, setIsExpanded }) {
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
        <div className="bg-[#F5F5F0] min-h-screen">
            <ResidentSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
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
                                onClick={() => navigate("/resident/lease")}
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
                                <StatCard icon={IndianRupee} label="Total Due" value={`₹${data?.totalDue ?? 0}`} color="#EF4444" onClick={() => navigate("/resident/payments")} />
                                <StatCard icon={Calendar} label="Next Due Date" value={data?.nextDueDate || "—"} color="#F59E0B" />
                                <StatCard icon={CreditCard} label="Pending Invoices" value={data?.pendingRentCount ?? 0} color="#D4A017" onClick={() => navigate("/resident/payments")} />
                                <StatCard icon={MessageSquare} label="Open Maintenance Requests" value={data?.openComplaints ?? 0} color="#3B82F6" onClick={() => navigate("/resident/complaints")} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="card">
                                <div className="card-header"><h3>Property Details</h3></div>
                                <div className="card-body space-y-2 text-sm">
                                    <p><span className="text-gray-500">Property:</span> {data?.propertyName || "—"}</p>
                                    <p><span className="text-gray-500">Room:</span> {data?.roomNo || "—"}</p>
                                    <p><span className="text-gray-500">Bed:</span> {data?.bedLabel || "—"}</p>
                                    <p><span className="text-gray-500">Check-in:</span> {data?.checkIn || "—"}</p>
                                    <p><span className="text-gray-500">Check-out:</span> {data?.checkOut || "—"}</p>
                                    <p><span className="text-gray-500">Rent/month:</span> ₹{data?.rentPerMonth || "—"}</p>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header"><h3>Quick Actions</h3></div>
                                <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                                    <button className="btn btn-outline" onClick={() => navigate("/resident/profile")}>My Profile</button>
                                    {kycPending && (
                                        <button className="btn btn-outline" onClick={() => navigate("/resident/kyc")}>KYC Status</button>
                                    )}
                                    {fullyOnboarded && (
                                        <button className="btn btn-outline" onClick={() => navigate("/resident/complaints")}>Raise Maintenance Request</button>
                                    )}
                                    {!leaseCompleted && (
                                        <button className="btn btn-outline" onClick={() => navigate("/resident/lease")}>Lease Agreement</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
