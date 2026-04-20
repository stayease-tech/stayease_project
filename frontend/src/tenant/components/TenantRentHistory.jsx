import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import tenantApi from "../tenantApi";
import Navbar from "../../shared/Navbar";
import TenantSidebar from "./Sidebar";
import { IndianRupee, CheckCircle, XCircle, Clock } from "lucide-react";

export default function TenantRentHistory({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        tenantApi.get("/rent-history/")
            .then((res) => { if (res.data.success) setRecords(res.data.rentRecords); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statusIcon = (status) => {
        if (status === "Received") return <CheckCircle size={16} className="text-green-500" />;
        if (status === "Not Received") return <XCircle size={16} className="text-red-500" />;
        return <Clock size={16} className="text-amber-500" />;
    };

    const statusBadge = (status) => {
        const colors = {
            Received: "bg-green-50 text-green-700 border-green-200",
            "Not Received": "bg-red-50 text-red-700 border-red-200",
        };
        return `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${colors[status] || "bg-gray-50 text-gray-700 border-gray-200"}`;
    };

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <TenantSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
                <div className="page-header">
                    <div><h1>Rent History</h1><p>View all your rent records and invoices</p></div>
                </div>

                {loading ? (
                    <div className="loading-center"><div className="spinner"></div></div>
                ) : records.length === 0 ? (
                    <div className="card">
                        <div className="card-body text-center py-12 text-gray-500">
                            <IndianRupee size={48} className="mx-auto mb-3 text-gray-300" />
                            <p>No rent records found.</p>
                        </div>
                    </div>
                ) : (
                    <div className="card">
                        <div className="card-body p-0">
                            <div className="overflow-x-auto">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Month</th>
                                            <th>Rent</th>
                                            <th>Delay Charges</th>
                                            <th>Status</th>
                                            <th>Transfer Type</th>
                                            <th>UTR</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map((r) => (
                                            <tr key={r.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/tenant/tenant-invoice/${r.id}`)}>
                                                <td className="font-medium">{r.month}</td>
                                                <td>₹{r.rent}</td>
                                                <td>{r.delayCharges ? `₹${r.delayCharges}` : "—"}</td>
                                                <td><span className={statusBadge(r.rentStatus)}>{statusIcon(r.rentStatus)} {r.rentStatus}</span></td>
                                                <td>{r.transferType || "—"}</td>
                                                <td className="text-xs">{r.utrNumber || "—"}</td>
                                                <td>{r.transferredDate || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
