import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import tenantApi from "../tenantApi";
import Navbar from "../../shared/Navbar";
import TenantSidebar from "./Sidebar";
import {
    Home, CreditCard, ShieldCheck, MessageSquare,
    BedDouble, Calendar, IndianRupee
} from "lucide-react";

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

export default function TenantDashboard({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        tenantApi.get("/dashboard/")
            .then((res) => { if (res.data.success) setData(res.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const kycPending = data?.kycApprovalStatus !== "Approved";

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <TenantSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
                <div className="page-header">
                    <div>
                        <h1>Welcome, {data?.residentsName || "Tenant"}</h1>
                        <p>{data?.propertyName ? `${data.propertyName} — Room ${data.roomNo}` : "Your tenant portal"}</p>
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
                                onClick={() => navigate("/tenant/tenant-kyc")}
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
                                            Some features are restricted until KYC is approved.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="stats-grid">
                            <StatCard icon={IndianRupee} label="Total Due" value={`₹${data?.totalDue ?? 0}`} color="#EF4444" onClick={() => navigate("/tenant/tenant-rent")} />
                            <StatCard icon={Calendar} label="Next Due Date" value={data?.nextDueDate || "—"} color="#F59E0B" />
                            <StatCard icon={CreditCard} label="Pending Invoices" value={data?.pendingRentCount ?? 0} color="#D4A017" onClick={() => navigate("/tenant/tenant-rent")} />
                            <StatCard icon={MessageSquare} label="Open Complaints" value={data?.openComplaints ?? 0} color="#3B82F6" onClick={() => navigate("/tenant/tenant-complaints")} />
                        </div>

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
                                    <button className="btn btn-outline" onClick={() => navigate("/tenant/tenant-profile")}>My Profile</button>
                                    <button className="btn btn-outline" onClick={() => navigate("/tenant/tenant-kyc")}>KYC Status</button>
                                    <button className="btn btn-outline" onClick={() => navigate("/tenant/tenant-complaints")}>Raise Complaint</button>
                                    <button className="btn btn-outline" onClick={() => navigate("/tenant/tenant-lease")}>Lease Agreement</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
