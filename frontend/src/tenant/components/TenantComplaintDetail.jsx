import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import tenantApi from "../tenantApi";
import Navbar from "../../shared/Navbar";
import TenantSidebar from "./Sidebar";

export default function TenantComplaintDetail({ isExpanded, setIsExpanded }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        tenantApi.get(`/complaints/${id}/`)
            .then((res) => { if (res.data.success) setComplaint(res.data.complaint); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const statusColor = {
        Open: "bg-blue-50 text-blue-700 border-blue-200",
        "Follow Up": "bg-amber-50 text-amber-700 border-amber-200",
        Closed: "bg-green-50 text-green-700 border-green-200",
    };

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <TenantSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
                <div className="page-header">
                    <div><h1>Maintenance Request #{id}</h1><p>Maintenance request details and timeline</p></div>
                    <button className="btn btn-outline" onClick={() => navigate("/tenant/complaints")}>Back</button>
                </div>

                {loading ? (
                    <div className="loading-center"><div className="spinner"></div></div>
                ) : !complaint ? (
                    <div className="card"><div className="card-body text-center text-gray-500 py-12">Maintenance request not found.</div></div>
                ) : (
                    <>
                        <div className="card mb-6">
                            <div className="card-header"><h3>Issue Details</h3></div>
                            <div className="card-body space-y-2">
                                <p className="text-sm"><span className="text-gray-500">Resident:</span> {complaint.residentsName}</p>
                                <p className="text-sm"><span className="text-gray-500">Issue:</span> {complaint.issueDesc}</p>
                                <p className="text-sm"><span className="text-gray-500">Preferred Time:</span> {complaint.preferredTime || "Not specified"}</p>
                            </div>
                        </div>

                        {complaint.categories?.length > 0 && (
                            <div className="card">
                                <div className="card-header"><h3>Resolution Timeline</h3></div>
                                <div className="card-body">
                                    <div className="space-y-4">
                                        {complaint.categories.map((cat) => (
                                            <div key={cat.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs border ${statusColor[cat.status] || statusColor.Open}`}>
                                                        {cat.status}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-800">{cat.category_type}</span>
                                                    {cat.ticket_number && <span className="text-xs text-gray-400 font-mono">#{cat.ticket_number}</span>}
                                                </div>
                                                {cat.items && <p className="text-xs text-gray-600 mb-1">Items: {cat.items}</p>}
                                                {cat.vendor && <p className="text-xs text-gray-600 mb-1">Vendor: {cat.vendor}</p>}
                                                {cat.comments && <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">Comments: {cat.comments}</p>}

                                                {cat.feedbacks?.length > 0 && (
                                                    <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
                                                        <p className="text-xs font-semibold text-green-700 mb-1">Feedback</p>
                                                        {cat.feedbacks.map((fb, i) => (
                                                            <div key={i} className="text-xs text-green-700">
                                                                <p>Resolved: {fb.issueResolved} | Rating: {fb.ratings}/5</p>
                                                                {fb.suggestions && <p>Suggestion: {fb.suggestions}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
