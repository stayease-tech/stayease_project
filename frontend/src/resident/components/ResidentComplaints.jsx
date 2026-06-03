// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import residentApi from "../residentApi";
import Navbar from "../../shared/Navbar";
import ResidentSidebar from "./Sidebar";
import { MessageSquare, Plus, ChevronRight, Zap, Droplets, Sofa, CookingPot, Wifi, HelpCircle, ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";

const CATEGORY_OPTIONS = [
    { value: "electricalElectronics", label: "Electrical & Electronics", icon: Zap },
    { value: "plumbingBathroom", label: "Plumbing & Bathroom", icon: Droplets },
    { value: "furnituresFixtures", label: "Furniture & Fixtures", icon: Sofa },
    { value: "kitchenEquipment", label: "Kitchen Equipment", icon: CookingPot },
    { value: "internetConnectivity", label: "Internet Connectivity", icon: Wifi },
    { value: "others", label: "Other Issues", icon: HelpCircle },
];

const LOCATION_OPTIONS = [
    { value: "bedroom", label: "Bedroom" },
    { value: "bathroom", label: "Bathroom" },
    { value: "kitchen", label: "Kitchen" },
    { value: "commonArea", label: "Common Area" },
    { value: "balcony", label: "Balcony" },
    { value: "other", label: "Other" },
];

const URGENCY_OPTIONS = [
    { value: "low", label: "Low", color: "bg-green-50 text-green-700 border-green-300", desc: "Can wait a few days" },
    { value: "medium", label: "Medium", color: "bg-amber-50 text-amber-700 border-amber-300", desc: "Needs attention soon" },
    { value: "high", label: "High", color: "bg-orange-50 text-orange-700 border-orange-300", desc: "Urgent, affects daily use" },
    { value: "emergency", label: "Emergency", color: "bg-red-50 text-red-700 border-red-300", desc: "Safety risk or no utilities" },
];

const CATEGORY_LABEL_MAP = Object.fromEntries(CATEGORY_OPTIONS.map(c => [c.value, c.label]));

const INITIAL_FORM = { category: "", location: "", urgency: "medium", issueDesc: "", preferredTime: "" };

const PAGE_SIZE = 10;

/**
 * residentComplaints — lists all maintenance requests and provides a form to raise new ones.
 * Supports inline form with category, location, urgency and description fields,
 * client-side pagination, and navigation to individual complaint detail pages.
 *
 * @param {object} props
 * @param {boolean} props.isExpanded - Whether the sidebar is in expanded state.
 * @param {Function} props.setIsExpanded - Setter to toggle sidebar expanded state.
 * @returns {React.ReactElement}
 */
export default function residentComplaints({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ ...INITIAL_FORM });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    /**
     * Fetches all maintenance requests for the resident and resets pagination to page 1.
     */
    const fetchComplaints = () => {
        residentApi.get("/complaints/", { skipGlobalErrorToast: true })
            .then((res) => {
                if (res.data.success) {
                    setComplaints(res.data.complaints);
                    setCurrentPage(1);
                }
            })
            .catch((err) => { console.error(err); })
            .finally(() => setLoading(false));
    };

    useEffect(fetchComplaints, []);

    /**
     * Validates the complaint submission form.
     * Sets field-level error messages and returns whether the form is valid.
     *
     * @returns {boolean} `true` if all required fields pass validation.
     */
    const validate = () => {
        const e = {};
        if (!form.category) e.category = "Please select a category.";
        if (!form.location) e.location = "Please select a location.";
        if (!form.urgency) e.urgency = "Please select an urgency level.";
        if (!form.issueDesc.trim()) e.issueDesc = "Issue description is required.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /**
     * Handles maintenance request form submission.
     * Validates inputs, posts to the API, and refreshes the complaints list on success.
     *
     * @param {React.FormEvent} e - The form submit event.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const res = await residentApi.post("/complaints/submit/", form, { skipGlobalErrorToast: true });
            if (res.data.success) {
                toast.success("Maintenance request submitted!");
                setShowForm(false);
                setForm({ ...INITIAL_FORM });
                setErrors({});
                fetchComplaints();
            } else {
                toast.error(res.data.message || "Failed to submit.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit.");
        }
        setSubmitting(false);
    };

    /**
     * Updates a single field in the complaint form state and clears its validation error.
     *
     * @param {string} field - The form field key to update.
     * @param {string} value - The new value for the field.
     */
    const set = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    };

    const statusColor = {
        Open: "bg-blue-50 text-blue-700 border-blue-200",
        "Follow Up": "bg-amber-50 text-amber-700 border-amber-200",
        Closed: "bg-green-50 text-green-700 border-green-200",
    };

    const urgencyBadge = {
        low: "bg-green-50 text-green-700",
        medium: "bg-amber-50 text-amber-700",
        high: "bg-orange-50 text-orange-700",
        emergency: "bg-red-50 text-red-700",
    };

    const totalPages = Math.ceil(complaints.length / PAGE_SIZE);
    const paginated = complaints.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <ResidentSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
                <div className="page-header">
                    <div><h1>Maintenance Requests</h1><p>Raise and track your maintenance requests</p></div>
                    <button className="btn btn-primary flex items-center gap-2" onClick={() => { setShowForm(!showForm); setErrors({}); }}>
                        <Plus size={16} /> {showForm ? "Cancel" : "New Request"}
                    </button>
                </div>

                {showForm && (
                    <div className="card mb-6">
                        <div className="card-header"><h3>New Maintenance Request</h3></div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">Category *</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {CATEGORY_OPTIONS.map(opt => {
                                            const Icon = opt.icon;
                                            const selected = form.category === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => set("category", opt.value)}
                                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all text-left ${
                                                        selected
                                                            ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                                                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <Icon size={16} className={selected ? "text-blue-500" : "text-gray-400"} />
                                                    <span className="truncate">{opt.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                                </div>

                                {/* Location & Urgency row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Location *</label>
                                        <select
                                            className={`form-input ${errors.location ? "border-red-400" : ""}`}
                                            value={form.location}
                                            onChange={(e) => set("location", e.target.value)}
                                        >
                                            <option value="">Select location</option>
                                            {LOCATION_OPTIONS.map(l => (
                                                <option key={l.value} value={l.value}>{l.label}</option>
                                            ))}
                                        </select>
                                        {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-2">Urgency *</label>
                                        <div className="flex gap-2">
                                            {URGENCY_OPTIONS.map(u => (
                                                <button
                                                    key={u.value}
                                                    type="button"
                                                    onClick={() => set("urgency", u.value)}
                                                    title={u.desc}
                                                    className={`flex-1 px-2 py-1.5 rounded-md border text-xs font-medium transition-all ${
                                                        form.urgency === u.value
                                                            ? `${u.color} ring-1 ring-current`
                                                            : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {u.label}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.urgency && <p className="text-xs text-red-500 mt-1">{errors.urgency}</p>}
                                    </div>
                                </div>

                                {/* Issue Description */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Issue Description *</label>
                                    <textarea
                                        className={`form-input ${errors.issueDesc ? "border-red-400" : ""}`}
                                        rows={4}
                                        value={form.issueDesc}
                                        onChange={(e) => set("issueDesc", e.target.value)}
                                        placeholder="Describe the issue — what's broken, when it started, any relevant details..."
                                    />
                                    {errors.issueDesc && <p className="text-xs text-red-500 mt-1">{errors.issueDesc}</p>}
                                </div>

                                {/* Preferred Time */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Time for Visit</label>
                                    <input
                                        className="form-input"
                                        value={form.preferredTime}
                                        onChange={(e) => set("preferredTime", e.target.value)}
                                        placeholder="e.g., Weekday mornings 10 AM – 12 PM"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Optional — let us know when you're available for the service visit</p>
                                </div>

                                {/* Submit */}
                                <div className="flex justify-end pt-2">
                                    <button
                                        className="btn btn-outline mr-3"
                                        type="button"
                                        onClick={() => { setShowForm(false); setForm({ ...INITIAL_FORM }); setErrors({}); }}
                                    >
                                        Cancel
                                    </button>
                                    <button className="btn btn-primary" type="submit" disabled={submitting}>
                                        {submitting ? "Submitting..." : "Submit Request"}
                                    </button>
                                </div>
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
                    <>
                        <div className="space-y-3">
                            {paginated.map((c) => {
                                const catObj = CATEGORY_OPTIONS.find(o => o.value === c.category);
                                const CatIcon = catObj?.icon || MessageSquare;
                                return (
                                    <div
                                        key={c.id}
                                        className="card cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => navigate(`/resident/complaint/${c.id}`)}
                                    >
                                        <div className="card-body flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                    <CatIcon size={18} className="text-gray-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                        {c.ticketNumber && <span className="text-xs font-mono text-gray-400">#{c.ticketNumber}</span>}
                                                        <span className={`px-2 py-0.5 rounded-full text-xs border ${statusColor[c.latestStatus] || statusColor.Open}`}>
                                                            {c.latestStatus}
                                                        </span>
                                                        {c.urgency && (
                                                            <span className={`px-2 py-0.5 rounded-full text-xs ${urgencyBadge[c.urgency] || ""}`}>
                                                                {c.urgency.charAt(0).toUpperCase() + c.urgency.slice(1)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{c.issueDesc}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {catObj?.label || c.latestCategory || "Uncategorized"}
                                                        {c.submittedAt && <span className="ml-2 text-gray-400">· {c.submittedAt}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="text-gray-400 flex-shrink-0 ml-2" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-sm text-gray-500">
                                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, complaints.length)} of {complaints.length} requests
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        disabled={currentPage === 1}
                                        className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-md text-sm border transition-colors ${
                                                page === currentPage
                                                    ? "bg-blue-600 text-white border-blue-600"
                                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
