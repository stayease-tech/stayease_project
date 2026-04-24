import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import residentApi from "../residentApi";
import Navbar from "../../shared/Navbar";
import residentSidebar from "./Sidebar";
import { MessageSquare, Plus, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";

export default function residentComplaints({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ issueDesc: "", preferredTime: "" });
    const [submitting, setSubmitting] = useState(false);

    const fetchComplaints = () => {
        residentApi.get("/complaints/")
            .then((res) => { if (res.data.success) setComplaints(res.data.complaints); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(fetchComplaints, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await residentApi.post("/complaints/submit/", form, { skipGlobalErrorToast: true });
            if (res.data.success) {
                toast.success("Maintenance Request submitted!");
                setShowForm(false);
                setForm({ issueDesc: "", preferredTime: "" });
                fetchComplaints();
            } else {
                toast.error(res.data.message || "Failed to submit.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit.");
        }
        setSubmitting(false);
    };

    const statusColor = {
        Open: "bg-blue-50 text-blue-700 border-blue-200",
        "Follow Up": "bg-amber-50 text-amber-700 border-amber-200",
        Closed: "bg-green-50 text-green-700 border-green-200",
    };

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <residentSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
                <div className="page-header">
                    <div><h1>Maintenance Requests</h1><p>Raise and track your maintenance requests</p></div>
                    <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
                        <Plus size={16} /> {showForm ? "Cancel" : "New Maintenance Request"}
                    </button>
                </div>

                {showForm && (
                    <div className="card mb-6">
                        <div className="card-header"><h3>New Maintenance Request</h3></div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Issue Description *</label>
                                    <textarea
                                        className="form-input"
                                        rows={4}
                                        value={form.issueDesc}
                                        onChange={(e) => setForm({ ...form, issueDesc: e.target.value })}
                                        placeholder="Describe the issue in detail..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Preferred Time for Visit</label>
                                    <input
                                        className="form-input"
                                        value={form.preferredTime}
                                        onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                                        placeholder="e.g., Weekday mornings 10-12"
                                    />
                                </div>
                                <button className="btn btn-primary" type="submit" disabled={submitting}>
                                    {submitting ? "Submitting..." : "Submit Maintenance Request"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="loading-center"><div className="spinner"></div></div>
                ) : complaints.length === 0 ? (
                    <div className="card">
                        <div className="card-body text-center py-12 text-gray-500">
                            <MessageSquare size={48} className="mx-auto mb-3 text-gray-300" />
                            <p>No maintenance requests raised yet.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {complaints.map((c) => (
                            <div
                                key={c.id}
                                className="card cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => navigate(`/resident/complaint/${c.id}`)}
                            >
                                <div className="card-body flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            {c.ticketNumber && <span className="text-xs font-mono text-gray-400">#{c.ticketNumber}</span>}
                                            <span className={`px-2 py-0.5 rounded-full text-xs border ${statusColor[c.latestStatus] || statusColor.Open}`}>
                                                {c.latestStatus}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{c.issueDesc}</p>
                                        {c.latestCategory && <p className="text-xs text-gray-500 mt-0.5">Category: {c.latestCategory}</p>}
                                    </div>
                                    <ChevronRight size={18} className="text-gray-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
