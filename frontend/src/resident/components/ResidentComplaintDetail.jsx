// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import residentApi from "../residentApi";
import Navbar from "../../shared/Navbar";
import ResidentSidebar from "./Sidebar";
import {
    ChevronLeft, MapPin, Clock, Tag, Calendar,
    Zap, Droplets, Sofa, CookingPot, Wifi, HelpCircle, MessageSquare,
    User, Wrench, Star, CheckCircle2, Circle, AlertCircle
} from "lucide-react";

const CATEGORY_ICON_MAP = {
    electricalElectronics: Zap,
    plumbingBathroom: Droplets,
    furnituresFixtures: Sofa,
    kitchenEquipment: CookingPot,
    internetConnectivity: Wifi,
    others: HelpCircle,
};

const CATEGORY_LABEL_MAP = {
    electricalElectronics: "Electrical & Electronics",
    plumbingBathroom: "Plumbing & Bathroom",
    furnituresFixtures: "Furniture & Fixtures",
    kitchenEquipment: "Kitchen Equipment",
    internetConnectivity: "Internet Connectivity",
    others: "Other Issues",
};

const urgencyConfig = {
    low: { label: "Low", cls: "bg-green-50 text-green-700 border-green-200" },
    medium: { label: "Medium", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    high: { label: "High", cls: "bg-orange-50 text-orange-700 border-orange-200" },
    emergency: { label: "Emergency", cls: "bg-red-50 text-red-700 border-red-200" },
};

const statusConfig = {
    Open: { label: "Open", cls: "bg-blue-50 text-blue-700 border-blue-200", icon: Circle },
    "Follow Up": { label: "Follow Up", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertCircle },
    Closed: { label: "Closed", cls: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
};

/**
 * StarRating — renders a row of five stars filled up to the given rating value.
 *
 * @param {object} props
 * @param {number} props.value - Integer rating from 1 to 5.
 * @returns {React.ReactElement}
 */
function StarRating({ value }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    size={14}
                    className={i <= value ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
                />
            ))}
        </div>
    );
}

/**
 * residentComplaintDetail — detailed view of a single maintenance request.
 * Fetches complaint data by route param `id` and renders a summary card,
 * meta grid (category, location, date, preferred time), and a resolution timeline
 * showing each status update with vendor/technician info and resident feedback.
 *
 * @param {object} props
 * @param {boolean} props.isExpanded - Whether the sidebar is in expanded state.
 * @param {Function} props.setIsExpanded - Setter to toggle sidebar expanded state.
 * @returns {React.ReactElement}
 */
export default function residentComplaintDetail({ isExpanded, setIsExpanded }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        residentApi.get(`/complaints/${id}/`)
            .then((res) => { if (res.data.success) setComplaint(res.data.complaint); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const latestStatus = complaint?.categories?.length > 0
        ? complaint.categories[complaint.categories.length - 1].status
        : "Open";

    const statusCfg = statusConfig[latestStatus] || statusConfig.Open;
    const StatusIcon = statusCfg.icon;
    const CatIcon = CATEGORY_ICON_MAP[complaint?.rawCategory] || MessageSquare;

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <ResidentSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>

                {/* Page header */}
                <div className="page-header">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/resident/complaints")}
                            className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-white transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div>
                            <h1>Maintenance Request</h1>
                            <p>Request details and resolution timeline</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-center"><div className="spinner"></div></div>
                ) : !complaint ? (
                    <div className="card">
                        <div className="card-body text-center py-16">
                            <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-500">Maintenance request not found.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">

                        {/* Issue summary card */}
                        <div className="card">
                            <div className="card-body">
                                {/* Top row: icon, title, status badge */}
                                <div className="flex items-start gap-4 mb-5">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <CatIcon size={22} className="text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            {complaint.ticketNumber && (
                                                <span className="text-xs font-mono text-gray-400">#{complaint.ticketNumber}</span>
                                            )}
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${statusCfg.cls}`}>
                                                <StatusIcon size={11} />
                                                {latestStatus}
                                            </span>
                                            {complaint.urgency && (
                                                <span className={`px-2 py-0.5 rounded-full text-xs border ${(urgencyConfig[complaint.urgency?.toLowerCase()] || urgencyConfig.medium).cls}`}>
                                                    {complaint.urgency}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-base font-semibold text-gray-900 leading-snug">{complaint.issueDesc}</p>
                                    </div>
                                </div>

                                {/* Meta grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-100 pt-4">
                                    {complaint.category && (
                                        <div className="flex items-start gap-2">
                                            <Tag size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-400">Category</p>
                                                <p className="text-sm font-medium text-gray-800">{complaint.category}</p>
                                            </div>
                                        </div>
                                    )}
                                    {complaint.location && (
                                        <div className="flex items-start gap-2">
                                            <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-400">Location</p>
                                                <p className="text-sm font-medium text-gray-800 capitalize">{complaint.location}</p>
                                            </div>
                                        </div>
                                    )}
                                    {complaint.submittedAt && (
                                        <div className="flex items-start gap-2">
                                            <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-400">Submitted</p>
                                                <p className="text-sm font-medium text-gray-800">{complaint.submittedAt}</p>
                                            </div>
                                        </div>
                                    )}
                                    {complaint.preferredTime && (
                                        <div className="flex items-start gap-2">
                                            <Clock size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-400">Preferred Time</p>
                                                <p className="text-sm font-medium text-gray-800">{complaint.preferredTime}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Resolution timeline */}
                        {complaint.categories?.length > 0 && (
                            <div className="card">
                                <div className="card-header">
                                    <h3>Resolution Timeline</h3>
                                </div>
                                <div className="card-body">
                                    <div className="relative">
                                        {/* Vertical line */}
                                        {complaint.categories.length > 1 && (
                                            <div className="absolute left-4 top-5 bottom-5 w-px bg-gray-200" />
                                        )}

                                        <div className="space-y-5">
                                            {complaint.categories.map((cat, idx) => {
                                                const isLast = idx === complaint.categories.length - 1;
                                                const sCfg = statusConfig[cat.status] || statusConfig.Open;
                                                const SIcon = sCfg.icon;

                                                return (
                                                    <div key={cat.id} className="flex gap-4">
                                                        {/* Timeline dot */}
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${
                                                            isLast
                                                                ? "bg-blue-50 border-blue-300"
                                                                : "bg-white border-gray-200"
                                                        }`}>
                                                            <SIcon size={14} className={isLast ? "text-blue-500" : "text-gray-400"} />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0 pb-1">
                                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${sCfg.cls}`}>
                                                                    {cat.status}
                                                                </span>
                                                                <span className="text-sm font-semibold text-gray-800">{cat.category_type}</span>
                                                                {cat.ticket_number && (
                                                                    <span className="text-xs font-mono text-gray-400">#{cat.ticket_number}</span>
                                                                )}
                                                            </div>

                                                            <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                                                                {cat.items && (
                                                                    <div className="flex items-start gap-2">
                                                                        <Wrench size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <p className="text-xs text-gray-400 mb-0.5">Items</p>
                                                                            <p className="text-sm text-gray-700">{cat.items}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {cat.vendor && (
                                                                    <div className="flex items-start gap-2">
                                                                        <User size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <p className="text-xs text-gray-400 mb-0.5">Vendor / Technician</p>
                                                                            <p className="text-sm text-gray-700">{cat.vendor}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {cat.comments && (
                                                                    <div className="flex items-start gap-2">
                                                                        <MessageSquare size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <p className="text-xs text-gray-400 mb-0.5">Comments</p>
                                                                            <p className="text-sm text-gray-700">{cat.comments}</p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {cat.feedbacks?.length > 0 && (
                                                                    <div className="border-t border-gray-100 pt-3 mt-1">
                                                                        <p className="text-xs font-semibold text-gray-500 mb-2">Your Feedback</p>
                                                                        {cat.feedbacks.map((fb, i) => (
                                                                            <div key={i} className="bg-green-50 border border-green-100 rounded-lg p-3 space-y-1.5">
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className={`text-xs font-medium ${fb.issueResolved === "Yes" ? "text-green-700" : "text-red-600"}`}>
                                                                                        {fb.issueResolved === "Yes" ? "Issue Resolved" : "Issue Not Resolved"}
                                                                                    </span>
                                                                                    {fb.ratings && <StarRating value={parseInt(fb.ratings)} />}
                                                                                </div>
                                                                                {fb.suggestions && (
                                                                                    <p className="text-xs text-gray-600 italic">"{fb.suggestions}"</p>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* No updates yet */}
                        {(!complaint.categories || complaint.categories.length === 0) && (
                            <div className="card">
                                <div className="card-body text-center py-10">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                                        <Clock size={22} className="text-blue-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Awaiting Assignment</p>
                                    <p className="text-xs text-gray-400">Our team will review your request and assign a technician shortly.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
