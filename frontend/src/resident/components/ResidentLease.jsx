import { useState, useEffect } from "react";
import residentApi from "../residentApi";
import Navbar from "../../shared/Navbar";
import residentSidebar from "./Sidebar";
import { FileText, ExternalLink } from "lucide-react";

export default function residentLease({ isExpanded, setIsExpanded }) {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        residentApi.get("/lease/")
            .then((res) => { if (res.data.success) setDocs(res.data.documents); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <residentSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
                <div className="page-header">
                    <div><h1>Lease Agreement</h1><p>View and sign your lease documents</p></div>
                </div>

                {loading ? (
                    <div className="loading-center"><div className="spinner"></div></div>
                ) : docs.length === 0 ? (
                    <div className="card">
                        <div className="card-body text-center py-12 text-gray-500">
                            <FileText size={48} className="mx-auto mb-3 text-gray-300" />
                            <p>No lease documents found.</p>
                            <p className="text-xs mt-1">Your lease agreement will appear here once prepared by the operations team.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {docs.map((doc) => (
                            <div key={doc.id} className="card">
                                <div className="card-body">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">{doc.title}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">Recipient: {doc.recipientName}</p>
                                            <p className="text-xs text-gray-500">Created: {doc.createdAt?.split("T")[0]}</p>
                                        </div>
                                        {doc.pdfUrl && (
                                            <a href={doc.pdfUrl} target="_blank" rel="noreferrer" className="btn btn-outline text-xs flex items-center gap-1">
                                                <FileText size={14} /> View PDF
                                            </a>
                                        )}
                                    </div>

                                    {doc.signingRequests?.length > 0 && (
                                        <div className="mt-4 border-t border-gray-100 pt-3">
                                            <p className="text-xs font-semibold text-gray-700 mb-2">E-Sign Status</p>
                                            {doc.signingRequests.map((sr, i) => (
                                                <div key={i} className="flex items-center gap-3 text-xs mb-1">
                                                    <span className={`px-2 py-0.5 rounded-full border ${
                                                        sr.status === "completed" ? "bg-green-50 text-green-700 border-green-200"
                                                        : sr.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200"
                                                        : "bg-gray-50 text-gray-700 border-gray-200"
                                                    }`}>{sr.status}</span>
                                                    <span className="text-gray-500">Sent: {sr.sentAt?.split("T")[0]}</span>
                                                    {sr.signingUrl && sr.status !== "completed" && (
                                                        <a href={sr.signingUrl} target="_blank" rel="noreferrer"
                                                            className="text-[#D4A017] hover:underline flex items-center gap-1">
                                                            Sign Now <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
